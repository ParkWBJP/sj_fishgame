export function renderPreviewList(objects) {
  return objects
    .map(
      (object) => `
        <div class="result-preview">
          <img src="${object.image}" alt="${object.label.ko}" />
          <p>${object.label.ko}</p>
          <p>${object.label.ja}</p>
        </div>
      `
    )
    .join("");
}
