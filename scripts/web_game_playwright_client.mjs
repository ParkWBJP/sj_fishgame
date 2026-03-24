import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

function parseArgs(argv) {
  const args = {
    url: null,
    iterations: 3,
    pauseMs: 250,
    headless: true,
    screenshotDir: "output/web-game",
    actionsFile: null,
    actionsJson: null,
    click: null,
    clickSelector: null
  };

  for (let index = 2; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = argv[index + 1];

    if (arg === "--url" && next) {
      args.url = next;
      index += 1;
    } else if (arg === "--iterations" && next) {
      args.iterations = Number.parseInt(next, 10);
      index += 1;
    } else if (arg === "--pause-ms" && next) {
      args.pauseMs = Number.parseInt(next, 10);
      index += 1;
    } else if (arg === "--headless" && next) {
      args.headless = next !== "0" && next !== "false";
      index += 1;
    } else if (arg === "--screenshot-dir" && next) {
      args.screenshotDir = next;
      index += 1;
    } else if (arg === "--actions-file" && next) {
      args.actionsFile = next;
      index += 1;
    } else if (arg === "--actions-json" && next) {
      args.actionsJson = next;
      index += 1;
    } else if (arg === "--click" && next) {
      const parts = next.split(",").map((value) => Number.parseFloat(value.trim()));
      if (parts.length === 2 && parts.every((value) => Number.isFinite(value))) {
        args.click = { x: parts[0], y: parts[1] };
      }
      index += 1;
    } else if (arg === "--click-selector" && next) {
      args.clickSelector = next;
      index += 1;
    }
  }

  if (!args.url) {
    throw new Error("--url is required");
  }

  return args;
}

const buttonNameToKey = {
  up: "ArrowUp",
  down: "ArrowDown",
  left: "ArrowLeft",
  right: "ArrowRight",
  enter: "Enter",
  space: "Space",
  a: "KeyA",
  b: "KeyB"
};

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function ensureDir(targetPath) {
  fs.mkdirSync(targetPath, { recursive: true });
}

function makeVirtualTimeShim() {
  return `(() => {
    const pending = new Set();
    const origSetTimeout = window.setTimeout.bind(window);
    const origSetInterval = window.setInterval.bind(window);
    const origRequestAnimationFrame = window.requestAnimationFrame.bind(window);

    window.__vt_pending = pending;

    window.setTimeout = (fn, t, ...rest) => {
      const task = {};
      pending.add(task);
      return origSetTimeout(() => {
        pending.delete(task);
        fn(...rest);
      }, t);
    };

    window.setInterval = (fn, t, ...rest) => {
      const task = {};
      pending.add(task);
      return origSetInterval(() => {
        fn(...rest);
      }, t);
    };

    window.requestAnimationFrame = (fn) => {
      const task = {};
      pending.add(task);
      return origRequestAnimationFrame((ts) => {
        pending.delete(task);
        fn(ts);
      });
    };

    window.advanceTime = (ms) => {
      return new Promise((resolve) => {
        const start = performance.now();
        function step(now) {
          if (now - start >= ms) return resolve();
          origRequestAnimationFrame(step);
        }
        origRequestAnimationFrame(step);
      });
    };

    window.__drainVirtualTimePending = () => pending.size;
  })();`;
}

async function getCanvasHandle(page) {
  const handle = await page.evaluateHandle(() => {
    let best = null;
    let bestArea = 0;
    for (const canvas of document.querySelectorAll("canvas")) {
      const area = (canvas.width || canvas.clientWidth || 0) * (canvas.height || canvas.clientHeight || 0);
      if (area > bestArea) {
        bestArea = area;
        best = canvas;
      }
    }
    return best;
  });
  return handle.asElement();
}

async function captureCanvasPngBase64(canvas) {
  return canvas.evaluate((value) => {
    if (!value || typeof value.toDataURL !== "function") {
      return "";
    }
    const data = value.toDataURL("image/png");
    const index = data.indexOf(",");
    return index === -1 ? "" : data.slice(index + 1);
  });
}

async function isCanvasTransparent(canvas) {
  if (!canvas) {
    return true;
  }
  return canvas.evaluate((value) => {
    try {
      const width = value.width || value.clientWidth || 0;
      const height = value.height || value.clientHeight || 0;
      if (!width || !height) {
        return true;
      }
      const size = Math.max(1, Math.min(16, width, height));
      const probe = document.createElement("canvas");
      probe.width = size;
      probe.height = size;
      const context = probe.getContext("2d");
      if (!context) {
        return true;
      }
      context.drawImage(value, 0, 0, size, size);
      const data = context.getImageData(0, 0, size, size).data;
      for (let index = 3; index < data.length; index += 4) {
        if (data[index] !== 0) {
          return false;
        }
      }
      return true;
    } catch {
      return false;
    }
  });
}

async function captureScreenshot(page, canvas, outPath) {
  let buffer = null;
  let base64 = canvas ? await captureCanvasPngBase64(canvas) : "";
  if (base64) {
    buffer = Buffer.from(base64, "base64");
    const transparent = canvas ? await isCanvasTransparent(canvas) : false;
    if (transparent) {
      buffer = null;
    }
  }
  if (!buffer && canvas) {
    try {
      buffer = await canvas.screenshot({ type: "png" });
    } catch {
      buffer = null;
    }
  }
  if (!buffer) {
    const bbox = canvas ? await canvas.boundingBox() : null;
    if (bbox) {
      buffer = await page.screenshot({
        type: "png",
        omitBackground: false,
        clip: bbox,
        animations: "disabled",
        timeout: 5000
      });
    } else {
      try {
        buffer = await page.locator("#app").screenshot({
          type: "png",
          animations: "disabled",
          timeout: 5000
        });
      } catch {
        buffer = await page.screenshot({
          type: "png",
          omitBackground: false,
          animations: "disabled",
          timeout: 5000
        });
      }
    }
  }
  fs.writeFileSync(outPath, buffer);
}

