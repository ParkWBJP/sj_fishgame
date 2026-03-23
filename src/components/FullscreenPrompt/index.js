export function createFullscreenPrompt({ onRequest }) {
  const element = document.createElement("div");
  element.className = "fullscreen-prompt";
  element.innerHTML = `
    <div class="fullscreen-prompt__card">
      <p class="fullscreen-prompt__title">\uc804\uccb4\ud654\uba74\uc73c\ub85c\u0020\ub180\uc544\uc694\u0020\u002f\u0020\u305c\u3093\u304c\u3081\u3093\u3067\u0020\u3042\u305d\u307c\u3046</p>
      <button class="fullscreen-prompt__button" type="button">\uc804\uccb4\ud654\uba74\u0020\uc2dc\uc791\u0020\u002f\u0020\u30b9\u30bf\u30fc\u30c8</button>
    </div>
  `;

  element.querySelector("button")?.addEventListener("click", () => onRequest?.());

  return {
    element,
    update(visible) {
      element.classList.toggle("is-visible", visible);
    }
  };
}
