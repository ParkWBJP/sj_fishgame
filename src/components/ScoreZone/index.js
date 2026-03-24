export function createScoreZone(themeId) {
  const element = document.createElement("div");
  element.className = `score-zone score-zone--${themeId}`;
  element.innerHTML = `
    <div class="score-zone__inner">
      <div class="score-zone__handle"></div>
      <div class="score-zone__ring"></div>
      <div class="score-zone__mesh"></div>
      <p>${themeId === "ocean" ? "\uadf8\ubb3c\ub9dd\u0020\u002f\u0020\u3042\u307f" : "\ud130\ub110\u0020\u002f\u0020\u30c8\u30f3\u30cd\u30eb"}</p>
    </div>
  `;

  return {
    element,
    containsPoint(clientX, clientY) {
      const rect = element.getBoundingClientRect();
      const padding = 48;
      return (
        clientX >= rect.left - padding &&
        clientX <= rect.right + padding &&
        clientY >= rect.top - padding &&
        clientY <= rect.bottom + padding
      );
    },
    highlight(active) {
      element.classList.toggle("is-hot", active);
    }
  };
}
