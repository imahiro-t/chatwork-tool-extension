window.addEventListener("load", (event) => {
  setTimeout(() => {
    initChatSendArea();
    initTaskArea();
  }, 1000);
});

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
  } else if (isAddTaskClicked(event.target)) {
    initTaskArea();
  } else if (
    event.target.classList?.contains("emoticonTooltip__emoticonContainer")
  ) {
    const emoji = findEmojiFromImage(event.target.firstChild);
    if (emoji) {
      countUpEmoji(emoji);
    }
  } else if (
    event.target.parentNode?.classList?.contains(
      "emoticonTooltip__emoticonContainer"
    )
  ) {
    const emoji = findEmojiFromImage(event.target);
    if (emoji) {
      countUpEmoji(emoji);
    }
  }
});

const isAddTaskClicked = (target) => {
  let buttonNode;
  if (target.classList.contains("actionButton")) {
    buttonNode = target;
  } else if (target.closest("button")?.classList?.contains("actionButton")) {
    buttonNode = target.closest("button");
  }
  if (!buttonNode) {
    return false;
  }
  const node = buttonNode.firstChild?.firstChild?.firstChild;
  return node && node.getAttribute("href") === "#icon_task";
};

const TARGET_TYPE = Object.freeze({
  chat: "chat",
  task: "task",
});

const EMOJI = Object.freeze({
  smile: ":)",
  sad: ":(",
  more_smile: ":D",
  lucky: "8-)",
  surprise: ":o",
  wink: ";)",
  tears: ";(",
  sweat: "(sweat)",
  mumu: ":|",
  kiss: ":*",
  tongueout: ":p",
  blush: "(blush)",
  wonder: ":^)",
  snooze: "|-)",
  love: "(inlove)",
  grin: "]:)",
  talk: "(talk)",
  yawn: "(yawn)",
  puke: "(puke)",
  ikemen: "(emo)",
  otaku: "8-|",
  ninmari: ":#)",
  nod: "(nod)",
  shake: "(shake)",
  wry_smile: "(^^;)",
  whew: "(whew)",
  clap: "(clap)",
  bow: "(bow)",
  roger: "(roger)",
  muscle: "(flex)",
  dance: "(dance)",
  komanechi: "(:/)",
  gogo: "(gogo)",
  think: "(think)",
  please: "(please)",
  quick: "(quick)",
  anger: "(anger)",
  devil: "(devil)",
  lightbulb: "(lightbulb)",
  star: "(*)",
  heart: "(h)",
  flower: "(F)",
  cracker: "(cracker)",
  eat: "(eat)",
  cake: "(^)",
  coffee: "(coffee)",
  beer: "(beer)",
  handshake: "(handshake)",
  yes: "(y)",
});

let emojiCount = 5;
const customIcons = ["", "", "", "", ""];
const customTexts = ["", "", "", "", ""];
const customTaskIcons = ["", "", ""];
const customTaskTexts = ["", "", ""];

chrome.storage.sync.get(
  {
    emoji_count: "5",
    icon_1: "",
    text_1: "",
    icon_2: "",
    text_2: "",
    icon_3: "",
    text_3: "",
    icon_4: "",
    text_4: "",
    icon_5: "",
    text_5: "",
    task_icon_1: "",
    task_text_1: "",
    task_icon_2: "",
    task_text_2: "",
    task_icon_3: "",
    task_text_3: "",
  },
  (items) => {
    emojiCount = items.emoji_count;
    customIcons[0] = items.icon_1;
    customTexts[0] = items.text_1;
    customIcons[1] = items.icon_2;
    customTexts[1] = items.text_2;
    customIcons[2] = items.icon_3;
    customTexts[2] = items.text_3;
    customIcons[3] = items.icon_4;
    customTexts[3] = items.text_4;
    customIcons[4] = items.icon_5;
    customTexts[4] = items.text_5;
    customTaskIcons[0] = items.task_icon_1;
    customTaskTexts[0] = items.task_text_1;
    customTaskIcons[1] = items.task_icon_2;
    customTaskTexts[1] = items.task_text_2;
    customTaskIcons[2] = items.task_icon_3;
    customTaskTexts[2] = items.task_text_3;
  }
);

