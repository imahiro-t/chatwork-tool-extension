let mousePositionNode;
let srcNode;

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
  if (node && !document.querySelector("#__insert_to_tag") && !srcNode) {
    srcNode = node;
    const dummyNode = srcNode.cloneNode(true);
    dummyNode.id = "__insert_to_tag";
    dummyNode.style.filter = "sepia(0.7)";
    try {
      node.parentNode.replaceChild(dummyNode, srcNode);
      if (!relatedEventNode) {
        mousePositionNode = dummyNode;
      }
    } catch (_e) {}
  }
};

const recoverFromDummy = (eventNode, relatedEventNode) => {
  if (relatedEventNode && targetNode(relatedEventNode)) {
    return;
  }
  const node = targetNode(eventNode);
  const dummyNode = document.querySelector("#__insert_to_tag");
  if (node && srcNode && dummyNode) {
    try {
      node.parentNode.replaceChild(srcNode, dummyNode);
      if (!relatedEventNode) {
        mousePositionNode = srcNode;
      }
    } catch (_e) {
    } finally {
      srcNode = undefined;
    }
  }
};

const targetNode = (eventNode) => {
  let buttonNode;
  if (
    eventNode.nodeName === "BUTTON" &&
    eventNode.querySelector(".userIconImage")
  ) {
    buttonNode = eventNode;
  } else if (eventNode.classList.contains("userIconImage")) {
    buttonNode = eventNode.closest("button");
  }
  return buttonNode;
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
