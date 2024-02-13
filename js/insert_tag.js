window.addEventListener("hashchange", (_event) => {
  setTimeout(() => {
    initChatSendArea();
  }, 100);
});

const initChatSendArea = () => {
  const iconParentNode = document
    .querySelector("#_chatSendArea")
    ?.querySelector("._showDescription")?.parentNode;
  if (iconParentNode) {
    iconParentNode.appendChild(createInfoNode(iconParentNode));
    iconParentNode.appendChild(createInfoWithTitleNode(iconParentNode));
    iconParentNode.appendChild(createCodeNode(iconParentNode));
    iconParentNode.appendChild(createHrNode(iconParentNode));
  }
};

const createInfoNode = (iconParentNode) => {
  const infoSvg = htmlStringToNode(
    `<svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24" height="16px" viewBox="0 0 24 24" width="16px" fill="#000000"><g><rect fill="none" height="24" width="24" x="0"/></g><g><g><g><path d="M4,9h16v2H4V9z M4,13h10v2H4V13z"/></g></g></g></svg>`
  );
  const infoNode = iconParentNode.firstChild.cloneNode(true);
  infoNode.setAttribute("data-tooltip", "[info]");
  infoNode.querySelector("button")?.setAttribute("id", "__tag_info");
  infoNode.querySelector("button")?.setAttribute("aria-label", "[info]");
  infoNode
    .querySelector("svg")
    ?.parentNode.replaceChild(infoSvg, infoNode.querySelector("svg"));
  infoNode.addEventListener("mousedown", (_event) => {
    const startTag = "[info]";
    const endTag = "[/info]\n";
    insertTag(startTag, endTag);
  });
  return infoNode;
};

const createInfoWithTitleNode = (iconParentNode) => {
  const infoWithTitleSvg = htmlStringToNode(
    `<svg xmlns="http://www.w3.org/2000/svg" height="16px" viewBox="0 0 24 24" width="16px" fill="#000000"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M3 18h12v-2H3v2zM3 6v2h18V6H3zm0 7h18v-2H3v2z"/></svg>`
  );
  const infoWithTitleNode = iconParentNode.firstChild.cloneNode(true);
  infoWithTitleNode.setAttribute("data-tooltip", "[info][title]");
  infoWithTitleNode
    .querySelector("button")
    ?.setAttribute("id", "__tag_info_title");
  infoWithTitleNode
    .querySelector("button")
    ?.setAttribute("aria-label", "[info][title]");
  infoWithTitleNode
    .querySelector("svg")
    ?.parentNode.replaceChild(
      infoWithTitleSvg,
      infoWithTitleNode.querySelector("svg")
    );
  infoWithTitleNode.addEventListener("mousedown", (_event) => {
    if (textSelected()) {
      const startTag = "[info][title][/title]";
      const endTag = "[/info]\n";
      insertTag(startTag, endTag);
    } else {
      const startTag = "[info][title]";
      const endTag = "[/title][/info]\n";
      insertTag(startTag, endTag);
    }
  });
  return infoWithTitleNode;
};

const createCodeNode = (iconParentNode) => {
  const codeSvg = htmlStringToNode(
    `<svg xmlns="http://www.w3.org/2000/svg" height="16px" viewBox="0 0 24 24" width="16px" fill="#000000"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/></svg>`
  );
  const codeNode = iconParentNode.firstChild.cloneNode(true);
  codeNode.setAttribute("data-tooltip", "[code]");
  codeNode.querySelector("button")?.setAttribute("id", "__tag_code");
  codeNode.querySelector("button")?.setAttribute("aria-label", "[code]");
  codeNode
    .querySelector("svg")
    ?.parentNode.replaceChild(codeSvg, codeNode.querySelector("svg"));
  codeNode.addEventListener("mousedown", (_event) => {
    const startTag = "[code]";
    const endTag = "[/code]\n";
    insertTag(startTag, endTag);
  });
  return codeNode;
};

const createHrNode = (iconParentNode) => {
  const hrSvg = htmlStringToNode(
    `<svg xmlns="http://www.w3.org/2000/svg" height="16px" viewBox="0 -960 960 960" width="16px"><path d="M160-440v-80h640v80H160Z"/></svg>`
  );
  const hrNode = iconParentNode.firstChild.cloneNode(true);
  hrNode.setAttribute("data-tooltip", "[hr]");
  hrNode.querySelector("button")?.setAttribute("id", "__tag_hr");
  hrNode.querySelector("button")?.setAttribute("aria-label", "[hr]");
  hrNode
    .querySelector("svg")
    ?.parentNode.replaceChild(hrSvg, hrNode.querySelector("svg"));
  hrNode.addEventListener("mousedown", (_event) => {
    const startTag = "[hr]\n";
    const endTag = "";
    insertTag(startTag, endTag);
  });
  return hrNode;
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

const insertTag = (startTag, endTag) => {
  const textarea = document.querySelector("#_chatText");
  if (textarea) {
    const selectionStart = textarea.selectionStart;
    const selectionEnd = textarea.selectionEnd;
    const before = textarea.value.substring(0, selectionStart);
    const selection = textarea.value.substring(selectionStart, selectionEnd);
    const after = textarea.value.substring(selectionEnd, textarea.value.length);
    textarea.value = before + startTag + selection + endTag + after;
    setTimeout(() => {
      textarea.focus();
      textarea.selectionEnd = selectionEnd + startTag.length;
    }, 100);
  }
};

setTimeout(() => {
  initChatSendArea();
}, 1000);
