export function wait(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

export async function runTransition(transitionLayer, themeId, onMidpoint) {
  await transitionLayer.cover(themeId);
  onMidpoint();
  await transitionLayer.reveal();
}
