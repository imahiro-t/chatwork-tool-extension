let srcNode;
let dummyNode;

document.addEventListener("mousemove", (event) => {
  if (event.shiftKey) {
    if (event.target.classList.contains("userIconImage")) {
      const node = event.target.closest("button");
      if (node && !srcNode && !dummyNode) {
        srcNode = node;
        dummyNode = srcNode.cloneNode(true);
        node.parentNode.replaceChild(dummyNode, srcNode);
      }
    }
  }
});

document.addEventListener("mouseout", (event) => {
  if (event.target.classList.contains("userIconImage")) {
    const node = event.target.closest("button");
    if (node && srcNode && dummyNode) {
      node.parentNode.replaceChild(srcNode, dummyNode);
      srcNode = undefined;
      dummyNode = undefined;
    }
  }
});

document.addEventListener("mousedown", (event) => {
  if (event.shiftKey) {
    const to = findTo(event.target);
    const textarea = document.querySelector("#_chatText");
    if (to && textarea) {
      textarea.value = `${to}\n${textarea.value}`;
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
