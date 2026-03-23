export function createTargetIntroScreen({ theme, target, leadMessage }) {
  const element = document.createElement("section");
  element.className = `scene scene--target-intro scene--${theme.id}`;
  element.innerHTML = `
    <div class="intro-burst"></div>
    <div class="scene-card scene-card--focus">
      <p class="eyebrow">ROUND TARGET</p>
      <div class="target-intro__lead">
        <p>\uc11c\uc900\u002c\u0020\uc11c\uc9c4\uc544\u0020${leadMessage.ko}</p>
        <p>\u30bd\u30b8\u30e5\u30f3\u3001\u30bd\u30b8\u30f3\u0020${leadMessage.ja}</p>
      </div>
      <div class="target-intro__image-wrap">
        <img src="${target.image}" alt="${target.label.ko}" />
      </div>
      <div class="target-intro__name">
        <h2>${target.label.ko}</h2>
        <h3>${target.label.ja}</h3>
      </div>
    </div>
  `;
  return { element };
}
