import { createNameBadge } from "../../components/NameBadge/index.js";
import { attachSceneMotion } from "../../utils/sceneMotion.js";

function renderPortal(theme) {
  const lead = theme.id === "ocean"
    ? {
        top: "SEA GATE",
        ko: "물고기 친구들이 기다리는 바다 입구",
        ja: "さかなの ともだちが まっている うみの いりぐち"
      }
    : {
        top: "STATION GATE",
        ko: "반짝 열차를 만나러 가는 기차역 입구",
        ja: "きらきら れっしゃに あいにいく えきの いりぐち"
      };

  const preview = theme.id === "ocean"
    ? `
      <img class="theme-portal__art" src="/src/assets/images/ocean/clownfish.svg" alt="clownfish" />
      <img class="theme-portal__art" src="/src/assets/images/ocean/angelfish.svg" alt="angelfish" />
      <img class="theme-portal__art theme-portal__art--boss" src="/src/assets/images/ocean/shark.svg" alt="shark" />
    `
    : `
      <img class="theme-portal__art" src="/src/assets/images/train/nozomi.svg" alt="nozomi" />
      <img class="theme-portal__art" src="/src/assets/images/train/yamanote.svg" alt="yamanote" />
      <img class="theme-portal__art theme-portal__art--boss" src="/src/assets/images/train/hayabusa.svg" alt="hayabusa" />
    `;

  return `
    <button class="theme-portal theme-portal--${theme.id}" type="button" data-theme="${theme.id}">
      <div class="theme-portal__scene" data-drift="0.12" style="background-image:url('${theme.preview}')"></div>
      <div class="theme-portal__veil"></div>
      <div class="theme-portal__body" data-drift="0.05">
        <p class="theme-portal__eyebrow">${lead.top}</p>
        <div class="theme-portal__title-stack">
          <h3>${theme.label.ko}</h3>
          <h4>${theme.label.ja}</h4>
        </div>
        <p class="theme-portal__summary">${lead.ko}</p>
        <p class="theme-portal__summary theme-portal__summary--ja">${lead.ja}</p>
        <div class="theme-portal__preview-row">
          ${preview}
        </div>
        <div class="theme-portal__meta">
          <span>${theme.shortMood.ko}</span>
          <span>${theme.bossLabel.ko}</span>
        </div>
        <span class="theme-portal__cta">들어가기 / はいる</span>
      </div>
      <div class="theme-portal__shine"></div>
      <div class="theme-portal__floor"></div>
    </button>
  `;
}

export function createThemeSelectScreen({ themes, onSelect, onFullscreen }) {
  const element = document.createElement("section");
  element.className = "scene scene--theme-select";

  const badge = createNameBadge({ compact: true, variant: "ribbon" });

  element.innerHTML = `
    <div class="theme-select__scene theme-select__scene--clean">
      <div class="theme-select__sky" data-drift="0.14"></div>
      <div class="theme-select__ambient" data-drift="0.18"></div>
      <div class="theme-select__header">
        <div class="theme-select__badge-slot"></div>
        <div class="theme-select__headline" data-drift="0.05">
          <span>WORLD SELECT</span>
          <strong>어디로 갈까? / どこへ いこう？</strong>
          <p>복잡한 장식은 줄이고, 바로 고를 수 있게 큰 선택 카드 두 장으로 정리했습니다.</p>
        </div>
        <button class="mini-button theme-select__fullscreen" type="button">전체 화면 / ぜんがめん</button>
      </div>
      <div class="theme-select__portals">
        ${themes.map((theme) => renderPortal(theme)).join("")}
      </div>
    </div>
  `;

  element.querySelector(".theme-select__badge-slot")?.append(badge);
  element.querySelector(".theme-select__fullscreen")?.addEventListener("click", () => onFullscreen?.());
  element.querySelectorAll(".theme-portal").forEach((button) => {
    button.addEventListener("click", () => onSelect?.(button.dataset.theme));
  });

  const cleanupMotion = attachSceneMotion(element.querySelector(".theme-select__scene"), {
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
