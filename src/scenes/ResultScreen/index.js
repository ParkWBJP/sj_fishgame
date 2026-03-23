import { renderPreviewList } from "../../components/ResultCard.js";

export function createResultScreen({ result, onRestart, onChangeTheme }) {
  const element = document.createElement("section");
  element.className = `scene scene--result scene--${result.theme.id}`;
  element.innerHTML = `
    <div class="result-screen__confetti"></div>
    <div class="scene-card scene-card--result ${result.success ? "is-success" : "is-soft"}">
      <img class="result-screen__stamp" src="${result.stamp}" alt="SEOJUN and SEOJIN stamp" />
      <div class="result-screen__headline">
        <p>${result.headline.ko}</p>
        <p>${result.headline.ja}</p>
      </div>
      <div class="result-screen__score">
        <strong>${result.caughtCount}</strong>
        <div>
          <p>\uc7a1\uc740\u0020\uac1c\uc218\u0020\u002f\u0020\u3064\u304b\u307e\u3048\u305f\u0020\u304b\u305a</p>
          <p>${result.caughtCount} / ${result.totalRounds}${result.success ? " + BOSS" : ""}</p>
        </div>
      </div>
      <div class="result-screen__preview-grid">
        ${renderPreviewList(result.caughtObjects)}
      </div>
      <div class="result-screen__actions">
        <button class="cta-button" type="button" data-action="restart">
          <span>\ub2e4\uc2dc\u0020\ud558\uae30</span>
          <span>\u3082\u3046\u3044\u3061\u3069</span>
        </button>
        <button class="secondary-button" type="button" data-action="change">
          <span>\ud14c\ub9c8\u0020\ubc14\uafb8\uae30</span>
          <span>\u30c6\u30fc\u30de\u3092\u0020\u304b\u3048\u308b</span>
        </button>
      </div>
    </div>
  `;

  element.querySelector('[data-action="restart"]')?.addEventListener("click", () => onRestart?.());
  element.querySelector('[data-action="change"]')?.addEventListener("click", () => onChangeTheme?.());

  return { element };
}