const initChatSendArea = () => {
  const iconParentNode = document
    .querySelector("#_chatSendArea")
    ?.querySelector("._showDescription")?.parentNode;
  if (iconParentNode) {
    if (
      iconParentNode.childNodes &&
      Array.from(iconParentNode.childNodes).every(
        (node) => node.querySelector("button")?.id !== "__tag_info_chat"
      )
    ) {
      iconParentNode.appendChild(
        createInfoNode(iconParentNode, TARGET_TYPE.chat)
      );
      iconParentNode.appendChild(
        createInfoWithTitleNode(iconParentNode, TARGET_TYPE.chat)
      );
      iconParentNode.appendChild(
        createCodeNode(iconParentNode, TARGET_TYPE.chat)
      );
      iconParentNode.appendChild(
        createHrNode(iconParentNode, TARGET_TYPE.chat)
      );
      const emojis = sortedEmojis().slice(0, emojiCount);
      emojis.forEach((emoji) => {
        iconParentNode.appendChild(
          createEmojiNode(iconParentNode, TARGET_TYPE.chat, emoji)
        );
      });
      customIcons.forEach((customIcon, index) => {
        const customText = customTexts[index];
        if (customIcon && customText) {
          iconParentNode.appendChild(
            createCustomEmojiNode(
              iconParentNode,
              TARGET_TYPE.chat,
              customIcon,
              customText
            )
          );
        }
      });
    }
    wrapTextarea(document.querySelector("#_chatText"));
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
      iconsNode.firstChild.appendChild(
        createInfoNode(iconParentNode, TARGET_TYPE.task)
      );
      iconsNode.firstChild.appendChild(
        createInfoWithTitleNode(iconParentNode, TARGET_TYPE.task)
      );
      iconsNode.firstChild.appendChild(
        createCodeNode(iconParentNode, TARGET_TYPE.task)
      );
      iconsNode.firstChild.appendChild(
        createHrNode(iconParentNode, TARGET_TYPE.task)
      );
      iconsNode.firstChild.appendChild(
        createEmojiNode(iconParentNode, TARGET_TYPE.task, "please")
      );
      iconsNode.firstChild.appendChild(
        createEmojiNode(iconParentNode, TARGET_TYPE.task, "bow")
      );
      customTaskIcons.forEach((customIcon, index) => {
        const customText = customTaskTexts[index];
        if (customIcon && customText) {
          iconsNode.firstChild.appendChild(
            createCustomEmojiNode(
              iconParentNode,
              TARGET_TYPE.task,
              customIcon,
              customText
            )
          );
        }
      });
      taskParentNode.firstChild.before(iconsNode);
    }
    const textarea = document.querySelector("#_taskInputActive textarea");
    textarea.style.height = "120px";
    wrapTextarea(textarea);
  }
};

