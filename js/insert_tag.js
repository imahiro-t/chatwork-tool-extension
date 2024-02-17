window.addEventListener("hashchange", (_event) => {
  setTimeout(() => {
    initChatSendArea();
    initTaskArea();
  }, 100);
});

document.addEventListener("click", (event) => {
  if (
    event.target.closest("#_taskInputInActive")?.firstChild?.id ===
    "_taskAddArea"
  ) {
    initTaskArea();
  }
});

const initChatSendArea = () => {
  const iconParentNode = document
    .querySelector("#_chatSendArea")
    ?.querySelector("._showDescription")?.parentNode;
  if (iconParentNode) {
    if (
      iconParentNode.lastChild.querySelector("button")?.id !== "__tag_hr_chat"
    ) {
      iconParentNode.appendChild(createInfoNode(iconParentNode, "chat"));
      iconParentNode.appendChild(
        createInfoWithTitleNode(iconParentNode, "chat")
      );
      iconParentNode.appendChild(createCodeNode(iconParentNode, "chat"));
      iconParentNode.appendChild(createHrNode(iconParentNode, "chat"));
    }
  }
};

const initTaskArea = () => {
  const iconParentNode = document
    .querySelector("#_chatSendArea")
    ?.querySelector("._showDescription")?.parentNode;
  const taskParentNode = document.querySelector("#_taskInputActive");
  if (iconParentNode && taskParentNode) {
    if (taskParentNode.firstChild.id !== "__task_icon_node") {
      const iconsNode = iconParentNode.parentNode?.cloneNode(false);
      iconsNode.setAttribute("style", "margin-top: -8px; padding: 0px 0px 4px");
      iconsNode.setAttribute("id", "__task_icon_node");
      const ul = iconParentNode.cloneNode(false);
      iconsNode.appendChild(ul);
      iconsNode.firstChild.appendChild(createInfoNode(iconParentNode, "task"));
      iconsNode.firstChild.appendChild(
        createInfoWithTitleNode(iconParentNode, "task")
      );
      iconsNode.firstChild.appendChild(createCodeNode(iconParentNode, "task"));
      iconsNode.firstChild.appendChild(createHrNode(iconParentNode, "task"));
      iconsNode.firstChild.appendChild(
        createPleaseNode(iconParentNode, "task")
      );
      iconsNode.firstChild.appendChild(createBowNode(iconParentNode, "task"));
      taskParentNode.firstChild.before(iconsNode);
    }
  }
};

const createInfoNode = (iconParentNode, targetType) => {
  const svg = htmlStringToNode(
    `<svg xmlns="http://www.w3.org/2000/svg" height="16px" viewBox="0 0 24 24" width="16px" fill-rule="evenodd">
    <rect fill="none" height="24" width="24" x="0"/>
    <path d="M4,9h16v2H4V9z M4,13h10v2H4V13z"/>
    </svg>`
  );
  const node = iconParentNode.firstChild.cloneNode(true);
  const id = `__tag_info_${targetType}`;
  node.setAttribute("data-tooltip", "[info]");
  node.querySelector("button")?.setAttribute("id", id);
  node.querySelector("button")?.setAttribute("aria-label", "[info]");
  node
    .querySelector("svg")
    ?.parentNode.replaceChild(svg, node.querySelector("svg"));
  node.addEventListener("mousedown", (_event) => {
    const startTag = "[info]";
    const endTag = "[/info]\n";
    insertTag(startTag, endTag, targetType);
  });
  return node;
};

const createInfoWithTitleNode = (iconParentNode, targetType) => {
  const svg = htmlStringToNode(
    `<svg xmlns="http://www.w3.org/2000/svg" height="16px" viewBox="0 0 24 24" width="16px" fill-rule="evenodd">
    <path d="M0 0h24v24H0V0z" fill="none"/>
    <path d="M3 18h12v-2H3v2zM3 6v2h18V6H3zm0 7h18v-2H3v2z"/>
    </svg>`
  );
  const node = iconParentNode.firstChild.cloneNode(true);
  const id = `__tag_info_title_${targetType}`;
  node.setAttribute("data-tooltip", "[info][title]");
  node.querySelector("button")?.setAttribute("id", id);
  node.querySelector("button")?.setAttribute("aria-label", "[info][title]");
  node
    .querySelector("svg")
    ?.parentNode.replaceChild(svg, node.querySelector("svg"));
  node.addEventListener("mousedown", (_event) => {
    if (textSelected()) {
      const startTag = "[info][title][/title]";
      const endTag = "[/info]\n";
      insertTag(startTag, endTag, targetType);
    } else {
      const startTag = "[info][title]";
      const endTag = "[/title][/info]\n";
      insertTag(startTag, endTag, targetType);
    }
  });
  return node;
};

