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

const ROUND_DURATION_SECONDS = 60;
const INITIAL_WAVE_SIZE = 6;
const FRAME_STEP_MS = 1000 / 60;
const SPAWN_EDGES = [
  "left",
  "right",
  "top",
  "top-left",
  "top-right"
];

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function shuffle(list) {
  const next = [...list];
  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
  }
  return next;
}

function isFinitePosition(value) {
  return Number.isFinite(value) && !Number.isNaN(value);
}

function hasRenderableStageBounds(stage) {
  return stage.isConnected && stage.clientWidth > 0 && stage.clientHeight > 0;
}

function getVisualFacingFromMotion(motionX) {
  return motionX >= 0 ? 1 : -1;
}

function getEntityWidth(stage, isBoss, themeId) {
  if (isBoss) {
    if (themeId === "train") {
      return stage.clientWidth > 1100 ? 520 : 430;
    }
    return stage.clientWidth > 1100 ? 460 : 380;
  }

  if (themeId === "train") {
    return stage.clientWidth > 1100 ? 176 : 148;
  }

  return stage.clientWidth > 1100 ? 138 : 118;
}

function getPlayBounds(host, entityWidth, themeId) {
  const safeLeft = Math.max(host.clientWidth * 0.14, entityWidth * 0.52 + 24);
  const safeRight = host.clientWidth - entityWidth * 0.5 - 32;
  const safeTop = themeId === "train"
    ? Math.max(148, entityWidth * 0.2 + 70)
    : Math.max(158, entityWidth * 0.2 + 82);
  const safeBottom = Math.max(
    safeTop + entityWidth * 0.9,
    host.clientHeight - entityWidth * 0.28 - 74
  );

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
      x: clamp(bounds.minX + (bounds.maxX - bounds.minX) * 0.62, bounds.minX, bounds.maxX),
      y: clamp(bounds.minY + (bounds.maxY - bounds.minY) * 0.48, bounds.minY, bounds.maxY)
    }];
  }

  const cols = host.clientWidth > 1100 ? 4 : 3;
  const rows = host.clientHeight > 650 ? 2 : 2;
  const slots = [];
  const stepX = cols === 1 ? 0 : (bounds.maxX - bounds.minX) / (cols - 1);
  const stepY = rows === 1 ? 0 : (bounds.maxY - bounds.minY) / (rows - 1);

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      slots.push({
        x: clamp(bounds.minX + stepX * col + randomBetween(-22, 22), bounds.minX, bounds.maxX),
        y: clamp(bounds.minY + stepY * row + randomBetween(-18, 18), bounds.minY, bounds.maxY)
      });
    }
  }

  return shuffle(slots);
}

function buildSpawnEdges(size) {
  const edges = shuffle(SPAWN_EDGES);
  const result = [];

  for (let index = 0; index < size; index += 1) {
    result.push(edges[index % edges.length]);
  }

  return result;
}

function createEntryPosition(stage, slot, entityWidth, order, edge) {
  const stageWidth = stage.clientWidth;
  const offset = entityWidth * (0.84 + order * 0.08) + 24;
  const clampedX = clamp(slot.x + randomBetween(-72, 72), entityWidth * 0.42, stageWidth - entityWidth * 0.42);
  const clampedY = clamp(slot.y + randomBetween(-42, 42), entityWidth * 0.3, stage.clientHeight - entityWidth * 0.3);

  switch (edge) {
    case "left":
      return { x: -offset, y: clampedY };
    case "right":
      return { x: stageWidth + offset, y: clampedY };
    case "top":
      return { x: clampedX, y: -offset };
    case "top-left":
      return { x: -offset, y: -offset * 0.66 };
    case "top-right":
      return { x: stageWidth + offset, y: -offset * 0.66 };
    default:
      return { x: stageWidth + offset, y: clampedY };
  }
}

