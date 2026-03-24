import { createAmbientBackdrop } from "../../components/AmbientBackdrop/index.js";
import { createCountdownOverlay } from "../../components/CountdownOverlay/index.js";
import { createDragObject } from "../../components/DragObject/index.js";
import { createHeaderHUD } from "../../components/HeaderHUD/index.js";
import { createPraiseToast } from "../../components/PraiseToast/index.js";
import { createScoreZone } from "../../components/ScoreZone/index.js";
import {
  getCountdownMessage,
  getPraiseMessage,
  getVoiceCountdownMessage,
  getVoicePraiseMessage
} from "../../state/gameState.js";
import { wait } from "../../utils/transitions.js";

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function shuffle(list) {
  const next = [...list];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

function distanceBetween(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.hypot(dx, dy);
}

function getVisualFacingFromMotion(motionX) {
  return motionX >= 0 ? -1 : 1;
}

function getEntityWidth(stage, isBoss, themeId) {
  if (isBoss) {
    return stage.clientWidth > 1100 ? 720 : 560;
  }
  if (themeId === "train") {
    return stage.clientWidth > 1100 ? 196 : 164;
  }
  return stage.clientWidth > 1100 ? 182 : 150;
}

function getPlayBounds(host, entityWidth, themeId) {
  const safeLeft = Math.max(host.clientWidth * 0.26, entityWidth * 0.54 + 24);
  const safeRight = host.clientWidth - entityWidth * 0.54 - 28;
  const safeTop = themeId === "train"
    ? Math.max(168, entityWidth * 0.24 + 84)
    : Math.max(178, entityWidth * 0.24 + 92);
  const safeBottom = host.clientHeight - entityWidth * 0.24 - 26;

  return {
    minX: safeLeft,
    maxX: safeRight,
    minY: safeTop,
    maxY: safeBottom
  };
}

function buildSpreadSlots(host, entityWidth, themeId, isBoss) {
  const bounds = getPlayBounds(host, entityWidth, themeId);

  if (isBoss) {
    return [{
      x: clamp((bounds.minX + bounds.maxX) * 0.58, bounds.minX, bounds.maxX),
      y: clamp((bounds.minY + bounds.maxY) * 0.56, bounds.minY, bounds.maxY)
    }];
  }

  const cols = host.clientWidth > 900 ? 3 : 2;
  const rows = host.clientHeight > 620 ? 3 : 2;
  const slots = [];
  const stepX = cols === 1 ? 0 : (bounds.maxX - bounds.minX) / (cols - 1);
  const stepY = rows === 1 ? 0 : (bounds.maxY - bounds.minY) / (rows - 1);

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const x = bounds.minX + stepX * col;
      const y = bounds.minY + stepY * row;
      slots.push({
        x: clamp(x + randomBetween(-26, 26), bounds.minX, bounds.maxX),
        y: clamp(y + randomBetween(-22, 22), bounds.minY, bounds.maxY)
      });
    }
  }

  return shuffle(slots);
}

function createEntryPosition(stage, slot, entityWidth, order) {
  return {
    x: stage.clientWidth + entityWidth * (0.78 + order * 0.24),
    y: clamp(slot.y + randomBetween(-34, 34), 120, stage.clientHeight - 80)
  };
}

