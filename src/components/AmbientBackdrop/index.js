function makeParticles(count, className, valueFactory) {
  return Array.from({ length: count }, (_, index) => {
    const values = valueFactory(index);
    const style = Object.entries(values)
      .map(([key, value]) => `${key}:${value}`)
      .join(";");
    return `<span class="${className}" style="${style}"></span>`;
  }).join("");
}

export function createAmbientBackdrop(themeId) {
  const element = document.createElement("div");
  element.className = `ambient-backdrop ambient-backdrop--${themeId}`;

  if (themeId === "ocean") {
    element.innerHTML = `
      <div class="ambient-backdrop__layer ambient-backdrop__layer--depth-haze"></div>
      <div class="ambient-backdrop__layer ambient-backdrop__layer--caustics"></div>
      <div class="ambient-backdrop__layer ambient-backdrop__layer--rays"></div>
      <div class="ambient-backdrop__layer ambient-backdrop__layer--shoal"></div>
      <div class="ambient-backdrop__layer ambient-backdrop__layer--wreck"></div>
      <div class="ambient-backdrop__layer ambient-backdrop__layer--seabed-glow"></div>
      <div class="ambient-backdrop__layer ambient-backdrop__layer--reef"></div>
      <div class="ambient-backdrop__layer ambient-backdrop__layer--kelp-left"></div>
      <div class="ambient-backdrop__layer ambient-backdrop__layer--kelp-right"></div>
      <div class="ambient-backdrop__layer ambient-backdrop__layer--current"></div>
      <div class="ambient-backdrop__bubbles">
        ${makeParticles(22, "ambient-backdrop__bubble", (index) => ({
          left: `${3 + ((index * 4.9) % 92)}%`,
          bottom: `${-24 - (index % 5) * 8}%`,
          width: `${16 + (index % 6) * 7}px`,
          height: `${16 + (index % 6) * 7}px`,
          animationDelay: `${index * -0.95}s`,
          animationDuration: `${10 + (index % 5) * 2.4}s`
        }))}
      </div>
      <div class="ambient-backdrop__specks">
        ${makeParticles(48, "ambient-backdrop__speck", (index) => ({
          left: `${(index * 2.7) % 100}%`,
          top: `${6 + ((index * 6.8) % 86)}%`,
          animationDelay: `${index * -0.42}s`,
          animationDuration: `${12 + (index % 6) * 1.7}s`
        }))}
      </div>
    `;
  } else {
    element.innerHTML = `
      <div class="ambient-backdrop__layer ambient-backdrop__layer--roof-glow"></div>
      <div class="ambient-backdrop__layer ambient-backdrop__layer--beam-grid"></div>
      <div class="ambient-backdrop__layer ambient-backdrop__layer--distant-train"></div>
      <div class="ambient-backdrop__layer ambient-backdrop__layer--platform"></div>
      <div class="ambient-backdrop__layer ambient-backdrop__layer--platform-props"></div>
      <div class="ambient-backdrop__layer ambient-backdrop__layer--signal"></div>
      <div class="ambient-backdrop__layer ambient-backdrop__layer--track-gloss"></div>
      <div class="ambient-backdrop__layer ambient-backdrop__layer--train-pass"></div>
      <div class="ambient-backdrop__layer ambient-backdrop__layer--light-scan"></div>
      <div class="ambient-backdrop__dust">
        ${makeParticles(30, "ambient-backdrop__dust-dot", (index) => ({
          left: `${(index * 3.4) % 100}%`,
          top: `${8 + ((index * 5.9) % 76)}%`,
          animationDelay: `${index * -0.6}s`,
          animationDuration: `${7 + (index % 5) * 1.4}s`
        }))}
      </div>
    `;
  }

  return { element };
}