const wrapTextarea = (textarea) => {
  const wrapArea = document.createElement("pre");
  wrapArea.setAttribute("role", "textbox");
  wrapArea.setAttribute("contenteditable", "true");
  wrapArea.setAttribute("aria-multiline", "true");
  wrapArea.setAttribute("aria-labelledby", "txtboxMultilineLabel");
  wrapArea.setAttribute("aria-required", "true");
  wrapArea.setAttribute("class", textarea.getAttribute("class"));
  wrapArea.setAttribute("style", textarea.getAttribute("style"));
  wrapArea.style.position = "absolute";
  textarea.parentNode.insertBefore(wrapArea, textarea);
  textarea.style.color = "transparent";
  textarea.style.backgroundColor = "transparent";
  textarea.style.caretColor = window.getComputedStyle(wrapArea).color;
  textarea.style.position = "relative";
  textarea.style.zIndex = 1;
  textarea.parentNode.style.position = "relative";
  wrapArea.innerHTML = decorateText(textarea.value);

  var mo = new MutationObserver(() => {
    wrapArea.innerHTML = decorateText(textarea.value);
    wrapArea.style.height = textarea.style.height;
  });
  var config = {
    attributes: true,
    childList: true,
    subtree: true,
  };
  mo.observe(textarea, config);

  textarea.addEventListener("input", () => {
    wrapArea.innerHTML = decorateText(textarea.value);
    wrapArea.style.height = textarea.style.height;
    wrapArea.scrollTop = textarea.scrollTop;
  });
  textarea.addEventListener("scroll", () => {
    wrapArea.scrollTop = textarea.scrollTop;
  });
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
    if (textSelected(targetType)) {
      const startTag = "[info][title][/title]";
      const endTag = "[/info]\n";
      insertTag(startTag, endTag, targetType, 13);
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

const createEmojiNode = (iconParentNode, targetType, emoji) => {
  const image = htmlStringToNode(
    `<img src="https://assets.chatwork.com/images/emoticon2x/emo_${emoji}.gif" alt="${EMOJI[emoji]}" style="width: 16px; height: 16px;">`
  );
  const node = iconParentNode.firstChild.cloneNode(true);
  const id = `__icon_${emoji}_${targetType}`;
  node.setAttribute("data-tooltip", EMOJI[emoji]);
  node.querySelector("button")?.setAttribute("id", id);
  node.querySelector("button")?.setAttribute("aria-label", EMOJI[emoji]);
  node
    .querySelector("svg")
    ?.parentNode.replaceChild(image, node.querySelector("svg"));
  node.addEventListener("mousedown", (event) => {
    const startTag = EMOJI[emoji];
    const endTag = "";
    insertTag(startTag, endTag, targetType);
    if (targetType === TARGET_TYPE.chat) {
      countUpEmoji(emoji);
      if ((isMac() && event.metaKey) || (!isMac() && event.ctrlKey)) {
        document
          .querySelector("[data-testid='timeline_send-message-button']")
          .click();
      }
    }
  });
  return node;
};

const createCustomEmojiNode = (iconParentNode, targetType, emoji, text) => {
  const image = htmlStringToNode(
    `<span style="font-size: 16px; align-self: center;">${emoji}</span>`
  );
  const node = iconParentNode.firstChild.cloneNode(true);
  const id = `__icon_${emoji}_${targetType}`;
  node.setAttribute("data-tooltip", textWithEllipsis(text));
  node.querySelector("button")?.setAttribute("id", id);
  node.querySelector("button")?.setAttribute("aria-label", emoji);
  node
    .querySelector("svg")
    ?.parentNode.replaceChild(image, node.querySelector("svg"));
  node.addEventListener("mousedown", (event) => {
    const startTag = text;
    const endTag = "";
    insertTag(startTag, endTag, targetType);
    if (targetType === TARGET_TYPE.chat) {
      if ((isMac() && event.metaKey) || (!isMac() && event.ctrlKey)) {
        document
          .querySelector("[data-testid='timeline_send-message-button']")
          .click();
      }
    }
  });
  return node;
};

const htmlStringToNode = (str) => {
  return document.createRange().createContextualFragment(str).firstChild;
};

const textSelected = (targetType) => {
  const textarea =
    targetType === TARGET_TYPE.chat
      ? document.querySelector("#_chatText")
      : document.querySelector("#_taskInputActive textarea");
  if (textarea) {
    const selectionStart = textarea.selectionStart;
    const selectionEnd = textarea.selectionEnd;
    return selectionStart !== selectionEnd;
  } else {
    return false;
  }
};

const insertTag = (startTag, endTag, targetType, cursorPos) => {
  const textarea =
    targetType === TARGET_TYPE.chat
      ? document.querySelector("#_chatText")
      : document.querySelector("#_taskInputActive textarea");
  if (textarea) {
    const selectionStart = textarea.selectionStart;
    const selectionEnd = textarea.selectionEnd;
    const before = textarea.value.substring(0, selectionStart);
    const selection = textarea.value.substring(selectionStart, selectionEnd);
    const after = textarea.value.substring(selectionEnd, textarea.value.length);
    const scrollTop = textarea.scrollTop;
    textarea.value = before + startTag + selection + endTag + after;
    textarea.dispatchEvent(
      new Event("input", {
        bubbles: true,
      })
    );
    setTimeout(() => {
      textarea.focus();
      textarea.scrollTop = scrollTop;
      if (selection.length > 0) {
        if (cursorPos > -1) {
          textarea.selectionStart = selectionStart + cursorPos;
          textarea.selectionEnd = selectionStart + cursorPos;
        } else {
          textarea.selectionStart =
            selectionEnd + startTag.length + endTag.length;
          textarea.selectionEnd =
            selectionEnd + startTag.length + endTag.length;
        }
      } else {
        textarea.selectionStart = selectionEnd + startTag.length;
        textarea.selectionEnd = selectionEnd + startTag.length;
      }
    }, 100);
  }
};

const findEmojiFromImage = (image) => {
  const re = new RegExp("(?<=/emo_).*(?=.gif$)");
  const res = re.exec(image.src);
  return res ? res[0] : null;
};

const countUpEmoji = (emoji) => {
  const counter = JSON.parse(localStorage.getItem("__emoji_counter") || "{}");
  counter[emoji] = counter[emoji] ? counter[emoji] + 1 : 1;
  localStorage.setItem("__emoji_counter", JSON.stringify(counter));
};

const sortedEmojis = () => {
  const counter = JSON.parse(localStorage.getItem("__emoji_counter") || "{}");
  return Object.keys(counter).sort((a, b) => counter[b] - counter[a]);
};

const isMac = () => {
  return navigator.userAgent.toLowerCase().includes("mac os");
};

const textWithEllipsis = (text) => {
  return text.length > 20 ? text.substring(0, 20) + "..." : text;
};

const decorateText = (text) => {
  return highlightTag(escapeHtml(text + "\n").replaceAll("\n", "<br>"));
};

const escapeHtml = (text) => {
  return text.replace(
    /[&'"<>]/g,
    (m) =>
      ({
        "&": "&amp;",
        "'": "&apos;",
        "`": "&#x60;",
        '"': "&quot;",
        "<": "&lt;",
        ">": "&gt;",
      }[m])
  );
};

const highlightTag = (text) => {
  return text
    .replace(
      /\[To:(\d+)\]/g,
      (m) => `<span style="color: mediumseagreen;">${m}</span>`
    )
    .replace(
      /\[\/?info\]/g,
      (m) => `<span style="color: mediumvioletred;">${m}</span>`
    )
    .replace(
      /\[\/?title\]/g,
      (m) => `<span style="color: mediumorchid;">${m}</span>`
    )
    .replace(
      /\[\/?code\]/g,
      (m) => `<span style="color: cornflowerblue;">${m}</span>`
    )
    .replace(/\[hr\]/g, (m) => `<span style="color: turquoise;">${m}</span>`)
    .replace(
      /\[\/?(Quote|引用|Trích dẫn)(.*?)\]/g,
      (m) => `<span style="color: mediumslateblue;">${m}</span>`
    )
    .replace(
      /\[\/?(Reply|返信|回覆|Trả lời)(.*?)\]/g,
      (m) => `<span style="color: mediumseagreen;">${m}</span>`
    )
    .replace(
      /\[\/?task(.*?)\]/g,
      (m) => `<span style="color: darkcyan;">${m}</span>`
    );
};
