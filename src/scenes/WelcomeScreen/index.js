import { createNameBadge } from "../../components/NameBadge/index.js";

export function createWelcomeScreen({ message, onStart }) {
  const element = document.createElement("section");
  element.className = "scene scene--welcome";

  const badge = createNameBadge();
  const button = document.createElement("button");
  button.type = "button";
  button.className = "cta-button";
  button.innerHTML = `
    <span>\ud130\uce58\ud574\uc11c\u0020\uc2dc\uc791</span>
    <span>\u30bf\u30c3\u30c1\u3057\u3066\u0020\u30b9\u30bf\u30fc\u30c8</span>
  `;
  button.addEventListener("click", () => onStart?.());

  element.innerHTML = `
    <div class="welcome-screen__halo"></div>
    <div class="welcome-screen__stars"></div>
    <div class="scene-card scene-card--hero">
      <div class="welcome-screen__titles">
        <p class="eyebrow">SEOJUN & SEOJIN</p>
        <h1>\uc11c\uc900\u2665\uc11c\uc9c4\u0020\ubc14\ub2e4\u30fb\uae30\ucc28\u0020\uac8c\uc784</h1>
        <h2>\u30bd\u30b8\u30e5\u30f3\u2665\u30bd\u30b8\u30f3\u0020\u3046\u307f\u30fb\u3067\u3093\u3057\u3083\u30b2\u30fc\u30e0</h2>
        <div class="welcome-screen__message">
          <p>${message.ko}</p>
          <p>${message.ja}</p>
        </div>
      </div>
    </div>
  `;

  const card = element.querySelector(".scene-card");
  card?.prepend(badge);
  card?.append(button);

  return { element };
}
