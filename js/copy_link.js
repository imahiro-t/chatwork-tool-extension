let mousePositionNodeForCopyLink;
let srcNodeForCopyLink;
let dummyNodeForCopyLink;

document.addEventListener("mousemove", (event) => {
  mousePositionNodeForCopyLink = event.target;
});

document.addEventListener("mouseover", (event) => {
  if (event.shiftKey) {
    replaceToDummyForCopyLink(event.target, event.relatedTarget);
  }
});

document.addEventListener("mouseout", (event) => {
  if (event.shiftKey) {
    recoverFromDummyForCopyLink(event.target, event.relatedTarget);
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Shift") {
    replaceToDummyForCopyLink(mousePositionNodeForCopyLink);
  }
});

document.addEventListener("keyup", (event) => {
  if (event.key === "Shift") {
    recoverFromDummyForCopyLink(mousePositionNodeForCopyLink);
  }
});

const replaceToDummyForCopyLink = (eventNode, relatedEventNode) => {
  if (relatedEventNode && targetNodeForCopyLink(relatedEventNode)) {
    return;
  }
  const node = targetNodeForCopyLink(eventNode);
  if (node && !srcNodeForCopyLink && !dummyNodeForCopyLink) {
    srcNodeForCopyLink = node;
    dummyNodeForCopyLink = node.cloneNode(true);
    try {
      node.parentNode.replaceChild(dummyNodeForCopyLink, srcNodeForCopyLink);
    } catch (_e) {}
  }
};

const recoverFromDummyForCopyLink = (eventNode, relatedEventNode) => {
  if (relatedEventNode && targetNodeForCopyLink(relatedEventNode)) {
    return;
  }
  const node = targetNodeForCopyLink(eventNode);
  if (node && srcNodeForCopyLink && dummyNodeForCopyLink) {
    try {
      node.parentNode.replaceChild(srcNodeForCopyLink, dummyNodeForCopyLink);
    } catch (_e) {
    } finally {
      srcNodeForCopyLink = undefined;
      dummyNodeForCopyLink = undefined;
    }
  }
};

const targetNodeForCopyLink = (eventNode) => {
  let buttonNode;
  if (eventNode.classList.contains("actionButton")) {
    buttonNode = eventNode;
  } else if (eventNode.closest("button")?.classList?.contains("actionButton")) {
    buttonNode = eventNode.closest("button");
  }
  if (!buttonNode) {
    return null;
  }
  const node = buttonNode.firstChild?.firstChild?.firstChild;
  return node && node.getAttribute("href") === "#icon_link" ? buttonNode : null;
};

document.addEventListener("mousedown", (event) => {
  if (event.shiftKey) {
    const node = targetNodeForCopyLink(event.target);
    if (node) {
      const href = location.href;
      const mid = node.closest("._message")?.getAttribute("data-mid");
      if (href && mid) {
        navigator.clipboard.writeText(`${href}-${mid}`);
      }
    }
  }
});
