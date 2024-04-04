let mousePositionNodeForCopyLink;
let srcNodeForCopyLink;
let currentMessageId;

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
  if (
    node &&
    !document.querySelector("#__link_to_clipboard") &&
    !srcNodeForCopyLink
  ) {
    srcNodeForCopyLink = node;
    const dummyNodeForCopyLink = node.cloneNode(true);
    dummyNodeForCopyLink.id = "__link_to_clipboard";
    try {
      const svg = htmlStringToNode(
        `<svg xmlns="http://www.w3.org/2000/svg" height="16" viewBox="0 -960 960 960" width="16">
        <path d="m678-134 46-46-64-64-46 46q-14 14-14 32t14 32q14 14 32 14t32-14Zm102-102 46-46q14-14 14-32t-14-32q-14-14-32-14t-32 14l-46 46 64 64ZM735-77q-37 37-89 37t-89-37q-37-37-37-89t37-89l148-148q37-37 89-37t89 37q37 37 37 89t-37 89L735-77ZM200-200v-560 560Zm0 80q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h168q13-36 43.5-58t68.5-22q38 0 68.5 22t43.5 58h168q33 0 56.5 23.5T840-760v245q-20-5-40-5t-40 3v-243H200v560h243q-3 20-3 40t5 40H200Zm280-670q13 0 21.5-8.5T510-820q0-13-8.5-21.5T480-850q-13 0-21.5 8.5T450-820q0 13 8.5 21.5T480-790ZM280-600v-80h400v80H280Zm0 160v-80h400v34q-8 5-15.5 11.5T649-460l-20 20H280Zm0 160v-80h269l-49 49q-8 8-14.5 15.5T474-280H280Z"/>
        </svg>`
      );
      dummyNodeForCopyLink.firstChild.replaceChild(
        svg,
        dummyNodeForCopyLink.firstChild.firstChild
      );
      node.parentNode.replaceChild(dummyNodeForCopyLink, srcNodeForCopyLink);
      if (!relatedEventNode) {
        mousePositionNodeForCopyLink = dummyNodeForCopyLink;
      }
    } catch (_e) {}
  }
};

const recoverFromDummyForCopyLink = (eventNode, relatedEventNode) => {
  if (relatedEventNode && targetNodeForCopyLink(relatedEventNode)) {
    return;
  }
  const node = targetNodeForCopyLink(eventNode);
  const dummyNodeForCopyLink = document.querySelector("#__link_to_clipboard");
  if (node && srcNodeForCopyLink && dummyNodeForCopyLink) {
    try {
      node.parentNode.replaceChild(srcNodeForCopyLink, dummyNodeForCopyLink);
      if (!relatedEventNode) {
        mousePositionNodeForCopyLink = srcNodeForCopyLink;
      }
    } catch (_e) {
    } finally {
      srcNodeForCopyLink = undefined;
    }
  }
};

const targetNodeForCopyLink = (eventNode) => {
  let buttonNode;
  if (eventNode.nodeName === "BUTTON") {
    buttonNode = eventNode;
  } else {
    buttonNode = eventNode.closest("button");
  }
  if (!buttonNode) {
    return null;
  }
  if (buttonNode.id === "__link_to_clipboard") {
    return buttonNode;
  } else {
    const node = buttonNode.firstChild?.firstChild?.firstChild;
    return node &&
      node.nodeName === "use" &&
      node.getAttribute("href") === "#icon_link"
      ? buttonNode
      : null;
  }
};

document.addEventListener("mousedown", (event) => {
  const mid = event.target.closest("._message")?.getAttribute("data-mid");
  if (mid) {
    currentMessageId = mid;
  }
  if (event.shiftKey) {
    const node = targetNodeForCopyLink(event.target);
    if (node && currentMessageId) {
      navigator.clipboard.writeText(`${location.href}-${currentMessageId}`);
    }
  }
});
