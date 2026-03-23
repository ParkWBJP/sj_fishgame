function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function attachSceneMotion(root, options = {}) {
  if (!root) {
    return () => {};
  }

  const {
    selector = "[data-drift]",
    idleAmplitude = 10,
    pointerAmplitude = 18
  } = options;

  const layers = [...root.querySelectorAll(selector)].map((node) => ({
    node,
    drift: Number(node.dataset.drift || 1),
    rotate: Number(node.dataset.rotate || 0)
  }));

  if (!layers.length) {
    return () => {};
  }

  let rafId = 0;
  let pointerX = 0;
  let pointerY = 0;
  let targetX = 0;
  let targetY = 0;
  let running = true;
  const startedAt = performance.now();

  function handlePointerMove(event) {
    const rect = root.getBoundingClientRect();
    const x = clamp((event.clientX - rect.left) / rect.width, 0, 1);
    const y = clamp((event.clientY - rect.top) / rect.height, 0, 1);
    targetX = (x - 0.5) * 2;
    targetY = (y - 0.5) * 2;
  }

  function handlePointerLeave() {
    targetX = 0;
    targetY = 0;
  }

  function frame(now) {
    if (!running) {
      return;
    }

    const elapsed = (now - startedAt) / 1000;
    pointerX += (targetX - pointerX) * 0.06;
    pointerY += (targetY - pointerY) * 0.06;

    layers.forEach((layer, index) => {
      const idleX = Math.sin(elapsed * (0.32 + index * 0.04) + index) * idleAmplitude * layer.drift;
      const idleY = Math.cos(elapsed * (0.28 + index * 0.03) + index * 1.4) * idleAmplitude * 0.45 * layer.drift;
      const driftX = pointerX * pointerAmplitude * layer.drift;
      const driftY = pointerY * pointerAmplitude * 0.7 * layer.drift;
      layer.node.style.transform = `translate3d(${idleX + driftX}px, ${idleY + driftY}px, 0) rotate(${layer.rotate}deg)`;
    });

    rafId = window.requestAnimationFrame(frame);
  }

  root.addEventListener("pointermove", handlePointerMove);
  root.addEventListener("pointerleave", handlePointerLeave);
  rafId = window.requestAnimationFrame(frame);

  return () => {
    running = false;
    window.cancelAnimationFrame(rafId);
    root.removeEventListener("pointermove", handlePointerMove);
    root.removeEventListener("pointerleave", handlePointerLeave);
  };
}
