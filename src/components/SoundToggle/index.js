export function createSoundToggle(onToggle) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "sound-toggle";
  button.addEventListener("click", () => onToggle?.());

  return {
    element: button,
    update(enabled) {
      button.innerHTML = enabled
        ? `<span>🔊</span><span>\uc18c\ub9ac\u0020\u002f\u0020\u304a\u3068</span>`
        : `<span>🔈</span><span>\uc18c\ub9ac\u0020\u002f\u0020\u304a\u3068</span>`;
      button.dataset.enabled = String(enabled);
    }
  };
}
