export function createCountdownOverlay() {
  const element = document.createElement("div");
  element.className = "countdown-overlay";

  return {
    element,
    update(timeLeft, message) {
      const active = timeLeft <= 10;
      element.classList.toggle("is-visible", active);
      if (!active) {
        return;
      }
      element.innerHTML = `
        <div class="countdown-overlay__number">${timeLeft}</div>
        <div class="countdown-overlay__message">
          <p>${message.ko}</p>
          <p>${message.ja}</p>
        </div>
      `;
    }
  };
}
