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
    <div class="result-screen">
      <div class="result-screen__backdrop"></div>
      <div class="result-screen__confetti"></div>
      <div class="result-screen__fireworks">
        ${renderFireworks()}
      </div>
      <div class="result-screen__panel ${result.success ? "is-success" : "is-soft"}">
        <div class="result-screen__hero">
          <img class="result-screen__stamp" src="${result.stamp}" alt="SEOJUN and SEOJIN stamp" />
          <div class="result-screen__headline">
            <p>${result.headline.ko}</p>
            <p>${result.headline.ja}</p>
          </div>
          <div class="result-screen__score">
            <strong>${result.caughtCount}</strong>
            <div>
              <p>잡은 개수 / つかまえた かず</p>
              <p>${result.caughtCount} / ${result.totalRounds}${result.success ? " + BOSS" : ""}</p>
            </div>
          </div>
        </div>
        <div class="result-screen__preview-grid">
          ${renderPreviewList(result.caughtObjects)}
        </div>
        <div class="result-screen__actions">
          <button class="cta-button" type="button" data-action="restart">
            <span>다시 하기</span>
            <span>もういちど</span>
          </button>
          <button class="secondary-button" type="button" data-action="change">
            <span>테마 바꾸기</span>
            <span>テーマを かえる</span>
          </button>
        </div>
      </div>
    </div>
  `;

  element.querySelector('[data-action="restart"]')?.addEventListener("click", () => onRestart?.());
  element.querySelector('[data-action="change"]')?.addEventListener("click", () => onChangeTheme?.());

  return { element };
}
