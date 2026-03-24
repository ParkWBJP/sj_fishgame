import { createNameBadge } from "../../components/NameBadge/index.js";
import { attachSceneMotion } from "../../utils/sceneMotion.js";

function renderPortal(theme) {
  const lead = theme.id === "ocean"
    ? {
        top: "반짝 바다 / きらきら うみ",
        ko: "물고기를 잡으러 가요",
        ja: "さかなを つかまえに いこう"
      }
    : {
        top: "두근 기차역 / わくわく えき",
        ko: "멋진 기차를 만나러 가요",
        ja: "かっこいい でんしゃに あいにいこう"
      };

  const preview = theme.id === "ocean"
    ? `
      <img class="theme-portal__art theme-portal__art--main theme-portal__float-a" src="/src/assets/images/ocean/clownfish.svg" alt="clownfish" />
      <img class="theme-portal__art theme-portal__art--sub theme-portal__float-b" src="/src/assets/images/ocean/angelfish.svg" alt="angelfish" />
      <img class="theme-portal__art theme-portal__art--boss theme-portal__float-c" src="/src/assets/images/ocean/shark.svg" alt="shark" />
    `
    : `
      <img class="theme-portal__art theme-portal__art--main theme-portal__float-a" src="/src/assets/images/train/nozomi.svg" alt="nozomi" />
      <img class="theme-portal__art theme-portal__art--sub theme-portal__float-b" src="/src/assets/images/train/yamanote.svg" alt="yamanote" />
      <img class="theme-portal__art theme-portal__art--boss theme-portal__float-c" src="/src/assets/images/train/hayabusa.svg" alt="hayabusa" />
    `;

  return `
    <button class="theme-portal theme-portal--${theme.id}" type="button" data-theme="${theme.id}">
      <div class="theme-portal__scene" data-drift="0.16" style="background-image:url('${theme.preview}')"></div>
      <div class="theme-portal__depth" data-drift="0.22"></div>
      <div class="theme-portal__lights" data-drift="0.28"></div>
      <div class="theme-portal__particles" data-drift="0.18"></div>
      <div class="theme-portal__foreground">
        ${preview}
      </div>
      <div class="theme-portal__content" data-drift="0.08">
        <p class="theme-portal__eyebrow">${lead.top}</p>
        <h3>${theme.label.ko}</h3>
        <h4>${theme.label.ja}</h4>
        <p class="theme-portal__copy">${lead.ko}</p>
        <p class="theme-portal__copy theme-portal__copy--ja">${lead.ja}</p>
        <span class="theme-portal__cta">고르기 / えらぶ</span>
      </div>
    </button>
  `;
}

export function createThemeSelectScreen({ themes, onSelect, onFullscreen }) {
  const element = document.createElement("section");
  element.className = "scene scene--theme-select";

  const badge = createNameBadge({ compact: true, variant: "ribbon" });

  element.innerHTML = `
    <div class="theme-select__scene">
      <div class="theme-select__sky" data-drift="0.18"></div>
      <div class="theme-select__ambient" data-drift="0.24"></div>
      <div class="theme-select__panel">
        <div class="theme-select__topbar">
          <div class="theme-select__badge-slot"></div>
          <button class="mini-button theme-select__fullscreen" type="button">전체화면 / ぜんがめん</button>
        </div>
        <div class="theme-select__headline" data-drift="0.06">
          <div class="theme-select__headline-plate">
            <p class="theme-select__lead">오늘은 어디로 갈까?</p>
            <p class="theme-select__lead theme-select__lead--ja">きょうは どこへ いこう？</p>
          </div>
          <div class="theme-select__subline">서준♥서진 전용 여행 / ソジュン♥ソジン せんよう たび</div>
        </div>
        <div class="theme-select__portals">
          ${themes.map((theme) => renderPortal(theme)).join("")}
        </div>
      </div>
    </div>
  `;

  element.querySelector(".theme-select__badge-slot")?.append(badge);
  element.querySelector(".theme-select__fullscreen")?.addEventListener("click", () => onFullscreen?.());
  element.querySelectorAll(".theme-portal").forEach((button) => {
    button.addEventListener("click", () => onSelect?.(button.dataset.theme));
  });

  const cleanupMotion = attachSceneMotion(element.querySelector(".theme-select__scene"));

  return {
    element,
    destroy() {
      cleanupMotion();
    }
  };
}
