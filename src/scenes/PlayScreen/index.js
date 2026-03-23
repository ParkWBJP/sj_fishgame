import { createAmbientBackdrop } from "../../components/AmbientBackdrop/index.js";
import { createCountdownOverlay } from "../../components/CountdownOverlay/index.js";
import { createDragObject } from "../../components/DragObject/index.js";
import { createHeaderHUD } from "../../components/HeaderHUD/index.js";
import { createPraiseToast } from "../../components/PraiseToast/index.js";
import { createScoreZone } from "../../components/ScoreZone/index.js";
import { getCountdownMessage, getPraiseMessage, getVoiceCountdownMessage, getVoicePraiseMessage } from "../../state/gameState.js";
import { wait } from "../../utils/transitions.js";

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function chooseSpawnBounds(width, height) {
  const side = Math.floor(Math.random() * 4);
  const margin = 120;
  if (side === 0) {
    return { x: randomBetween(width * 0.36, width - 80), y: -margin, vx: randomBetween(-20, 20), vy: randomBetween(34, 60) };
  }
  if (side === 1) {
    return { x: width + margin, y: randomBetween(140, height - 80), vx: randomBetween(-60, -38), vy: randomBetween(-18, 20) };
  }
  if (side === 2) {
    return { x: randomBetween(width * 0.36, width - 80), y: height + margin, vx: randomBetween(-20, 20), vy: randomBetween(-54, -34) };
  }
  return { x: -margin, y: randomBetween(140, height - 80), vx: randomBetween(38, 60), vy: randomBetween(-20, 18) };
}

function createEntity(objectData, stage, isBoss, isTarget) {
  const component = createDragObject({ data: objectData, isBoss, isTarget });
  const width = isBoss ? (stage.clientWidth > 1100 ? 280 : 220) : stage.clientWidth > 1100 ? 160 : 130;
  component.element.style.width = `${width}px`;
  stage.append(component.element);

  const bounds = chooseSpawnBounds(stage.clientWidth, stage.clientHeight);
  return {
    data: objectData,
    component,
    x: bounds.x,
    y: bounds.y,
    baseRotation: randomBetween(-6, 6),
    vx: bounds.vx,
    vy: bounds.vy,
    wobbleSeed: randomBetween(0, Math.PI * 2),
    dragging: false,
    cleared: false,
    width
  };
}

