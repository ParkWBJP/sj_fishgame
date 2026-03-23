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
      <div class="ambient-backdrop__layer ambient-backdrop__layer--caustics"></div>
      <div class="ambient-backdrop__layer ambient-backdrop__layer--rays"></div>
      <div class="ambient-backdrop__layer ambient-backdrop__layer--reef"></div>
      <div class="ambient-backdrop__layer ambient-backdrop__layer--current"></div>
      <div class="ambient-backdrop__bubbles">
        ${makeParticles(16, "ambient-backdrop__bubble", (index) => ({
          left: `${4 + ((index * 6.2) % 88)}%`,
          bottom: `${-18 - (index % 4) * 12}%`,
          width: `${18 + (index % 5) * 8}px`,
          height: `${18 + (index % 5) * 8}px`,
          animationDelay: `${index * -1.2}s`,
          animationDuration: `${10 + (index % 4) * 2.8}s`
        }))}
      </div>
      <div class="ambient-backdrop__specks">
        ${makeParticles(28, "ambient-backdrop__speck", (index) => ({
          left: `${(index * 3.7) % 100}%`,
          top: `${(index * 11) % 100}%`,
          animationDelay: `${index * -0.8}s`,
          animationDuration: `${14 + (index % 5) * 2}s`
        }))}
      </div>
    `;
  } else {
    element.innerHTML = `
      <div class="ambient-backdrop__layer ambient-backdrop__layer--roof-glow"></div>
      <div class="ambient-backdrop__layer ambient-backdrop__layer--platform"></div>
      <div class="ambient-backdrop__layer ambient-backdrop__layer--signal"></div>
      <div class="ambient-backdrop__layer ambient-backdrop__layer--train-pass"></div>
      <div class="ambient-backdrop__layer ambient-backdrop__layer--light-scan"></div>
      <div class="ambient-backdrop__dust">
        ${makeParticles(24, "ambient-backdrop__dust-dot", (index) => ({
          left: `${(index * 4.3) % 100}%`,
          top: `${12 + ((index * 7.7) % 68)}%`,
          animationDelay: `${index * -0.7}s`,
          animationDuration: `${8 + (index % 6) * 1.4}s`
        }))}
      </div>
    `;
  }

  return { element };
}
