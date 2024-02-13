let mousePositionNode;
let srcNode;
let dummyNode;

document.addEventListener("mousemove", (event) => {
  mousePositionNode = event.target;
});

document.addEventListener("mouseover", (event) => {
  if (event.shiftKey) {
    replaceToDummy(event.target);
  }
});

document.addEventListener("mouseout", (event) => {
  if (event.shiftKey) {
    recoverFromDummy(event.target);
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Shift") {
    replaceToDummy(mousePositionNode);
  }
});

document.addEventListener("keyup", (event) => {
  if (event.key === "Shift") {
    recoverFromDummy(mousePositionNode);
  }
});

const replaceToDummy = (eventNode) => {
  if (eventNode.classList.contains("userIconImage")) {
    const node = eventNode.closest("button");
    if (node && !srcNode && !dummyNode) {
      srcNode = node;
      dummyNode = srcNode.cloneNode(true);
      try {
        node.parentNode.replaceChild(dummyNode, srcNode);
      } catch (_e) {}
    }
  }
};

const recoverFromDummy = (eventNode) => {
  if (eventNode.classList.contains("userIconImage")) {
    const node = eventNode.closest("button");
    if (node && srcNode && dummyNode) {
      try {
        node.parentNode.replaceChild(srcNode, dummyNode);
      } catch (_e) {
      } finally {
        srcNode = undefined;
        dummyNode = undefined;
      }
    }
  }
};

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
