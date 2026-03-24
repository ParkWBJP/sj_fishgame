export function createSoundToggle(onToggle) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "sound-toggle";
  button.addEventListener("click", () => onToggle?.());

  return {
    element: button,
    update(enabled) {
      button.innerHTML = enabled
        ? `<span>&#128266;</span><span>소리 / おと</span>`
        : `<span>&#128263;</span><span>소리 / おと</span>`;
      button.dataset.enabled = String(enabled);
    }
  };
}
