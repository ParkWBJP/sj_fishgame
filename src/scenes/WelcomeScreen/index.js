import { createNameBadge } from "../../components/NameBadge/index.js";
import { attachSceneMotion } from "../../utils/sceneMotion.js";

function makeParticles(count, className, valueFactory) {
  return Array.from({ length: count }, (_, index) => {
    const values = valueFactory(index);
    const style = Object.entries(values)
      .map(([key, value]) => `${key}:${value}`)
      .join(";");
    return `<span class="${className}" style="${style}"></span>`;
  }).join("");
}

export function createWelcomeScreen({ onStart }) {
  const element = document.createElement("section");
  element.className = "scene scene--welcome";

  const badge = createNameBadge({ compact: true, variant: "ticket" });
  const startButton = document.createElement("button");
  startButton.type = "button";
  startButton.className = "welcome-start-button";
  startButton.innerHTML = `
    <span class="welcome-start-button__icon"></span>
    <span class="welcome-start-button__label">
      <strong>START</strong>
      <small>시작 / スタート</small>
    </span>
  `;
  startButton.addEventListener("click", () => onStart?.());

  element.innerHTML = `
    <div class="ocean-welcome">
      <div class="ocean-welcome__camera" data-drift="0.04">
        <div class="ocean-welcome__backdrop" data-drift="0.1"></div>
        <div class="ocean-welcome__beams" data-drift="0.14"></div>
        <div class="ocean-welcome__caustics" data-drift="0.18"></div>
        <div class="ocean-welcome__far-silhouettes" data-drift="0.08">
          <span class="ocean-welcome__silhouette ocean-welcome__silhouette--a"></span>
          <span class="ocean-welcome__silhouette ocean-welcome__silhouette--b"></span>
          <span class="ocean-welcome__silhouette ocean-welcome__silhouette--c"></span>
        </div>
        <div class="ocean-welcome__bubble-field" data-drift="0.12">
          ${makeParticles(18, "ocean-welcome__bubble", (index) => ({
            left: `${4 + ((index * 5.3) % 88)}%`,
            bottom: `${-14 - (index % 4) * 10}%`,
            width: `${10 + (index % 5) * 7}px`,
            height: `${10 + (index % 5) * 7}px`,
            animationDelay: `${index * -1.1}s`,
            animationDuration: `${12 + (index % 4) * 2.4}s`
          }))}
        </div>
        <div class="ocean-welcome__mid-flow" data-drift="0.16"></div>
        <div class="ocean-welcome__swimmers" data-drift="0.26">
          <img class="ocean-welcome__fish ocean-welcome__fish--a" src="/src/assets/images/ocean/blue-tang.svg" alt="blue fish" />
          <img class="ocean-welcome__fish ocean-welcome__fish--b" src="/src/assets/images/ocean/clownfish.svg" alt="orange fish" />
          <img class="ocean-welcome__fish ocean-welcome__fish--c" src="/src/assets/images/ocean/angelfish.svg" alt="white fish" />
        </div>
        <div class="ocean-welcome__foreground" data-drift="0.34">
          <div class="ocean-welcome__kelp ocean-welcome__kelp--left"></div>
          <div class="ocean-welcome__kelp ocean-welcome__kelp--right"></div>
          <div class="ocean-welcome__coral ocean-welcome__coral--left"></div>
          <div class="ocean-welcome__coral ocean-welcome__coral--center"></div>
          <div class="ocean-welcome__coral ocean-welcome__coral--right"></div>
          <div class="ocean-welcome__sand"></div>
        </div>
      </div>
      <div class="ocean-welcome__ui">
        <div class="ocean-welcome__badge-slot"></div>
        <div class="ocean-welcome__title-chip" data-drift="0.04">
          <span class="ocean-welcome__title-ko">서준♥서진 바다 게임</span>
          <span class="ocean-welcome__title-ja">ソジュン♥ソジン うみゲーム</span>
        </div>
        <div class="ocean-welcome__start-slot"></div>
      </div>
    </div>
  `;

  element.querySelector(".ocean-welcome__badge-slot")?.append(badge);
  element.querySelector(".ocean-welcome__start-slot")?.append(startButton);

  const cleanupMotion = attachSceneMotion(element.querySelector(".ocean-welcome"), {
    selector: "[data-drift]",
    idleAmplitude: 8,
    pointerAmplitude: 14
  });

  return {
    element,
    destroy() {
      cleanupMotion();
    }
  };
}
