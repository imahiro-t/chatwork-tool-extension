document.addEventListener("mousedown", (event) => {
  if (event.shiftKey) {
    const to = findTo(event.target);
    const textarea = document.querySelector("#_chatText");
    if (to && textarea) {
      textarea.value = `${to}\n${textarea.value}`;
      setTimeout(() => {
        const targetNode = document
          .querySelector("#_wrapper")
          ?.lastChild?.firstChild?.setAttribute("style", "opacity: 0;");
      }, 100);
    }
  }
});

const findTo = (node) => {
  if (node.classList.contains("userIconImage")) {
    const name = node.getAttribute("alt");
    const suffix = document.documentElement.lang === "ja" ? "さん" : "";
    const aid = node.parentNode?.getAttribute("data-aid");
    return `[To:${aid}]${name}${suffix}`;
  } else {
    return null;
  }
};
