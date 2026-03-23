export function canUseFullscreen() {
  return Boolean(document.documentElement.requestFullscreen);
}

export async function enterFullscreen() {
  if (!canUseFullscreen() || document.fullscreenElement) {
    return false;
  }

  try {
    await document.documentElement.requestFullscreen();
    return true;
  } catch (error) {
    return false;
  }
}

export function isFullscreenActive() {
  return Boolean(document.fullscreenElement);
}

export function isLandscapeViewport() {
  return window.innerWidth >= window.innerHeight;
}
