import { renderPreviewList } from "../../components/ResultCard.js";

function renderFireworks() {
  return Array.from({ length: 8 }, (_, index) => {
    const left = 8 + (index % 4) * 22 + (index > 3 ? 8 : 0);
    const top = index < 4 ? 10 + index * 6 : 18 + (index - 4) * 8;
    return `<span class="result-screen__firework result-screen__firework--${index + 1}" style="left:${left}%;top:${top}%"></span>`;
  }).join("");
}

export function createResultScreen({ result, onRestart, onChangeTheme }) {
  const element = document.createElement("section");
  element.className = `scene scene--result scene--${result.theme.id}`;
  element.innerHTML = `
    <div class="result-screen result-screen--refresh">
      <div class="result-screen__backdrop"></div>
      <div class="result-screen__confetti"></div>
      <div class="result-screen__fireworks">
        ${renderFireworks()}
      </div>
      <div class="result-screen__toolbar">
        <button class="cta-button result-screen__restart-top" type="button" data-action="restart">
          <span>처음부터 다시</span>
          <span>はじめから</span>
        </button>
        <button class="secondary-button result-screen__change-top" type="button" data-action="change">
          <span>다른 테마 보기</span>
          <span>テーマ えらび</span>
        </button>
      </div>
      <div class="result-screen__panel ${result.success ? "is-success" : "is-soft"}">
        <div class="result-screen__summary">
          <img class="result-screen__stamp" src="${result.stamp}" alt="SEOJUN and SEOJIN stamp" />
          <div class="result-screen__headline">
            <p>${result.headline.ko}</p>
            <p>${result.headline.ja}</p>
          </div>
          <div class="result-screen__score">
            <strong>${result.caughtCount}</strong>
            <div>
              <p>잡은 수 / つかまえた かず</p>
              <p>${result.caughtCount} / ${result.totalRounds}${result.success ? " + BOSS" : ""}</p>
            </div>
          </div>
        </div>
        <div class="result-screen__preview-wrap">
          <p class="result-screen__preview-title">잡은 친구들 / つかまえた なかま</p>
          <div class="result-screen__preview-grid">
            ${renderPreviewList(result.caughtObjects)}
          </div>
        </div>
      </div>
    </div>
  `;

  element.querySelector('[data-action="restart"]')?.addEventListener("click", () => onRestart?.());
  element.querySelector('[data-action="change"]')?.addEventListener("click", () => onChangeTheme?.());

  return { element };
}
