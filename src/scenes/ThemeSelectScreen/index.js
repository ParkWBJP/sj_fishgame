import { createNameBadge } from "../../components/NameBadge/index.js";

function renderCard(theme) {
  const sampleObjects = theme.objects.slice(0, 3);
  return `
    <button class="theme-card theme-card--${theme.id}" type="button" data-theme="${theme.id}">
      <div class="theme-card__backdrop" style="background-image:url('${theme.preview}')"></div>
      <div class="theme-card__overlay"></div>
      <div class="theme-card__content">
        <p class="theme-card__eyebrow">${theme.shortMood.ko} / ${theme.shortMood.ja}</p>
        <h3>${theme.label.ko}</h3>
        <h4>${theme.label.ja}</h4>
        <div class="theme-card__preview-row">
          ${sampleObjects
            .map(
              (object) => `
                <span class="theme-card__preview">
                  <img src="${object.image}" alt="${object.label.ko}" />
                </span>
              `
            )
            .join("")}
        </div>
      </div>
    </button>
  `;
}

export function createThemeSelectScreen({ themes, onSelect, onFullscreen }) {
  const element = document.createElement("section");
  element.className = "scene scene--theme-select";

  const badge = createNameBadge({ compact: true });
  element.innerHTML = `
    <div class="scene-card scene-card--wide">
      <div class="theme-select__header">
        <div>
          <p class="eyebrow">CHOOSE A GIFT SCENE</p>
          <h2>\uc624\ub298\uc740\u0020\uc5b4\ub514\ub85c\u0020\uac08\uae4c\u003f</h2>
          <h3>\u304d\u3087\u3046\u306f\u0020\u3069\u3053\u3078\u0020\u3044\u3053\u3046\uff1f</h3>
        </div>
        <button class="mini-button" type="button">\uc804\uccb4\ud654\uba74\u0020\uc2dc\uc791\u0020\u002f\u0020\u305c\u3093\u304c\u3081\u3093</button>
      </div>
      <div class="theme-select__cards">
        ${themes.map((theme) => renderCard(theme)).join("")}
      </div>
    </div>
  `;

  element.querySelector(".scene-card")?.prepend(badge);
  element.querySelector(".mini-button")?.addEventListener("click", () => onFullscreen?.());
  element.querySelectorAll(".theme-card").forEach((button) => {
    button.addEventListener("click", () => onSelect?.(button.dataset.theme));
  });

  return { element };
}
