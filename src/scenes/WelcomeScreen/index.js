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
    <div class="cartoon-welcome">
      <div class="cartoon-welcome__sky"></div>
      <div class="cartoon-welcome__sun" data-drift="0.04"></div>
      <div class="cartoon-welcome__mountains" data-drift="0.06"></div>
      <div class="cartoon-welcome__sea"></div>
      <div class="cartoon-welcome__foam"></div>
      <div class="cartoon-welcome__bubble-field" data-drift="0.08">
        ${makeParticles(14, "cartoon-welcome__bubble", (index) => ({
          left: `${8 + ((index * 6.2) % 82)}%`,
          bottom: `${8 + ((index * 9.7) % 28)}%`,
          animationDelay: `${index * -0.6}s`,
          animationDuration: `${8 + (index % 4) * 1.2}s`
        }))}
      </div>
      <div class="cartoon-welcome__badge-slot" data-drift="0.03"></div>
      <div class="cartoon-welcome__title-pack" data-drift="0.04">
        <p class="cartoon-welcome__logo">OCEAN QUEST</p>
        <h1>반짝 바다 모험</h1>
        <p class="cartoon-welcome__subtitle">きらきら うみ ぼうけん</p>
        <div class="cartoon-welcome__level-badge">LV 999</div>
      </div>
      <div class="cartoon-welcome__mascot" data-drift="0.08">
        <div class="cartoon-welcome__raft">
          <div class="cartoon-welcome__captain">
            <span class="cartoon-welcome__captain-head"></span>
            <span class="cartoon-welcome__captain-face"></span>
            <span class="cartoon-welcome__captain-arm"></span>
            <span class="cartoon-welcome__rod"></span>
            <span class="cartoon-welcome__line"></span>
          </div>
        </div>
        <p class="cartoon-welcome__mascot-copy">서준 ♥ 서진 전용 아케이드</p>
      </div>
      <div class="cartoon-welcome__target-fish" data-drift="0.12">
        <div class="cartoon-welcome__target-ring"></div>
        <img src="/src/assets/images/ocean/lionfish.svg" alt="target fish" />
        <span class="cartoon-welcome__splash cartoon-welcome__splash--a"></span>
        <span class="cartoon-welcome__splash cartoon-welcome__splash--b"></span>
        <span class="cartoon-welcome__splash cartoon-welcome__splash--c"></span>
      </div>
      <div class="cartoon-welcome__start-area" data-drift="0.05">
        <div class="cartoon-welcome__chips">
          <span>5마리 미션</span>
          <span>보스 상어</span>
          <span>다음은 기차역</span>
        </div>
        <div class="cartoon-welcome__start-frame">
          <p class="cartoon-welcome__start-copy">탭하면 바로 출발</p>
          <div class="cartoon-welcome__start-slot"></div>
        </div>
        <p class="cartoon-welcome__hint">탭해서 출발 / タップで しゅっぱつ</p>
      </div>
    </div>
  `;

  element.querySelector(".cartoon-welcome__badge-slot")?.append(badge);
  element.querySelector(".cartoon-welcome__start-slot")?.append(startButton);

  const cleanupMotion = attachSceneMotion(element.querySelector(".cartoon-welcome"), {
    selector: "[data-drift]",
    idleAmplitude: 8,
    pointerAmplitude: 16
  });

  return {
    element,
    destroy() {
      cleanupMotion();
    }
  };
}
