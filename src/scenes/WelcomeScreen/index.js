import { createNameBadge } from "../../components/NameBadge/index.js";
import { attachSceneMotion } from "../../utils/sceneMotion.js";

export function createWelcomeScreen({ message, onStart }) {
  const element = document.createElement("section");
  element.className = "scene scene--welcome";

  const badge = createNameBadge({ variant: "ticket" });
  const button = document.createElement("button");
  button.type = "button";
  button.className = "cta-button welcome-screen__start welcome-screen__start--shell";
  button.innerHTML = `
    <span class="welcome-screen__start-main">출발하기</span>
    <span class="welcome-screen__start-sub">しゅっぱつ</span>
  `;
  button.addEventListener("click", () => onStart?.());

  element.innerHTML = `
    <div class="welcome-screen__world">
      <div class="welcome-screen__backdrop welcome-screen__backdrop--ocean" data-drift="0.18"></div>
      <div class="welcome-screen__caustics" data-drift="0.24"></div>
      <div class="welcome-screen__mist" data-drift="0.2"></div>
      <div class="welcome-screen__light" data-drift="0.28"></div>
      <div class="welcome-screen__far-school" data-drift="0.16"></div>
      <div class="welcome-screen__silhouettes" data-drift="0.2"></div>
      <div class="welcome-screen__bubbles" data-drift="0.12"></div>
      <div class="welcome-screen__sparks" data-drift="0.1"></div>
      <div class="welcome-screen__kelp welcome-screen__kelp--left" data-drift="0.42"></div>
      <div class="welcome-screen__kelp welcome-screen__kelp--right" data-drift="-0.34"></div>
      <div class="welcome-screen__seabed" data-drift="0.08"></div>
      <div class="welcome-screen__foreground">
        <img class="welcome-screen__hero-fish welcome-screen__float-a" data-drift="0.62" data-rotate="-2" src="/src/assets/images/ocean/blue-tang.svg" alt="ocean friend" />
        <img class="welcome-screen__hero-clown welcome-screen__float-d" data-drift="0.46" data-rotate="1" src="/src/assets/images/ocean/clownfish.svg" alt="clownfish" />
        <img class="welcome-screen__hero-angel welcome-screen__float-c" data-drift="-0.32" data-rotate="-1" src="/src/assets/images/ocean/angelfish.svg" alt="angelfish" />
        <img class="welcome-screen__hero-shark welcome-screen__float-b" data-drift="0.38" data-rotate="1" src="/src/assets/images/ocean/shark.svg" alt="shark" />
      </div>
      <div class="welcome-screen__ui">
        <div class="welcome-screen__badge-slot"></div>
        <div class="welcome-screen__title-wrap" data-drift="0.06">
          <div class="welcome-screen__ribbon">SEOJUN &amp; SEOJIN AQUA ARCADE</div>
          <div class="welcome-screen__title-plaque">
            <div class="welcome-screen__title-plate">
              <span class="welcome-screen__title-plate-ko">서준♥서진 바다・기차 게임</span>
              <span class="welcome-screen__title-plate-ja">ソジュン♥ソジン うみ・でんしゃゲーム</span>
            </div>
            <div class="welcome-screen__message-plates">
              <span class="welcome-screen__message-plate">${message.ko}</span>
              <span class="welcome-screen__message-plate welcome-screen__message-plate--ja">${message.ja}</span>
            </div>
          </div>
        </div>
        <div class="welcome-screen__controls">
          <div class="welcome-screen__theme-passes" data-drift="0.04">
            <span class="welcome-screen__pass welcome-screen__pass--ocean">바다 / うみ</span>
            <span class="welcome-screen__pass welcome-screen__pass--train">기차역 / えき</span>
          </div>
        </div>
      </div>
    </div>
  `;

  element.querySelector(".welcome-screen__badge-slot")?.append(badge);
  element.querySelector(".welcome-screen__controls")?.prepend(button);

  const cleanupMotion = attachSceneMotion(element.querySelector(".welcome-screen__world"));

  return {
    element,
    destroy() {
      cleanupMotion();
    }
  };
}
