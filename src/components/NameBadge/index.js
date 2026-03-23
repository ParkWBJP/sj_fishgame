export function createNameBadge({ compact = false } = {}) {
  const element = document.createElement("div");
  element.className = compact ? "name-badge name-badge--compact" : "name-badge";
  element.innerHTML = `
    <img class="name-badge__stamp" src="/src/assets/images/shared/seojun-seojin-stamp.svg" alt="SEOJUN and SEOJIN" />
    <div class="name-badge__text">
      <p class="name-badge__ko">\uc11c\uc900\u2665\uc11c\uc9c4\u0020\uc804\uc6a9\u0020\uac8c\uc784</p>
      <p class="name-badge__ja">\u30bd\u30b8\u30e5\u30f3\u2665\u30bd\u30b8\u30f3\u0020\u305b\u3093\u3088\u3046\u30b2\u30fc\u30e0</p>
    </div>
  `;
  return element;
}