function releasePointerCaptureSafely(entity, pointerId) {
  try {
    if (entity?.component?.element?.hasPointerCapture?.(pointerId)) {
      entity.component.element.releasePointerCapture(pointerId);
    }
  } catch {
    // Scene teardown can race with pointer capture release on some browsers.
  }
}

function capturePointerSafely(entity, pointerId) {
  try {
    entity?.component?.element?.setPointerCapture?.(pointerId);
  } catch {
    // Synthetic pointer events in browser automation can reject capture.
  }
}

function createEntity({
  objectData,
  stage,
  slot,
  order,
  isBoss,
  isTarget,
  themeId,
  spawnEdge
}) {
  const component = createDragObject({ data: objectData, isBoss, isTarget });
  const width = getEntityWidth(stage, isBoss, themeId);
  const start = createEntryPosition(stage, slot, width, order, spawnEdge);

  if (!isFinitePosition(start.x) || !isFinitePosition(start.y)) {
    return null;
  }

  const facing = getVisualFacingFromMotion(slot.x - start.x);
  component.element.style.width = `${width}px`;
  component.element.dataset.spawnEdge = spawnEdge;

  if (!component.setPosition(start.x, start.y, 0, facing)) {
    return null;
  }

  stage.append(component.element);

  return {
    data: objectData,
    component,
    isBoss,
    isTarget,
    x: start.x,
    y: start.y,
    anchorX: slot.x,
    anchorY: slot.y,
    targetX: slot.x,
    targetY: slot.y,
    width,
    facing,
    vx: 0,
    vy: 0,
    rotation: 0,
    spawnEdge,
    entryDelayMs: order * 100,
    roamCooldownMs: randomBetween(1400, 2800),
    speed: isBoss
      ? (themeId === "train" ? 152 : 138)
      : (themeId === "train" ? 116 : 100),
    driftPhase: randomBetween(0, Math.PI * 2),
    driftRate: randomBetween(0.48, 0.84),
    baseRotation: themeId === "train" ? randomBetween(-1.2, 1.2) : randomBetween(-2.6, 2.6),
    dragging: false,
    cleared: false,
    capturePhase: null,
    captureTimerMs: 0
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
  element.className = `scene scene--play scene--play-refresh scene--${theme.id}`;
  element.innerHTML = `
    <div class="play-screen__ambient"></div>
    <div class="play-screen__stage">
      <div class="play-screen__zone-anchor"></div>
    </div>
    <div class="play-screen__trail"></div>
    <button class="play-screen__restart" type="button">
      <span>처음</span>
      <span>はじめ</span>
    </button>
  `;

  const ambientHost = element.querySelector(".play-screen__ambient");
  const stage = element.querySelector(".play-screen__stage");
  const zoneAnchor = element.querySelector(".play-screen__zone-anchor");
  const trail = element.querySelector(".play-screen__trail");
  const restartButton = element.querySelector(".play-screen__restart");
  const ambient = createAmbientBackdrop(theme.id);

  const hud = createHeaderHUD();
  const countdown = createCountdownOverlay();
  const praise = createPraiseToast();
  const zone = createScoreZone(theme.id);

  ambientHost.append(ambient.element);
  zoneAnchor.append(zone.element);
  element.append(hud.element, countdown.element, praise.element);

  let timeLeft = ROUND_DURATION_SECONDS;
  let animationId = null;
  let layoutWaitId = null;
  let destroyed = false;
  let resolved = false;
  let started = false;
  let activeDrag = null;
  let lastCountdownVoiceAt = null;
  let lastTimestamp = 0;
  let simulationTimeMs = 0;
  let countdownAccumulatorMs = 0;
  const entities = [];
  const recentSpawns = [];

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

  function setEntityVisual(entity) {
    entity.component.setPosition(entity.x, entity.y, entity.rotation, entity.facing);
  }

  function syncTrail(entity) {
    if (!entity) {
      trail.classList.remove("is-visible");
      return;
    }

    const zoneRect = zone.element.getBoundingClientRect();
    const zoneX = zoneRect.left + zoneRect.width * 0.5;
    const zoneY = zoneRect.top + zoneRect.height * 0.42;
    const objectRect = entity.component.element.getBoundingClientRect();
    const objectX = objectRect.left + objectRect.width * 0.5;
    const objectY = objectRect.top + objectRect.height * 0.5;
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

  function removeEntity(entity) {
    const index = entities.indexOf(entity);
    if (index >= 0) {
      entities.splice(index, 1);
    }

    if (activeDrag?.entity === entity) {
      activeDrag = null;
      zone.highlight(false);
      syncTrail(null);
    }

    entity.component.element.remove();
  }

  function clearTimers() {
    window.cancelAnimationFrame(layoutWaitId);
    window.cancelAnimationFrame(animationId);
  }

  function buildWaveObjects(size) {
    if (isBoss) {
      return [target];
    }

    const distractors = shuffle(theme.objects.filter((objectData) => objectData.id !== target.id));
    return shuffle([target, ...distractors.slice(0, Math.max(0, size - 1))]);
  }

  function assignRoamTarget(entity, options = {}) {
    const bounds = getPlayBounds(stage, entity.width, theme.id);
    const leftBias = entity.isBoss ? bounds.minX + (bounds.maxX - bounds.minX) * 0.12 : bounds.minX;
    const topBias = entity.isBoss ? bounds.minY + (bounds.maxY - bounds.minY) * 0.08 : bounds.minY;
    const nextX = options.preferCurrent
      ? clamp(entity.x + randomBetween(-140, 140), leftBias, bounds.maxX)
      : randomBetween(leftBias, bounds.maxX);
    const nextY = options.preferCurrent
      ? clamp(entity.y + randomBetween(-90, 90), topBias, bounds.maxY)
      : randomBetween(topBias, bounds.maxY);

    entity.targetX = clamp(nextX, leftBias, bounds.maxX);
    entity.targetY = clamp(nextY, topBias, bounds.maxY);
    entity.roamCooldownMs = entity.isBoss
      ? randomBetween(1200, 2200)
      : randomBetween(1800, 3400);
  }

  function bindPointerEvents(entity) {
    entity.component.element.addEventListener("pointerdown", (event) => {
      if (resolved || entity.capturePhase) {
        return;
      }

      if (entity.data.id !== target.id) {
        entity.component.shake();
        audioManager.playSfx("error", 0.35);
        return;
      }

      entity.dragging = true;
      entity.component.setSelected(true);
      capturePointerSafely(entity, event.pointerId);
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

  function spawnWave(size) {
    if (destroyed || resolved || !hasRenderableStageBounds(stage)) {
      return false;
    }

    const width = getEntityWidth(stage, isBoss, theme.id);
    const slots = buildSpreadSlots(stage, width, theme.id, isBoss).slice(0, size);
    const waveObjects = buildWaveObjects(slots.length);
    const spawnEdges = buildSpawnEdges(slots.length);
    let spawnedCount = 0;

    slots.forEach((slot, index) => {
      const objectData = waveObjects[index];
      const entity = createEntity({
        objectData,
        stage,
        slot,
        order: index,
        isBoss: isBoss && objectData.id === target.id,
        isTarget: objectData.id === target.id,
        themeId: theme.id,
        spawnEdge: spawnEdges[index]
      });

      if (!entity) {
        return;
      }

      assignRoamTarget(entity);
      entities.push(entity);
      bindPointerEvents(entity);
      recentSpawns.push({
        id: objectData.id,
        edge: entity.spawnEdge,
        startX: Math.round(entity.x),
        startY: Math.round(entity.y),
        anchorX: Math.round(entity.anchorX),
        anchorY: Math.round(entity.anchorY)
      });
      if (recentSpawns.length > 8) {
        recentSpawns.shift();
      }
      setEntityVisual(entity);
      spawnedCount += 1;
    });

    return spawnedCount > 0;
  }

  function finishTimeout() {
    if (resolved) {
      return;
    }
    resolved = true;
    clearTimers();
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
    if (!activeDrag) {
      return;
    }

    releasePointerCaptureSafely(entity, activeDrag.pointerId);
    entity.dragging = false;
    entity.component.setSelected(false);
    entity.component.snap();
    assignRoamTarget(entity, { preferCurrent: true });
    activeDrag = null;
    zone.highlight(false);
    syncTrail(null);
    audioManager.playSfx("snap", 0.4);
  }

  function getCapturePoint() {
    const stageRect = stage.getBoundingClientRect();
    const zoneRect = zone.element.getBoundingClientRect();
    return {
      x: clamp(zoneRect.left + zoneRect.width * 0.54 - stageRect.left, 0, stageRect.width),
      y: clamp(zoneRect.top + zoneRect.height * 0.42 - stageRect.top, 0, stageRect.height)
    };
  }

  function beginCapture(entity) {
    const capturePoint = getCapturePoint();
    entity.capturePhase = "flying";
    entity.captureX = capturePoint.x;
    entity.captureY = capturePoint.y;
    entity.captureTimerMs = 0;
    entity.dragging = false;
    entity.component.setSelected(false);
  }

  function releaseDrag(event) {
    if (!activeDrag || activeDrag.pointerId !== event.pointerId) {
      return;
    }

    const { entity, pointerId } = activeDrag;
    releasePointerCaptureSafely(entity, pointerId);
    const isInZone = zone.containsPoint(event.clientX, event.clientY);

    activeDrag = null;
    zone.highlight(false);
    syncTrail(null);

    if (isInZone) {
      beginCapture(entity);
      return;
    }

    entity.dragging = false;
    entity.component.setSelected(false);
    entity.component.snap();
    assignRoamTarget(entity, { preferCurrent: true });
  }

  function handlePointerMove(event) {
    if (!activeDrag) {
      return;
    }

    const { entity } = activeDrag;
    const now = performance.now();
    const elapsed = Math.max(16, now - activeDrag.lastTime);
    const deltaX = event.clientX - activeDrag.lastX;
    const deltaY = event.clientY - activeDrag.lastY;
    const distance = Math.hypot(deltaX, deltaY);
    const speed = distance / elapsed;

    activeDrag.lastX = event.clientX;
    activeDrag.lastY = event.clientY;
    activeDrag.lastTime = now;

    if ((distance > 180 && elapsed < 42) || (speed > 2.5 && distance > 118)) {
      breakDrag(entity);
      return;
    }

    const stageRect = stage.getBoundingClientRect();
    const bounds = getPlayBounds(stage, entity.width, theme.id);
    entity.x = clamp(event.clientX - stageRect.left, bounds.minX, bounds.maxX);
    entity.y = clamp(event.clientY - stageRect.top, bounds.minY, bounds.maxY);
    if (Math.abs(deltaX) > 1.2) {
      entity.facing = getVisualFacingFromMotion(deltaX);
    }
    const dragBank = theme.id === "train"
      ? clamp(deltaY * 0.02, -4, 4)
      : clamp(deltaY * 0.04, -7, 7);
    entity.rotation += (dragBank - entity.rotation) * 0.2;
    zone.highlight(zone.containsPoint(event.clientX, event.clientY));
    syncTrail(entity);
    setEntityVisual(entity);
  }

  function steerEntity(entity, deltaMs) {
    const bounds = getPlayBounds(stage, entity.width, theme.id);

    if (entity.entryDelayMs > 0) {
      entity.entryDelayMs = Math.max(0, entity.entryDelayMs - deltaMs);
      return;
    }

    entity.roamCooldownMs -= deltaMs;
    const proximity = Math.hypot(entity.targetX - entity.x, entity.targetY - entity.y);
    if (proximity < 24 || entity.roamCooldownMs <= 0) {
      assignRoamTarget(entity);
    }

    const deltaSeconds = deltaMs / 1000;
    const hoverX = Math.cos(simulationTimeMs / 1200 * entity.driftRate + entity.driftPhase) * (entity.isBoss ? 10 : 6);
    const hoverY = Math.sin(simulationTimeMs / 1350 * entity.driftRate + entity.driftPhase) * (entity.isBoss ? 8 : 4);
    const desiredX = clamp(entity.targetX + hoverX, bounds.minX, bounds.maxX);
    const desiredY = clamp(entity.targetY + hoverY, bounds.minY, bounds.maxY);
    const dx = desiredX - entity.x;
    const dy = desiredY - entity.y;
    const distance = Math.hypot(dx, dy) || 1;

    let avoidX = 0;
    let avoidY = 0;
    entities.forEach((other) => {
      if (other === entity || other.dragging || other.capturePhase || other.entryDelayMs > 0) {
        return;
      }

      const safeDistance = (entity.width + other.width) * 0.46;
      const localDx = entity.x - other.x;
      const localDy = entity.y - other.y;
      const localDistance = Math.hypot(localDx, localDy) || 1;

      if (localDistance < safeDistance) {
        const pressure = (safeDistance - localDistance) / safeDistance;
        avoidX += (localDx / localDistance) * pressure * 32;
        avoidY += (localDy / localDistance) * pressure * 24;
      }
    });

    const desiredVx = dx / distance * entity.speed + avoidX;
    const desiredVy = dy / distance * entity.speed + avoidY;

    entity.vx += (desiredVx - entity.vx) * 0.12;
    entity.vy += (desiredVy - entity.vy) * 0.12;
    entity.x = clamp(entity.x + entity.vx * deltaSeconds, bounds.minX, bounds.maxX);
    entity.y = clamp(entity.y + entity.vy * deltaSeconds, bounds.minY, bounds.maxY);

    if (Math.abs(entity.vx) > 2) {
      entity.facing = getVisualFacingFromMotion(entity.vx);
    }

    const bank = theme.id === "train"
      ? clamp(entity.vy * 0.014, -3.2, 3.2)
      : clamp(entity.vy * 0.022, -4.4, 4.4);
    const bob = Math.sin(simulationTimeMs / 950 * entity.driftRate + entity.driftPhase) * (entity.isBoss ? 0.6 : 0.45);
    const desiredRotation = entity.baseRotation + bank + bob;
    entity.rotation += (desiredRotation - entity.rotation) * 0.12;
    setEntityVisual(entity);
  }

  function updateCaptureEntity(entity, deltaMs) {
    const deltaSeconds = deltaMs / 1000;
    const dx = entity.captureX - entity.x;
    const dy = entity.captureY - entity.y;
    const distance = Math.hypot(dx, dy) || 1;

    if (entity.capturePhase === "flying") {
      const captureSpeed = entity.isBoss ? 620 : 560;
      entity.vx = dx / distance * captureSpeed;
      entity.vy = dy / distance * captureSpeed;
      entity.x += entity.vx * deltaSeconds;
      entity.y += entity.vy * deltaSeconds;

      if (Math.abs(entity.vx) > 2) {
        entity.facing = getVisualFacingFromMotion(entity.vx);
      }

      const desiredRotation = theme.id === "train"
        ? clamp(entity.vy * 0.01, -3, 3)
        : clamp(entity.vy * 0.016, -4.2, 4.2);
      entity.rotation += (desiredRotation - entity.rotation) * 0.14;
      setEntityVisual(entity);

      if (distance <= 18) {
        entity.capturePhase = "fade";
        entity.captureTimerMs = entity.isBoss ? 220 : 160;
        entity.component.fadeOut();
      }
      return;
    }

    entity.captureTimerMs -= deltaMs;
    if (entity.captureTimerMs <= 0) {
      removeEntity(entity);
      finishRoundSuccess();
    }
  }

  function updateCountdown(allowAudio) {
    updateHud();

    if (timeLeft <= 10 && allowAudio) {
      audioManager.playSfx("countdown", 0.16);
      if (lastCountdownVoiceAt !== 10 && timeLeft === 10) {
        lastCountdownVoiceAt = 10;
        audioManager.speak(getVoiceCountdownMessage(), { rate: 0.92, pitch: 1.02 });
      }
    }

    if (timeLeft <= 0) {
      finishTimeout();
    }
  }

  function stepSimulation(deltaMs, allowAudio = true) {
    if (!started || destroyed || resolved) {
      return;
    }

    const safeDeltaMs = Math.max(0, deltaMs);
    simulationTimeMs += safeDeltaMs;

    countdownAccumulatorMs += safeDeltaMs;
    while (countdownAccumulatorMs >= 1000 && !resolved) {
      countdownAccumulatorMs -= 1000;
      timeLeft -= 1;
      updateCountdown(allowAudio);
    }

    entities.slice().forEach((entity) => {
      if (entity.dragging) {
        return;
      }

      if (entity.capturePhase) {
        updateCaptureEntity(entity, safeDeltaMs);
        return;
      }

      if (!entity.cleared) {
        steerEntity(entity, safeDeltaMs);
      }
    });
  }

  function tick(timestamp) {
    if (destroyed || !started) {
      return;
    }

    if (!lastTimestamp) {
      lastTimestamp = timestamp;
    }

    const deltaMs = Math.min(48, Math.max(16, timestamp - lastTimestamp));
    lastTimestamp = timestamp;
    stepSimulation(deltaMs);
    animationId = window.requestAnimationFrame(tick);
  }

  function startWhenReady() {
    if (destroyed || started) {
      return;
    }

    if (!hasRenderableStageBounds(stage)) {
      layoutWaitId = window.requestAnimationFrame(startWhenReady);
      return;
    }

    started = true;
    updateHud();
    spawnWave(isBoss ? 1 : INITIAL_WAVE_SIZE);
    lastTimestamp = performance.now();
    animationId = window.requestAnimationFrame(tick);
  }

  function advanceTime(ms) {
    if (!started || destroyed || resolved) {
      return;
    }

    const stepCount = Math.max(1, Math.ceil(ms / FRAME_STEP_MS));
    const stepMs = ms / stepCount;
    for (let index = 0; index < stepCount; index += 1) {
      stepSimulation(stepMs, false);
    }
  }

  window.addEventListener("pointermove", handlePointerMove);
  window.addEventListener("pointerup", releaseDrag);
  window.addEventListener("pointercancel", releaseDrag);

  return {
    element,
    afterMount() {
      startWhenReady();
    },
    advanceTime,
    getDebugState() {
      const stageRect = stage.getBoundingClientRect();
      return {
        started,
        timeLeft,
        entityCount: entities.length,
        activeDragId: activeDrag?.entity?.data?.id ?? null,
        stage: {
          width: Math.round(stageRect.width),
          height: Math.round(stageRect.height)
        },
        recentSpawns: [...recentSpawns],
        entities: entities.map((entity) => ({
          id: entity.data.id,
          x: Math.round(entity.x),
          y: Math.round(entity.y),
          anchorX: Math.round(entity.anchorX),
          anchorY: Math.round(entity.anchorY),
          targetX: Math.round(entity.targetX),
          targetY: Math.round(entity.targetY),
          spawnEdge: entity.spawnEdge,
          dragging: entity.dragging,
          capturePhase: entity.capturePhase,
          isTarget: entity.data.id === target.id
        }))
      };
    },
    destroy() {
      destroyed = true;
      clearTimers();
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", releaseDrag);
      window.removeEventListener("pointercancel", releaseDrag);
    }
  };
}
