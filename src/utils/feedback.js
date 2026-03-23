export function vibratePattern(pattern = [18]) {
  if (!("vibrate" in navigator) || typeof navigator.vibrate !== "function") {
    return false;
  }

  try {
    return navigator.vibrate(pattern);
  } catch {
    return false;
  }
}

export function bindToyButton(button, options = {}) {
  if (!button || button.dataset.feedbackBound === "true") {
    return button;
  }

  const {
    pattern = [18],
    activeClass = "is-pressed",
    popClass = "is-popped"
  } = options;

  const release = () => button.classList.remove(activeClass);

  button.dataset.feedbackBound = "true";
  button.addEventListener("pointerdown", () => {
    button.classList.add(activeClass);
    vibratePattern(pattern);
  });
  button.addEventListener("pointerup", release);
  button.addEventListener("pointercancel", release);
  button.addEventListener("pointerleave", release);
  button.addEventListener("click", () => {
    button.classList.remove(activeClass);
    button.classList.remove(popClass);
    void button.offsetWidth;
    button.classList.add(popClass);
    window.setTimeout(() => button.classList.remove(popClass), 240);
  });

  return button;
}

export function bindToyButtons(root) {
  if (!root) {
    return;
  }

  root.querySelectorAll("button").forEach((button) => {
    bindToyButton(button);
  });
}