class ConsoleErrorTracker {
  constructor() {
    this.seen = new Set();
    this.errors = [];
  }

  ingest(error) {
    const key = JSON.stringify(error);
    if (this.seen.has(key)) {
      return;
    }
    this.seen.add(key);
    this.errors.push(error);
  }

  drain() {
    const next = [...this.errors];
    this.errors = [];
    return next;
  }
}

async function doChoreography(page, canvas, steps) {
  for (const step of steps) {
    const buttons = new Set(step.buttons || []);
    for (const button of buttons) {
      if (button === "left_mouse_button" || button === "right_mouse_button") {
        const bbox = canvas ? await canvas.boundingBox() : null;
        if (!bbox) {
          continue;
        }
        const x = typeof step.mouse_x === "number" ? step.mouse_x : bbox.width / 2;
        const y = typeof step.mouse_y === "number" ? step.mouse_y : bbox.height / 2;
        await page.mouse.move(bbox.x + x, bbox.y + y);
        await page.mouse.down({ button: button === "left_mouse_button" ? "left" : "right" });
      } else if (buttonNameToKey[button]) {
        await page.keyboard.down(buttonNameToKey[button]);
      }
    }

    const frames = step.frames || 1;
    for (let index = 0; index < frames; index += 1) {
      await page.evaluate(async () => {
        if (typeof window.advanceTime === "function") {
          await window.advanceTime(1000 / 60);
        }
      });
    }

    for (const button of buttons) {
      if (button === "left_mouse_button" || button === "right_mouse_button") {
        await page.mouse.up({ button: button === "left_mouse_button" ? "left" : "right" });
      } else if (buttonNameToKey[button]) {
        await page.keyboard.up(buttonNameToKey[button]);
      }
    }
  }
}

async function main() {
  const args = parseArgs(process.argv);
  ensureDir(args.screenshotDir);

  const browser = await chromium.launch({
    headless: args.headless,
    args: ["--use-gl=angle", "--use-angle=swiftshader"]
  });
  const page = await browser.newPage();
  const consoleErrors = new ConsoleErrorTracker();

  page.on("console", (msg) => {
    if (msg.type() !== "error") {
      return;
    }
    consoleErrors.ingest({ type: "console.error", text: msg.text() });
  });
  page.on("pageerror", (error) => {
    consoleErrors.ingest({ type: "pageerror", text: String(error) });
  });

  await page.addInitScript({ content: makeVirtualTimeShim() });
  await page.goto(args.url, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(500);
  await page.evaluate(() => {
    window.dispatchEvent(new Event("resize"));
  });

  let canvas = await getCanvasHandle(page);

  if (args.clickSelector) {
    try {
      await page.locator(args.clickSelector).click({ timeout: 5000, force: true });
      await page.waitForTimeout(250);
    } catch (error) {
      console.warn("Failed to click selector", args.clickSelector, error);
    }
  }

  let steps = null;
  if (args.actionsFile) {
    const raw = fs.readFileSync(args.actionsFile, "utf-8");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      steps = parsed;
    }
    if (parsed && Array.isArray(parsed.steps)) {
      steps = parsed.steps;
    }
  } else if (args.actionsJson) {
    const parsed = JSON.parse(args.actionsJson);
    if (Array.isArray(parsed)) {
      steps = parsed;
    }
    if (parsed && Array.isArray(parsed.steps)) {
      steps = parsed.steps;
    }
  } else if (args.click) {
    steps = [{
      buttons: ["left_mouse_button"],
      frames: 2,
      mouse_x: args.click.x,
      mouse_y: args.click.y
    }];
  }

  if (!steps) {
    throw new Error("Actions are required. Use --actions-file, --actions-json, or --click.");
  }

  for (let iteration = 0; iteration < args.iterations; iteration += 1) {
    if (!canvas) {
      canvas = await getCanvasHandle(page);
    }

    await doChoreography(page, canvas, steps);
    await sleep(args.pauseMs);

    const screenshotPath = path.join(args.screenshotDir, `shot-${iteration}.png`);
    try {
      await captureScreenshot(page, canvas, screenshotPath);
    } catch (error) {
      fs.writeFileSync(
        path.join(args.screenshotDir, `shot-${iteration}.txt`),
        `Screenshot failed: ${String(error)}`
      );
    }

    const text = await page.evaluate(() => {
      if (typeof window.render_game_to_text === "function") {
        return window.render_game_to_text();
      }
      return null;
    });
    if (text) {
      fs.writeFileSync(path.join(args.screenshotDir, `state-${iteration}.json`), text);
    }

    const freshErrors = consoleErrors.drain();
    if (freshErrors.length) {
      fs.writeFileSync(
        path.join(args.screenshotDir, `errors-${iteration}.json`),
        JSON.stringify(freshErrors, null, 2)
      );
      break;
    }
  }

  await browser.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
