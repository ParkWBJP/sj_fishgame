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

function distanceBetween(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.hypot(dx, dy);
}

function getVisualFacingFromMotion(motionX) {
  return motionX >= 0 ? -1 : 1;
}

function getEntityWidth(stage, isBoss) {
  if (isBoss) {
    return stage.clientWidth > 1100 ? 900 : 690;
  }
  return stage.clientWidth > 1100 ? 240 : 195;
}

function getMovementBounds(host, entityWidth, themeId = "ocean") {
  const minX = themeId === "train"
    ? Math.max(host.clientWidth * 0.36, entityWidth * 0.52 + 18)
    : Math.max(host.clientWidth * 0.38, entityWidth * 0.52 + 24);
  const maxX = host.clientWidth - entityWidth * 0.52 - 34;
  const minY = themeId === "train"
    ? Math.max(150, entityWidth * 0.2 + 74)
    : Math.max(166, entityWidth * 0.2 + 84);
  const maxY = themeId === "train"
    ? host.clientHeight - entityWidth * 0.22 - 26
    : host.clientHeight - entityWidth * 0.2 - 34;

  return { minX, maxX, minY, maxY };
}

function laneCenter(bounds, laneCount, laneIndex) {
  const laneHeight = (bounds.maxY - bounds.minY) / laneCount;
  return bounds.minY + laneHeight * laneIndex + laneHeight * 0.5;
}

function overlapsAtPoint(candidate, entities, gapScale = 0.88) {
  return entities.some((entity) => {
    if (entity.cleared) {
      return false;
    }
    const minDistance = (candidate.width + entity.width) * gapScale * 0.5;
    return distanceBetween(candidate, entity) < minDistance;
  });
}

function pickSpawnCourse(stage, entityWidth, entities, isBoss, themeId) {
  const bounds = getMovementBounds(stage, entityWidth, themeId);
  const margin = entityWidth * 0.72;

  if (themeId === "train") {
    const laneCount = isBoss ? 2 : 4;

    for (let attempt = 0; attempt < 32; attempt += 1) {
      const side = Math.random() < 0.5 ? "left" : "right";
      const laneIndex = Math.floor(Math.random() * laneCount);
      const laneY = laneCenter(bounds, laneCount, laneIndex);
      const y = clamp(laneY + randomBetween(-20, 20), bounds.minY + 8, bounds.maxY - 8);
      const targetY = clamp(laneY + randomBetween(-18, 18), bounds.minY + 8, bounds.maxY - 8);
      const x = side === "left" ? -margin : stage.clientWidth + margin;
      const targetX = side === "left"
        ? randomBetween(bounds.minX + 120, bounds.maxX - 24)
        : randomBetween(bounds.minX + 24, bounds.maxX - 120);
      const candidate = { x, y, width: entityWidth };
      const waypoint = { x: targetX, y: targetY, width: entityWidth };

      if (!overlapsAtPoint(candidate, entities, 1.02) && !overlapsAtPoint(waypoint, entities, 0.88)) {
        return { x, y, targetX, targetY, bounds, bandY: laneY };
      }
    }
  } else {
    const laneCount = isBoss ? 3 : 5;
    const entries = [
      { side: "left", vertical: "mid" },
      { side: "right", vertical: "mid" },
      { side: "left", vertical: "upper" },
      { side: "right", vertical: "upper" },
      { side: "left", vertical: "lower" },
      { side: "right", vertical: "lower" }
    ];

    for (let attempt = 0; attempt < 40; attempt += 1) {
      const entry = entries[Math.floor(Math.random() * entries.length)];
      const laneIndex = Math.floor(Math.random() * laneCount);
      const laneY = laneCenter(bounds, laneCount, laneIndex);
      const offsetY = randomBetween(-26, 26);
      const sideLeft = entry.side === "left";
      const x = sideLeft ? -margin : stage.clientWidth + margin;
      let y = clamp(laneY + offsetY, bounds.minY + 18, bounds.maxY - 18);
      const targetX = sideLeft
        ? randomBetween(bounds.minX + 120, bounds.maxX - 28)
        : randomBetween(bounds.minX + 28, bounds.maxX - 120);
      let targetY = clamp(laneY + randomBetween(-36, 36), bounds.minY + 16, bounds.maxY - 16);

      if (entry.vertical === "upper") {
        y = bounds.minY - margin * 0.24;
        targetY = clamp(laneY + randomBetween(34, 86), bounds.minY + 26, bounds.maxY - 24);
      } else if (entry.vertical === "lower") {
        y = bounds.maxY + margin * 0.18;
        targetY = clamp(laneY - randomBetween(34, 86), bounds.minY + 24, bounds.maxY - 26);
      }

      const candidate = { x, y, width: entityWidth };
      const waypoint = { x: targetX, y: targetY, width: entityWidth };

      if (!overlapsAtPoint(candidate, entities, 1.08) && !overlapsAtPoint(waypoint, entities, 0.94)) {
        return { x, y, targetX, targetY, bounds, bandY: laneY };
      }
    }
  }

  return {
    x: -entityWidth * 0.7,
    y: (bounds.minY + bounds.maxY) * 0.5,
    targetX: bounds.maxX - entityWidth * 0.2,
    targetY: (bounds.minY + bounds.maxY) * 0.5,
    bounds,
    bandY: (bounds.minY + bounds.maxY) * 0.5
  };
}

