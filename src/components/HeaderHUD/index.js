export function createHeaderHUD() {
  const element = document.createElement("div");
  element.className = "header-hud";

  function renderProgress(totalRounds, caughtCount, roundIndex) {
    return Array.from({ length: totalRounds }, (_, index) => {
      const classes = [
        "header-hud__step",
        index < caughtCount ? "is-caught" : "",
        index === roundIndex ? "is-current" : ""
      ]
        .filter(Boolean)
        .join(" ");

      return `<span class="${classes}"></span>`;
    }).join("");
  }

  return {
    element,
    update({ timeLeft, totalRounds, caughtCount, roundIndex, target, themeLabel }) {
      element.innerHTML = `
        <div class="header-hud__timer">
          <span class="header-hud__value">${String(timeLeft).padStart(2, "0")}</span>
          <span class="header-hud__label">\ucd08\u0020\u002f\u0020\u3073\u3087\u3046</span>
        </div>
        <div class="header-hud__target">
          <span class="header-hud__chip">${themeLabel.ko} / ${themeLabel.ja}</span>
          <img src="${target.image}" alt="${target.label.ko}" />
          <div>
            <p>${target.label.ko}</p>
            <p>${target.label.ja}</p>
          </div>
        </div>
        <div class="header-hud__progress">
          <div class="header-hud__steps">${renderProgress(totalRounds, caughtCount, roundIndex)}</div>
          <p>${caughtCount}/${totalRounds}</p>
        </div>
      `;
    }
  };
}