function createEntity({
  objectData,
  stage,
  slot,
  order,
  isBoss,
  isTarget,
  themeId
}) {
  const component = createDragObject({ data: objectData, isBoss, isTarget });
  const width = getEntityWidth(stage, isBoss, themeId);
  const start = createEntryPosition(stage, slot, width, order);
  component.element.style.width = `${width}px`;
  component.setPosition(start.x, start.y, 0, -1);
  stage.append(component.element);

  return {
    data: objectData,
    component,
    x: start.x,
    y: start.y,
    anchorX: slot.x,
    anchorY: slot.y,
    targetX: slot.x,
    targetY: slot.y,
    width,
    facing: -1,
    vx: 0,
    vy: 0,
    entryDelayMs: order * 120,
    speed: isBoss
      ? (themeId === "train" ? 120 : 104)
      : (themeId === "train" ? 102 : 88),
    driftRadiusX: isBoss ? 24 : randomBetween(18, 34),
    driftRadiusY: isBoss ? 18 : randomBetween(12, 28),
    driftPhase: randomBetween(0, Math.PI * 2),
    driftRate: randomBetween(0.7, 1.15),
    baseRotation: themeId === "train" ? randomBetween(-1.4, 1.4) : randomBetween(-4, 4),
    dragging: false,
    cleared: false
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
      <span>&#52376;&#51020;</span>
      <span>&#12399;&#12376;&#12417;</span>
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

  let timeLeft = 60;
  let intervalId = null;
  let animationId = null;
  let spawnTimerId = null;
  let destroyed = false;
  let resolved = false;
  let activeDrag = null;
  let lastCountdownVoiceAt = null;
  let lastTimestamp = performance.now();
  const initialWaveSize = isBoss ? 1 : 5;
  const recurringWaveSize = isBoss ? 1 : 3;
  const entities = [];

  restartButton?.addEventListener("click", () => {
    if (resolved) {
      return;
    }
    resolved = true;
    audioManager.playSfx("select", 0.34);
    onRestart?.();
  });

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
    const length = Math.hypot(dx, dy);
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);

    trail.classList.add("is-visible");
    trail.style.width = `${length}px`;
    trail.style.left = `${zoneX}px`;
    trail.style.top = `${zoneY}px`;
    trail.style.transform = `rotate(${angle}deg)`;
  }

  function setEntityVisual(entity, extraRotation = 0) {
    const sway = Math.sin(performance.now() / 780 * entity.driftRate + entity.driftPhase) * 1.4;
    entity.component.setPosition(
      entity.x,
      entity.y,
      entity.baseRotation + sway + extraRotation,
      entity.facing
    );
  }

  function removeEntity(entity) {
    const index = entities.indexOf(entity);
    if (index >= 0) {
      entities.splice(index, 1);
    }
    entity.component.element.remove();
  }

  function clearWave() {
    entities.slice().forEach((entity) => {
      if (!entity.dragging && !entity.cleared) {
        removeEntity(entity);
      }
    });
  }

  function buildWaveObjects(size) {
    const distractors = theme.objects.filter((object) => object.id !== target.id);
    const wave = [target];
    for (let i = 1; i < size; i += 1) {
      wave.push(distractors[Math.floor(Math.random() * distractors.length)]);
    }
    return shuffle(wave);
  }

  function spawnWave(size) {
    if (destroyed || resolved) {
      return;
    }

    const width = getEntityWidth(stage, isBoss, theme.id);
    const slots = buildSpreadSlots(stage, width, theme.id, isBoss).slice(0, size);
    const waveObjects = buildWaveObjects(size);

    slots.forEach((slot, index) => {
      const objectData = waveObjects[index];
      const entity = createEntity({
        objectData,
        stage,
        slot,
        order: index,
        isBoss: isBoss && objectData.id === target.id,
        isTarget: objectData.id === target.id,
        themeId: theme.id
      });

      entities.push(entity);
      setEntityVisual(entity);

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
    });
  }

  function scheduleWave(size = recurringWaveSize) {
    if (destroyed || resolved) {
      return;
    }

    spawnTimerId = window.setTimeout(() => {
      if (destroyed || resolved) {
        return;
      }
      if (activeDrag) {
        scheduleWave(size);
        return;
      }
      clearWave();
      spawnWave(size);
      scheduleWave(recurringWaveSize);
    }, 5000);
  }

  function clearTimers() {
    window.clearTimeout(spawnTimerId);
    window.clearInterval(intervalId);
    window.cancelAnimationFrame(animationId);
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

  function startRoundSuccessFlow() {
    resolved = true;
    praise.show(getPraiseMessage());
    audioManager.playSfx("success", 0.52);
    audioManager.speak(getVoicePraiseMessage(), { pitch: 1.18, rate: 1 });
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

  function breakDrag(entity) {
    entity.dragging = false;
    entity.component.setSelected(false);
    entity.component.snap();
    entity.targetX = entity.anchorX;
    entity.targetY = entity.anchorY;
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

    entity.targetX = entity.anchorX;
    entity.targetY = entity.anchorY;
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
    entity.x = clamp(event.clientX - rect.left, entity.width * 0.38, rect.width - entity.width * 0.38);
    entity.y = clamp(event.clientY - rect.top, entity.width * 0.2 + 70, rect.height - entity.width * 0.22);
    zone.highlight(zone.containsPoint(event.clientX, event.clientY));
    syncTrail(entity);
    setEntityVisual(entity, 0);
  }

  function steerEntity(entity, deltaSeconds, timestamp) {
    const bounds = getPlayBounds(element, entity.width, theme.id);

    if (entity.entryDelayMs > 0) {
      entity.entryDelayMs = Math.max(0, entity.entryDelayMs - deltaSeconds * 1000);
      return;
    }

    const floatX = Math.cos(timestamp / 1000 * entity.driftRate + entity.driftPhase) * entity.driftRadiusX;
    const floatY = Math.sin(timestamp / 1100 * entity.driftRate + entity.driftPhase) * entity.driftRadiusY;
    const desiredX = clamp(entity.targetX + floatX, bounds.minX, bounds.maxX);
    const desiredY = clamp(entity.targetY + floatY, bounds.minY, bounds.maxY);
    const dx = desiredX - entity.x;
    const dy = desiredY - entity.y;
    const distance = Math.hypot(dx, dy) || 1;

    let avoidX = 0;
    let avoidY = 0;
    entities.forEach((other) => {
      if (other === entity || other.dragging || other.cleared || other.entryDelayMs > 0) {
        return;
      }

      const safeDistance = (entity.width + other.width) * 0.58;
      const localDx = entity.x - other.x;
      const localDy = entity.y - other.y;
      const localDistance = Math.hypot(localDx, localDy) || 1;

      if (localDistance < safeDistance) {
        const pressure = (safeDistance - localDistance) / safeDistance;
        avoidX += (localDx / localDistance) * pressure * 54;
        avoidY += (localDy / localDistance) * pressure * 36;
      }
    });

    entity.vx = dx / distance * entity.speed + avoidX;
    entity.vy = dy / distance * entity.speed + avoidY;
    entity.x += entity.vx * deltaSeconds;
    entity.y += entity.vy * deltaSeconds;
    entity.x = clamp(entity.x, bounds.minX - entity.width * 0.72, element.clientWidth + entity.width * 0.82);
    entity.y = clamp(entity.y, bounds.minY - entity.width * 0.2, bounds.maxY + entity.width * 0.2);

    if (Math.abs(entity.vx) > 1.2) {
      entity.facing = getVisualFacingFromMotion(entity.vx);
    }

    const bank = theme.id === "train"
      ? clamp(entity.vy * 0.03, -4, 4)
      : clamp(entity.vy * 0.07, -10, 10);
    setEntityVisual(entity, bank);
  }

  function tick(timestamp) {
    if (destroyed) {
      return;
    }

    const deltaSeconds = (timestamp - lastTimestamp) / 1000;
    lastTimestamp = timestamp;

    entities.forEach((entity) => {
      if (entity.cleared || entity.dragging) {
        return;
      }
      steerEntity(entity, deltaSeconds, timestamp);
    });

    animationId = window.requestAnimationFrame(tick);
  }

  updateHud();
  spawnWave(initialWaveSize);
  scheduleWave();
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