export function createPlayScreen({
  gameState,
  onRoundWin,
  onRoundTimeout,
  onBossWin,
  onBossTimeout,
  onRestart,
  audioManager
}) {
  const current = gameState.getState();
  const isBoss = current.phase === "boss";
  const target = current.currentTarget;
  const theme = current.theme;
  const countdownMessage = getCountdownMessage();
  const element = document.createElement("section");
  element.className = `scene scene--play scene--${theme.id}`;
  element.innerHTML = `
    <div class="play-screen__ambient"></div>
    <div class="play-screen__left-rail"></div>
    <div class="play-screen__stage"></div>
    <div class="play-screen__trail"></div>
    <button class="play-screen__restart" type="button">
      <span>처음</span>
      <span>はじめ</span>
    </button>
  `;

  const ambientHost = element.querySelector(".play-screen__ambient");
  const stage = element.querySelector(".play-screen__stage");
  const trail = element.querySelector(".play-screen__trail");
  const leftRail = element.querySelector(".play-screen__left-rail");
  const restartButton = element.querySelector(".play-screen__restart");
  const ambient = createAmbientBackdrop(theme.id);

  const hud = createHeaderHUD();
  const countdown = createCountdownOverlay();
  const praise = createPraiseToast();
  const zone = createScoreZone(theme.id);

  ambientHost.append(ambient.element);
  leftRail.append(zone.element);
  element.append(hud.element, countdown.element, praise.element);
  restartButton?.addEventListener("click", () => {
    if (resolved) {
      return;
    }
    resolved = true;
    audioManager.playSfx("select", 0.34);
    onRestart?.();
  });

  let timeLeft = 60;
  let intervalId = null;
  let animationId = null;
  let spawnTimerId = null;
  let destroyed = false;
  let resolved = false;
  let lastTimestamp = performance.now();
  let lastCountdownVoiceAt = null;
  let activeDrag = null;
  const maxObjects = isBoss ? 3 : 8;
  const entities = [];

  function updateHud() {
    hud.update({
      timeLeft,
      totalRounds: current.totalRounds,
      caughtCount: current.caughtObjects.length,
      roundIndex: current.roundIndex,
      target,
      themeLabel: theme.label
    });
    countdown.update(timeLeft, countdownMessage);
  }

  function syncTrail(entity) {
    if (!entity) {
      trail.classList.remove("is-visible");
      return;
    }
    const zoneRect = zone.element.getBoundingClientRect();
    const zoneX = zoneRect.left + zoneRect.width / 2;
    const zoneY = zoneRect.top + zoneRect.height / 2;
    const objectRect = entity.component.element.getBoundingClientRect();
    const objectX = objectRect.left + objectRect.width / 2;
    const objectY = objectRect.top + objectRect.height / 2;
    const dx = objectX - zoneX;
    const dy = objectY - zoneY;
    const length = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);
    trail.classList.add("is-visible");
    trail.style.width = `${length}px`;
    trail.style.left = `${zoneX}px`;
    trail.style.top = `${zoneY}px`;
    trail.style.transform = `rotate(${angle}deg)`;
  }

  function markEntityVisual(entity) {
    const wobble = Math.sin(performance.now() / 580 + entity.wobbleSeed) * 4;
    entity.component.setPosition(entity.x, entity.y, entity.baseRotation + wobble);
  }

  function removeEntity(entity) {
    const index = entities.indexOf(entity);
    if (index >= 0) {
      entities.splice(index, 1);
    }
    entity.component.element.remove();
  }

  function spawn(forceTarget = false) {
    if (destroyed || resolved || entities.length >= maxObjects) {
      return;
    }

    const distractors = theme.objects.filter((object) => object.id !== target.id);
    const bossDistractors = distractors.slice(0, 3);
    const objectData = forceTarget
      ? target
      : isBoss
        ? (Math.random() < 0.6 ? target : bossDistractors[Math.floor(Math.random() * bossDistractors.length)])
        : (Math.random() < 0.38 ? target : distractors[Math.floor(Math.random() * distractors.length)]);

    const entity = createEntity(objectData, stage, isBoss && objectData.id === target.id, objectData.id === target.id);
    entities.push(entity);

    entity.component.element.addEventListener("pointerdown", (event) => {
      if (resolved) {
        return;
      }

      if (entity.data.id !== target.id) {
        entity.component.shake();
        audioManager.playSfx("error", 0.35);
        return;
      }

      entity.dragging = true;
      entity.component.setSelected(true);
      activeDrag = {
        entity,
        pointerId: event.pointerId,
        lastX: event.clientX,
        lastY: event.clientY,
        lastTime: performance.now()
      };
      event.preventDefault();
    });
  }

  function scheduleSpawn() {
    if (destroyed || resolved) {
      return;
    }

    const targetVisible = entities.some((entity) => entity.data.id === target.id);
    const amount = isBoss ? 1 : Math.random() < 0.45 ? 2 : 1;
    for (let i = 0; i < amount; i += 1) {
      spawn(!targetVisible && i === 0);
    }

    spawnTimerId = window.setTimeout(scheduleSpawn, randomBetween(1200, 2100));
  }

  function startRoundSuccessFlow() {
    resolved = true;
    praise.show(getPraiseMessage());
    audioManager.playSfx("success", 0.52);
    audioManager.speak(getVoicePraiseMessage(), { pitch: 1.18, rate: 1 });
  }

  function clearTimers() {
    window.clearTimeout(spawnTimerId);
    window.clearInterval(intervalId);
    window.cancelAnimationFrame(animationId);
  }

  async function finishRoundSuccess() {
    startRoundSuccessFlow();
    await wait(850);
    if (destroyed) {
      return;
    }
    if (isBoss) {
      onBossWin?.();
      return;
    }
    onRoundWin?.(target);
  }

  function finishTimeout() {
    if (resolved) {
      return;
    }
    resolved = true;
    audioManager.playSfx("error", 0.32);
    if (isBoss) {
      onBossTimeout?.();
      return;
    }
    onRoundTimeout?.();
  }

  function breakDrag(entity) {
    entity.dragging = false;
    entity.component.setSelected(false);
    entity.component.snap();
    entity.vx = randomBetween(-50, 50);
    entity.vy = randomBetween(-40, 40);
    activeDrag = null;
    zone.highlight(false);
    syncTrail(null);
    audioManager.playSfx("snap", 0.4);
  }

  function releaseDrag(event) {
    if (!activeDrag || activeDrag.pointerId !== event.pointerId) {
      return;
    }

    const { entity } = activeDrag;
    entity.dragging = false;
    entity.component.setSelected(false);
    const isInZone = zone.containsPoint(event.clientX, event.clientY);
    zone.highlight(false);
    syncTrail(null);
    activeDrag = null;

    if (isInZone) {
      entity.cleared = true;
      entity.component.fadeOut();
      finishRoundSuccess();
      return;
    }

    entity.vx = randomBetween(-40, 40);
    entity.vy = randomBetween(-30, 30);
  }

  function handlePointerMove(event) {
    if (!activeDrag) {
      return;
    }

    const { entity } = activeDrag;
    const now = performance.now();
    const elapsed = Math.max(16, now - activeDrag.lastTime);
    const speed = Math.hypot(event.clientX - activeDrag.lastX, event.clientY - activeDrag.lastY) / elapsed;
    activeDrag.lastX = event.clientX;
    activeDrag.lastY = event.clientY;
    activeDrag.lastTime = now;

    if (speed > 1.45) {
      breakDrag(entity);
      return;
    }

    const rect = element.getBoundingClientRect();
    entity.x = clamp(event.clientX - rect.left, 56, rect.width - 56);
    entity.y = clamp(event.clientY - rect.top, 88, rect.height - 56);
    zone.highlight(zone.containsPoint(event.clientX, event.clientY));
    syncTrail(entity);
    markEntityVisual(entity);
  }

  function tick(timestamp) {
    if (destroyed) {
      return;
    }
    const deltaSeconds = (timestamp - lastTimestamp) / 1000;
    lastTimestamp = timestamp;
    const width = element.clientWidth;
    const height = element.clientHeight;
    const minX = width * 0.3;
    const maxX = width - 80;
    const minY = 140;
    const maxY = height - 60;

    entities.forEach((entity) => {
      if (entity.dragging || entity.cleared) {
        return;
      }
      entity.x += entity.vx * deltaSeconds;
      entity.y += entity.vy * deltaSeconds;

      if (entity.x < minX || entity.x > maxX) {
        entity.vx *= -1;
      }
      if (entity.y < minY || entity.y > maxY) {
        entity.vy *= -1;
      }
      entity.x = clamp(entity.x, minX, maxX);
      entity.y = clamp(entity.y, minY, maxY);
      markEntityVisual(entity);
    });

    animationId = window.requestAnimationFrame(tick);
  }

  updateHud();
  for (let i = 0; i < (isBoss ? 2 : 4); i += 1) {
    spawn(i === 0);
  }
  scheduleSpawn();
  animationId = window.requestAnimationFrame(tick);

  intervalId = window.setInterval(() => {
    timeLeft -= 1;
    updateHud();
    if (timeLeft <= 10) {
      audioManager.playSfx("countdown", 0.16);
      if (lastCountdownVoiceAt !== 10 && timeLeft === 10) {
        lastCountdownVoiceAt = 10;
        audioManager.speak(getVoiceCountdownMessage(), { rate: 0.92, pitch: 1.02 });
      }
    }
    if (timeLeft <= 0) {
      clearTimers();
      finishTimeout();
    }
  }, 1000);

  window.addEventListener("pointermove", handlePointerMove);
  window.addEventListener("pointerup", releaseDrag);
  window.addEventListener("pointercancel", releaseDrag);

  return {
    element,
    destroy() {
      destroyed = true;
      clearTimers();
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", releaseDrag);
      window.removeEventListener("pointercancel", releaseDrag);
    }
  };
}
