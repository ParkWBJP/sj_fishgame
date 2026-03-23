export function vibratePattern(pattern = [12]) {
  if ("vibrate" in navigator) {
    navigator.vibrate(pattern);
  }
}

export function bindToyButton(button, options = {}) {
  if (!button || button.dataset.feedbackBound === "true") {
    return button;
  }

  const {
    pattern = [12],
    activeClass = "is-pressed",
    popClass = "is-popped"
  } = options;

  const release = () => button.classList.remove(activeClass);

  button.dataset.feedbackBound = "true";
  button.addEventListener("pointerdown", () => {
    button.classList.add(activeClass);
  });
  button.addEventListener("pointerup", release);
  button.addEventListener("pointercancel", release);
  button.addEventListener("pointerleave", release);
  button.addEventListener("click", () => {
    button.classList.remove(activeClass);
    button.classList.remove(popClass);
    void button.offsetWidth;
    button.classList.add(popClass);
    vibratePattern(pattern);
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
