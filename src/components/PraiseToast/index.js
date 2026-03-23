export function createPraiseToast() {
  const element = document.createElement("div");
  element.className = "praise-toast";

  let timeoutId = null;

  return {
    element,
    show(message) {
      window.clearTimeout(timeoutId);
      element.classList.add("is-visible");
      element.innerHTML = `
        <div class="praise-toast__sparkles">★ ✦ ♥</div>
        <p>${message.ko}</p>
        <p>${message.ja}</p>
      `;
      timeoutId = window.setTimeout(() => {
        element.classList.remove("is-visible");
      }, 900);
    }
  };
}
