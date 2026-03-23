export function createDragObject({ data, isBoss = false, isTarget = false }) {
  const element = document.createElement("button");
  element.type = "button";
  element.className = [
    "drag-object",
    isBoss ? "drag-object--boss" : "",
    isTarget ? "drag-object--target" : ""
  ]
    .filter(Boolean)
    .join(" ");
  element.innerHTML = `
    <img draggable="false" src="${data.image}" alt="${data.label.ko}" />
    <span class="drag-object__glow"></span>
  `;

  const api = {
    element,
    setPosition(x, y, rotation = 0) {
      element.style.setProperty("--x", `${x}px`);
      element.style.setProperty("--y", `${y}px`);
      element.style.setProperty("--rotate", `${rotation}deg`);
    },
    setSelected(active) {
      element.classList.toggle("is-selected", active);
    },
    setTarget(active) {
      element.classList.toggle("drag-object--target", active);
    },
    shake() {
      element.classList.remove("is-shaking");
      void element.offsetWidth;
      element.classList.add("is-shaking");
    },
    snap() {
      element.classList.remove("is-snapped");
      void element.offsetWidth;
      element.classList.add("is-snapped");
    },
    fadeOut() {
      element.classList.add("is-cleared");
    }
  };

  element.addEventListener("animationend", () => {
    element.classList.remove("is-shaking", "is-snapped");
  });

  return api;
}