const createCodeNode = (iconParentNode, targetType) => {
  const svg = htmlStringToNode(
    `<svg xmlns="http://www.w3.org/2000/svg" height="16px" viewBox="0 0 24 24" width="16px" fill-rule="evenodd">
    <path d="M0 0h24v24H0V0z" fill="none"/>
    <path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/>
    </svg>`
  );
  const node = iconParentNode.firstChild.cloneNode(true);
  const id = `__tag_code_${targetType}`;
  node.setAttribute("data-tooltip", "[code]");
  node.querySelector("button")?.setAttribute("id", id);
  node.querySelector("button")?.setAttribute("aria-label", "[code]");
  node
    .querySelector("svg")
    ?.parentNode.replaceChild(svg, node.querySelector("svg"));
  node.addEventListener("mousedown", (_event) => {
    const startTag = "[code]";
    const endTag = "[/code]\n";
    insertTag(startTag, endTag, targetType);
  });
  return node;
};

const createHrNode = (iconParentNode, targetType) => {
  const svg = htmlStringToNode(
    `<svg xmlns="http://www.w3.org/2000/svg" height="16px" viewBox="0 -960 960 960" width="16px">
    <path d="M160-440v-80h640v80H160Z" fill-rule="evenodd"/>
    </svg>`
  );
  const node = iconParentNode.firstChild.cloneNode(true);
  const id = `__tag_hr_${targetType}`;
  node.setAttribute("data-tooltip", "[hr]");
  node.querySelector("button")?.setAttribute("id", id);
  node.querySelector("button")?.setAttribute("aria-label", "[hr]");
  node
    .querySelector("svg")
    ?.parentNode.replaceChild(svg, node.querySelector("svg"));
  node.addEventListener("mousedown", (_event) => {
    const startTag = "[hr]\n";
    const endTag = "";
    insertTag(startTag, endTag, targetType);
  });
  return node;
};

const createPleaseNode = (iconParentNode, targetType) => {
  const image = htmlStringToNode(
    `<img src="https://assets.chatwork.com/images/emoticon2x/emo_please.gif" alt="(please)" style="width: 16px; height: 16px;">`
  );
  const node = iconParentNode.firstChild.cloneNode(true);
  const id = `__icon_please_${targetType}`;
  node.setAttribute("data-tooltip", "(please)");
  node.querySelector("button")?.setAttribute("id", id);
  node.querySelector("button")?.setAttribute("aria-label", "(please)");
  node
    .querySelector("svg")
    ?.parentNode.replaceChild(image, node.querySelector("svg"));
  node.addEventListener("mousedown", (_event) => {
    const startTag = "(please)\n";
    const endTag = "";
    insertTag(startTag, endTag, targetType);
  });
  return node;
};

const createBowNode = (iconParentNode, targetType) => {
  const image = htmlStringToNode(
    `<img src="https://assets.chatwork.com/images/emoticon2x/emo_bow.gif" alt="(bow)" style="width: 16px; height: 16px;">`
  );
  const node = iconParentNode.firstChild.cloneNode(true);
  const id = `__icon_bow_${targetType}`;
  node.setAttribute("data-tooltip", "(bow)");
  node.querySelector("button")?.setAttribute("id", id);
  node.querySelector("button")?.setAttribute("aria-label", "(bow)");
  node
    .querySelector("svg")
    ?.parentNode.replaceChild(image, node.querySelector("svg"));
  node.addEventListener("mousedown", (_event) => {
    const startTag = "(bow)\n";
    const endTag = "";
    insertTag(startTag, endTag, targetType);
  });
  return node;
};

const htmlStringToNode = (str) => {
  return document.createRange().createContextualFragment(str).firstChild;
};

const textSelected = () => {
  const textarea = document.querySelector("#_chatText");
  if (textarea) {
    const selectionStart = textarea.selectionStart;
    const selectionEnd = textarea.selectionEnd;
    return selectionStart !== selectionEnd;
  } else {
    return false;
  }
};

const insertTag = (startTag, endTag, targetType) => {
  const textarea =
    targetType === "chat"
      ? document.querySelector("#_chatText")
      : document.querySelector("#_taskInputActive textarea");
  if (textarea) {
    const selectionStart = textarea.selectionStart;
    const selectionEnd = textarea.selectionEnd;
    const before = textarea.value.substring(0, selectionStart);
    const selection = textarea.value.substring(selectionStart, selectionEnd);
    const after = textarea.value.substring(selectionEnd, textarea.value.length);
    textarea.value = before + startTag + selection + endTag + after;
    textarea.dispatchEvent(
      new Event("input", {
        bubbles: true,
      })
    );
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = selectionEnd + startTag.length;
      textarea.selectionEnd = selectionEnd + startTag.length;
    }, 100);
  }
};

setTimeout(() => {
  initChatSendArea();
  initTaskArea();
}, 1000);