function chooseInteriorWaypoint(stage, entityWidth, entities, isBoss, themeId, bandY) {
  const bounds = getMovementBounds(stage, entityWidth, themeId);

  if (themeId === "train") {
    for (let attempt = 0; attempt < 20; attempt += 1) {
      const candidate = {
        x: randomBetween(bounds.minX + 40, bounds.maxX - 40),
        y: clamp((bandY ?? (bounds.minY + bounds.maxY) * 0.5) + randomBetween(-22, 22), bounds.minY + 8, bounds.maxY - 8),
        width: entityWidth
      };
      if (!overlapsAtPoint(candidate, entities, 0.78)) {
        return candidate;
      }
    }
  }

  for (let attempt = 0; attempt < 28; attempt += 1) {
    const candidate = {
      x: randomBetween(bounds.minX + 24, bounds.maxX - 24),
      y: themeId === "train"
        ? clamp((bandY ?? (bounds.minY + bounds.maxY) * 0.5) + randomBetween(-24, 24), bounds.minY + 10, bounds.maxY - 10)
        : randomBetween(bounds.minY + 22, bounds.maxY - 22),
      width: entityWidth
    };
    if (!overlapsAtPoint(candidate, entities, themeId === "train" ? (isBoss ? 0.74 : 0.82) : (isBoss ? 0.82 : 0.9))) {
      return candidate;
    }
  }

  return {
    x: randomBetween(bounds.minX + 32, bounds.maxX - 32),
    y: themeId === "train"
      ? clamp((bandY ?? (bounds.minY + bounds.maxY) * 0.5) + randomBetween(-18, 18), bounds.minY + 8, bounds.maxY - 8)
      : randomBetween(bounds.minY + 24, bounds.maxY - 24)
  };
}

function setExitWaypoint(entity, host, themeId) {
  const margin = entity.width * 0.85;
  const leavingRight = (entity.vx || entity.targetX - entity.x) >= 0;
  entity.exiting = true;
  entity.targetX = leavingRight ? host.clientWidth + margin : -margin;
  entity.targetY = themeId === "train"
    ? clamp(
        (entity.bandY ?? entity.y) + randomBetween(-18, 18),
        entity.width * 0.2 + 70,
        host.clientHeight - entity.width * 0.2 - 24
      )
    : clamp(
        entity.y + randomBetween(-42, 42),
        entity.width * 0.2 + 84,
        host.clientHeight - entity.width * 0.2 - 34
      );
}

