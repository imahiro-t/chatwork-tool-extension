let mousePositionNode;
let srcNode;
let dummyNode;

document.addEventListener("mousemove", (event) => {
  mousePositionNode = event.target;
});

document.addEventListener("mouseover", (event) => {
  if (event.shiftKey) {
    replaceToDummy(event.target, event.relatedTarget);
  }
});

document.addEventListener("mouseout", (event) => {
  if (event.shiftKey) {
    recoverFromDummy(event.target, event.relatedTarget);
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

const replaceToDummy = (eventNode, relatedEventNode) => {
  if (relatedEventNode && targetNode(relatedEventNode)) {
    return;
  }
  const node = targetNode(eventNode);
  if (node && !srcNode && !dummyNode) {
    srcNode = node;
    dummyNode = srcNode.cloneNode(true);
    try {
      node.parentNode.replaceChild(dummyNode, srcNode);
    } catch (_e) {}
  }
};

const recoverFromDummy = (eventNode, relatedEventNode) => {
  if (relatedEventNode && targetNode(relatedEventNode)) {
    return;
  }
  const node = targetNode(eventNode);
  if (node && srcNode && dummyNode) {
    try {
      node.parentNode.replaceChild(srcNode, dummyNode);
    } catch (_e) {
    } finally {
      srcNode = undefined;
      dummyNode = undefined;
    }
  }
};

const targetNode = (eventNode) => {
  if (eventNode.classList.contains("userIconImage")) {
    return eventNode.closest("button");
  } else {
    return null;
  }
};

document.addEventListener("mousedown", (event) => {
  if (event.shiftKey) {
    const to = findTo(event.target);
    const textarea = document.querySelector("#_chatText");
    if (to && textarea) {
      textarea.value = `${to}\n${textarea.value}`;
      textarea.dispatchEvent(
        new Event("input", {
          bubbles: true,
        })
      );
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
