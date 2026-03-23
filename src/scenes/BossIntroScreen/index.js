export function createBossIntroScreen({ theme, boss, message }) {
  const element = document.createElement("section");
  element.className = `scene scene--boss-intro scene--${theme.id}`;
  element.innerHTML = `
    <div class="boss-intro__flash"></div>
    <div class="scene-card scene-card--boss">
      <p class="eyebrow">BOSS STAGE</p>
      <div class="boss-intro__copy">
        <p>${message.ko}</p>
        <p>${message.ja}</p>
      </div>
      <div class="boss-intro__image-wrap">
        <img src="${boss.image}" alt="${boss.label.ko}" />
      </div>
      <h2>${theme.id === "ocean" ? "\ubcf4\uc2a4\u0020\uc0c1\uc5b4" : "\ubcf4\uc2a4\u0020\ud558\uc57c\ubd80\uc0ac"}</h2>
      <h3>${theme.id === "ocean" ? "\u30dc\u30b9\u0020\u30b5\u30e1" : "\u30dc\u30b9\u0020\u306f\u3084\u3076\u3055"}</h3>
    </div>
  `;
  return { element };
}
