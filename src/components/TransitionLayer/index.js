import { wait } from "../../utils/transitions.js";

export function createTransitionLayer() {
  const element = document.createElement("div");
  element.className = "transition-layer";
  element.innerHTML = `
    <div class="transition-layer__wave"></div>
    <div class="transition-layer__flare"></div>
  `;

  return {
    element,
    async cover(themeId) {
      element.dataset.theme = themeId || "ocean";
      element.classList.add("is-active");
      element.classList.remove("is-releasing");
      await wait(280);
    },
    async reveal() {
      element.classList.add("is-releasing");
      await wait(360);
      element.classList.remove("is-active", "is-releasing");
    }
  };
}