function createEntity(objectData, stage, entities, isBoss, isTarget, themeId) {
  const component = createDragObject({ data: objectData, isBoss, isTarget });
  const width = getEntityWidth(stage, isBoss);
  component.element.style.width = `${width}px`;
  stage.append(component.element);

  const course = pickSpawnCourse(stage, width, entities, isBoss, themeId);
  const speed = themeId === "train"
    ? (isBoss ? randomBetween(70, 92) : randomBetween(58, 78))
    : (isBoss ? randomBetween(54, 70) : randomBetween(40, 60));
  const travelDirection = course.targetX >= course.x ? 1 : -1;
  const facing = getVisualFacingFromMotion(travelDirection);

  return {
    data: objectData,
    component,
    x: course.x,
    y: course.y,
    targetX: course.targetX,
    targetY: course.targetY,
    bandY: course.bandY,
    vx: 0,
    vy: 0,
    facing,
    travelDirection,
    width,
    baseRotation: themeId === "train" ? randomBetween(-1.5, 1.5) : randomBetween(-4, 4),
    wavePhase: randomBetween(0, Math.PI * 2),
    waveRate: randomBetween(0.8, 1.35),
    waveStrength: themeId === "train"
      ? (isBoss ? randomBetween(4, 8) : randomBetween(6, 10))
      : (isBoss ? randomBetween(10, 18) : randomBetween(14, 24)),
    speed,
    dragging: false,
    cleared: false,
    exiting: false,
    lifeMs: 0,
    maxLifeMs: isBoss ? Number.POSITIVE_INFINITY : isTarget ? randomBetween(18000, 26000) : randomBetween(11000, 18000)
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
  let lastTimestamp = performance.now();
  let lastCountdownVoiceAt = null;
  let activeDrag = null;
  const maxObjects = isBoss ? 1 : 5;
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
    const length = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);

    trail.classList.add("is-visible");
    trail.style.width = `${length}px`;
    trail.style.left = `${zoneX}px`;
    trail.style.top = `${zoneY}px`;
    trail.style.transform = `rotate(${angle}deg)`;
  }

  function markEntityVisual(entity, extraRotation = 0) {
    const sway = Math.sin(performance.now() / 760 * entity.waveRate + entity.wavePhase) * 1.6;
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

  function countVisibleTargets() {
    return entities.filter((entity) => !entity.cleared && entity.data.id === target.id).length;
  }

  function spawn(forceTarget = false) {
    if (destroyed || resolved || entities.length >= maxObjects) {
      return;
    }

    const distractors = theme.objects.filter((object) => object.id !== target.id);
    const objectData = forceTarget
      ? target
      : isBoss
        ? target
        : (Math.random() < 0.42 ? target : distractors[Math.floor(Math.random() * distractors.length)]);

    const entity = createEntity(
      objectData,
      stage,
      entities,
      isBoss && objectData.id === target.id,
      objectData.id === target.id,
      theme.id
    );
    entities.push(entity);
    markEntityVisual(entity);

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

    const targetVisible = countVisibleTargets() > 0;
    const amount = isBoss ? 1 : 1 + Number(Math.random() < 0.24);
    for (let i = 0; i < amount; i += 1) {
      spawn(!targetVisible && i === 0);
    }

    spawnTimerId = window.setTimeout(scheduleSpawn, randomBetween(1600, 2600));
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
    entity.targetX = clamp(entity.x + randomBetween(-120, 120), entity.width * 0.5 + 20, element.clientWidth - entity.width * 0.5 - 20);
    entity.targetY = clamp(entity.y + randomBetween(-90, 90), 140, element.clientHeight - entity.width * 0.22 - 18);
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

    const bounds = getMovementBounds(element, entity.width, theme.id);
    entity.targetX = clamp(entity.x + randomBetween(-180, 180), bounds.minX, bounds.maxX);
    entity.targetY = clamp(entity.y + randomBetween(-120, 120), bounds.minY, bounds.maxY);
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
    markEntityVisual(entity, 0);
  }

  function steerEntity(entity, deltaSeconds, timestamp) {
    const bounds = getMovementBounds(element, entity.width, theme.id);
    const dx = entity.targetX - entity.x;
    const dy = entity.targetY - entity.y;
    const distance = Math.hypot(dx, dy) || 1;

    if (!entity.exiting && distance < Math.max(34, entity.width * 0.12)) {
      const nextWaypoint = chooseInteriorWaypoint(
        stage,
        entity.width,
        entities.filter((candidate) => candidate !== entity),
        isBoss,
        theme.id,
        entity.bandY
      );
      entity.targetX = nextWaypoint.x;
      entity.targetY = nextWaypoint.y;
    }

    const directionX = dx / distance;
    const directionY = dy / distance;

    let avoidX = 0;
    let avoidY = 0;
    entities.forEach((other) => {
      if (other === entity || other.dragging || other.cleared) {
        return;
      }
      const safeDistance = (entity.width + other.width) * 0.48;
      const localDx = entity.x - other.x;
      const localDy = entity.y - other.y;
      const localDistance = Math.hypot(localDx, localDy) || 1;
      if (localDistance < safeDistance) {
        const pressure = (safeDistance - localDistance) / safeDistance;
        avoidX += (localDx / localDistance) * pressure * 64;
        avoidY += (localDy / localDistance) * pressure * 42;
      }
    });

    const waveX = Math.cos(timestamp / 1000 * entity.waveRate + entity.wavePhase) * entity.waveStrength * (theme.id === "train" ? 0.03 : 0.08);
    const waveY = Math.sin(timestamp / 1000 * entity.waveRate + entity.wavePhase) * entity.waveStrength * (theme.id === "train" ? 0.08 : 0.22);

    entity.vx = directionX * entity.speed + avoidX + waveX;
    entity.vy = directionY * entity.speed + avoidY + waveY;
    entity.x += entity.vx * deltaSeconds;
    entity.y += entity.vy * deltaSeconds;
    entity.x = clamp(entity.x, bounds.minX - entity.width * 0.72, bounds.maxX + entity.width * 0.72);
    entity.y = clamp(entity.y, bounds.minY - entity.width * 0.4, bounds.maxY + entity.width * 0.4);

    if (Math.abs(entity.vx) > 2) {
      entity.travelDirection = entity.vx > 0 ? 1 : -1;
      entity.facing = getVisualFacingFromMotion(entity.vx);
    }

    const bank = theme.id === "train"
      ? clamp(entity.vy * 0.03, -4, 4)
      : clamp(entity.vy * 0.08 + Math.sin(timestamp / 720 + entity.wavePhase) * 1.8, -12, 12);
    markEntityVisual(entity, bank);
  }

  function tick(timestamp) {
    if (destroyed) {
      return;
    }

    const deltaSeconds = (timestamp - lastTimestamp) / 1000;
    lastTimestamp = timestamp;

    entities.slice().forEach((entity) => {
      if (entity.cleared) {
        return;
      }

      if (!entity.dragging) {
        entity.lifeMs += deltaSeconds * 1000;
        if (!isBoss && !entity.exiting && entity.lifeMs > entity.maxLifeMs) {
          const targetCount = countVisibleTargets();
          const canExitTarget = entity.data.id !== target.id || targetCount > 1;
          if (canExitTarget) {
            setExitWaypoint(entity, element, theme.id);
          }
        }

        steerEntity(entity, deltaSeconds, timestamp);
      }

      if (
        entity.exiting &&
        (
          entity.x < -entity.width * 1.15 ||
          entity.x > element.clientWidth + entity.width * 1.15 ||
          entity.y < -entity.width * 0.9 ||
          entity.y > element.clientHeight + entity.width * 0.9
        )
      ) {
        removeEntity(entity);
      }
    });

    animationId = window.requestAnimationFrame(tick);
  }

  updateHud();
  for (let i = 0; i < (isBoss ? 1 : 3); i += 1) {
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
