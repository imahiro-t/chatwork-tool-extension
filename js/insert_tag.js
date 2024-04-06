let accessToken;
let myid;
let language;
let theme;
let accountMap = {};
let teamMap = {};
let roomMap = {};
let teamMemberMap = {};
window.addEventListener("message", (event) => {
  if (event.data.action === "synced") {
    accessToken = event.data.access_token;
    myid = event.data.myid;
    language = event.data.language;
    theme = event.data.theme;
    accountMap = JSON.parse(event.data.accounts);
    teamMap = JSON.parse(event.data.teams);
    roomMap = JSON.parse(event.data.rooms);
    teamMemberMap = JSON.parse(event.data.team_members);
    initObserver();
    initListener();
    initChatSendArea();
    initTaskAddArea();
  }
});

let roomId;
const resetRoomId = () => {
  roomId = location.hash ? location.hash.match(/(?<=!rid)(.*)/)[0] : "";
};

window.addEventListener("load", () => {
  setTimeout(() => {
    resetRoomId();
    window.postMessage({
      action: "sync",
      room_id: roomId,
    });
  }, 1000);
});

window.addEventListener("hashchange", () => {
  setTimeout(() => {
    resetRoomId();
    window.postMessage({
      action: "sync",
      room_id: roomId,
    });
  }, 100);
});

const TARGET_TYPE = Object.freeze({
  chat: "chat",
  upload_chat: "upload_chat",
  task_add: "task_add",
  task_edit: "task_edit",
});

const EMOJI = Object.freeze({
  sad: ":(",
  more_smile: ":D",
  lucky: "8-)",
  surprise: ":o",
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
  smile: ":)",
  wink: ";)",
});

const ESCAPE_EMOJIS = Object.freeze([
  {
    emoji: "(^^;)",
    escape_word: "(wry_smile)",
  },
  {
    emoji: "]:)",
    escape_word: "(grin)",
  },
]);

const DEFAULT_ICONS = Object.freeze({
  0: `1️⃣`,
  1: `2️⃣`,
  2: `3️⃣`,
  3: `4️⃣`,
  4: `5️⃣`,
  5: `6️⃣`,
  6: `7️⃣`,
  7: `8️⃣`,
  8: `9️⃣`,
  9: `🔟`,
});

const initObserver = () => {
  const taskObserver = new MutationObserver((mutationRecords) => {
    if (
      mutationRecords.some((mutationRecord) => {
        return Array.from(mutationRecord.addedNodes).some((addedNode) => {
          return addedNode.id === "_taskInputActive";
        });
      })
    ) {
      initTaskAddArea();
    }
  });
  taskObserver.observe(document.querySelector("#_roomTask")?.firstChild, {
    childList: true,
  });
  const dialogObserver = new MutationObserver((mutationRecords) => {
    if (
      mutationRecords.some((mutationRecord) => {
        return Array.from(mutationRecord.addedNodes).some((addedNode) => {
          return addedNode.querySelector("#_fileUploadMessage");
        });
      })
    ) {
      initUploadChatArea();
    } else if (
      mutationRecords.some((mutationRecord) => {
        return Array.from(mutationRecord.addedNodes).some((addedNode) => {
          return (
            addedNode.querySelector("textarea") &&
            [
              "タスクの編集",
              "Edit Task",
              "編輯工作",
              "Chỉnh sửa công việc",
            ].includes(addedNode.querySelector("h1")?.textContent)
          );
        });
      })
    ) {
      initTaskEditArea();
    }
  });
  dialogObserver.observe(document.querySelector("#RootModalsEntryPoint"), {
    childList: true,
  });
  const emojiListObserver = new MutationObserver((mutationRecords) => {
    if (
      mutationRecords.some((mutationRecord) => {
        return Array.from(mutationRecord.addedNodes).some((addedNode) => {
          return addedNode.querySelector("#emojiList");
        });
      })
    ) {
      document
        .querySelector("#emojiList")
        ?.addEventListener("click", (event) => {
          if (event.target.nodeName === "LI") {
            const emoji = findEmojiFromImage(
              event.target.firstChild.firstChild
            );
            if (emoji) {
              countUpEmoji(emoji);
            }
          } else if (event.target.nodeName === "BUTTON") {
            const emoji = findEmojiFromImage(event.target.firstChild);
            if (emoji) {
              countUpEmoji(emoji);
            }
          } else if (event.target.nodeName === "IMG") {
            const emoji = findEmojiFromImage(event.target);
            if (emoji) {
              countUpEmoji(emoji);
            }
          }
          const textarea = document.querySelector("#_fileUploadMessage");
          if (textarea) {
            setTimeout(() => {
              textarea.dispatchEvent(
                new Event("input", {
                  bubbles: true,
                })
              );
            }, 100);
          }
        });
    }
  });
  emojiListObserver.observe(document.querySelector("#_wrapper"), {
    childList: true,
  });
};

const initListener = () => {
  document
    .querySelector("#_emoticonGallery")
    ?.addEventListener("click", (event) => {
      if (event.target.nodeName === "LI") {
        const emoji = findEmojiFromImage(event.target.firstChild);
        if (emoji) {
          countUpEmoji(emoji);
        }
      } else if (event.target.nodeName === "IMG") {
        const emoji = findEmojiFromImage(event.target);
        if (emoji) {
          countUpEmoji(emoji);
        }
      }
    });
};

const initChatArea = (iconParentNode, textarea, targetType, sendButton) => {
  if (iconParentNode) {
    if (
      iconParentNode.children &&
      Array.from(iconParentNode.children).every(
        (node) =>
          node.querySelector("button")?.id !== `__tag_info_${targetType}`
      )
    ) {
      iconParentNode.appendChild(
        createInfoNode(iconParentNode, textarea, targetType)
      );
      iconParentNode.appendChild(
        createInfoWithTitleNode(iconParentNode, textarea, targetType)
      );
      iconParentNode.appendChild(
        createCodeNode(iconParentNode, textarea, targetType)
      );
      iconParentNode.appendChild(
        createHrNode(iconParentNode, textarea, targetType)
      );
      const emojis = sortedEmojis().slice(0, emojiMaxCount);
      emojis.forEach((emoji) => {
        iconParentNode.appendChild(
          createEmojiNode(
            iconParentNode,
            textarea,
            targetType,
            emoji,
            sendButton
          )
        );
      });
      customChatMessages.forEach((customChatMessage, index) => {
        const customMessage = customChatMessage.message;
        const customRoomIds = (customChatMessage.room_ids ?? "").split("\n");
        const customIcon = customChatMessage.icon;
        if (
          customMessage &&
          (customRoomIds[0] === "" || customRoomIds.includes(roomId))
        ) {
          iconParentNode.appendChild(
            createCustomEmojiNode(
              index,
              iconParentNode,
              textarea,
              targetType,
              customIcon,
              customMessage,
              sendButton
            )
          );
        }
      });
    }
    if (sendButton) {
      const observer = new MutationObserver((mutationRecords) => {
        for (const mutationRecord of mutationRecords) {
          if (
            mutationRecord.type === "attributes" &&
            mutationRecord.attributeName === "disabled" &&
            mutationRecord.target.disabled
          ) {
            textarea.dispatchEvent(
              new Event("input", {
                bubbles: true,
              })
            );
          }
        }
      });
      observer.observe(sendButton, {
        attributes: true,
      });
    }
    initAtMarkDialog(textarea, targetType);
    initHatDialog(textarea, targetType);
    wrapTextarea(textarea, targetType);
  }
};

const initChatSendArea = () => {
  const iconParentNode = document
    .querySelector("#_chatSendArea")
    ?.querySelector("._showDescription")?.parentNode;
  if (iconParentNode) {
    const textarea = document.querySelector("#_chatText");
    const sendButton = document
      .querySelector("#_chatText")
      ?.parentNode?.parentNode?.previousSibling?.lastChild?.querySelector(
        "button"
      );
    initChatArea(iconParentNode, textarea, TARGET_TYPE.chat, sendButton);
  }
};

const initUploadChatArea = () => {
  const iconParentNode = document.querySelector("#_fileUploadMessage")
    ?.parentNode?.previousSibling;
  if (iconParentNode) {
    const textarea = document.querySelector("#_fileUploadMessage");
    const sendButton = document
      .querySelector("#_fileUploadMessage")
      ?.parentNode?.parentNode?.parentNode?.parentNode?.lastChild?.querySelector(
        "button"
      );
    textarea.style.height = "104px";
    textarea.style.padding = "8px";
    initChatArea(iconParentNode, textarea, TARGET_TYPE.upload_chat, sendButton);
  }
};

const initKeyboardDialog = (
  node,
  textarea,
  targetType,
  targetData,
  key,
  filterBySearchWord,
  findDataFor
) => {
  const getTargetRect = (textarea, targetType) => {
    const dummy = document.createElement("pre");
    dummy.setAttribute("role", "textbox");
    dummy.setAttribute("contenteditable", "true");
    dummy.setAttribute("aria-multiline", "true");
    dummy.setAttribute("aria-labelledby", "txtboxMultilineLabel");
    dummy.setAttribute("aria-readonly", "true");
    dummy.setAttribute("class", textarea.getAttribute("class"));
    dummy.setAttribute("style", textarea.getAttribute("style"));
    dummy.style.position = "absolute";
    textarea.parentNode.insertBefore(dummy, textarea);
    dummy.innerHTML = decorateText(textarea.value, targetType);
    const span = dummy.querySelector("#__keyboard_dialog_span");
    const rect = span.getBoundingClientRect();
    textarea.parentNode.removeChild(dummy);
    return rect;
  };

  const highlightSelection = (node, targetData) => {
    let currentIndex = 0;
    Array.from(node.firstChild.children).forEach((node) => {
      if (node.style.display === "flex") {
        if (targetData.selectionIndex === currentIndex) {
          if (isDark()) {
            node.style.backgroundColor = "rgba(41, 75, 114, 0.5)";
          } else {
            node.style.backgroundColor = "rgba(204, 223, 245, 0.5)";
          }
        } else {
          node.style.backgroundColor = "transparent";
        }
        currentIndex++;
      }
    });
  };

  const openSelectorDialog = (node, textarea, targetType, targetData) => {
    targetData.processing = true;
    targetData.startPosition = textarea.selectionStart;
    targetData.searchWord = "";
    targetData.selectionIndex = 0;
    const targetRect = getTargetRect(textarea, targetType);
    node.style.position = "absolute";
    node.style.top = targetRect.top - 180 + "px";
    node.style.left = targetRect.left - 20 + "px";
    node.style.display = "block";
    node.style.opacity = 1;
    node.firstChild.scrollTop = 0;
  };

  const closeSelectorDialog = (node, textarea, targetData) => {
    targetData.processing = false;
    targetData.startPosition = 0;
    targetData.searchWord = "";
    targetData.selectionIndex = 0;
    node.style.display = "none";
    textarea.dispatchEvent(
      new Event("input", {
        bubbles: true,
      })
    );
  };

  const insertData = (data, node, textarea, targetData) => {
    if (data) {
      const before = textarea.value.substring(0, targetData.startPosition - 1);
      const after = textarea.value.substring(
        targetData.startPosition + targetData.searchWord.length
      );
      textarea.value = `${before}${data}${after}`;
      textarea.focus();
      textarea.selectionStart = (before + data).length;
      textarea.selectionEnd = (before + data).length;
      closeSelectorDialog(node, textarea, targetData);
    }
  };

  node.firstChild.addEventListener("click", (event) => {
    event.stopPropagation();
    const data = findDataFor(event.target);
    insertData(data, node, textarea, targetData);
  });

  textarea.addEventListener("click", () => {
    if (targetData.processing) {
      closeSelectorDialog(node, textarea, targetData);
    }
  });

  const available = (event) => {
    if (atMarkData.processing || hatData.processing) return false;
    if (event.data !== key) return false;
    const cursorPos = event.target.selectionStart;
    if (cursorPos === 1) return true;
    const previousWord = event.target.value.substring(
      cursorPos - 2,
      cursorPos - 1
    );
    if ([" ", "\n"].includes(previousWord)) return true;
    return false;
  };

  const getSelectedNode = () => {
    return Array.from(node.firstChild.children).find(
      (node) =>
        node.style.display === "flex" &&
        node.style.backgroundColor !== "transparent"
    );
  };

  const selectAbove = () => {
    if (targetData.selectionIndex > 0) {
      targetData.selectionIndex = targetData.selectionIndex - 1;
      node.firstChild.scrollBy({
        top: -34,
        left: 0,
        behavior: "smooth",
      });
      highlightSelection(node, targetData);
    }
  };

  const selectBelow = () => {
    let counter = 0;
    Array.from(node.firstChild.children).forEach((node) => {
      if (node.style.display === "flex") {
        counter++;
      }
    });
    if (targetData.selectionIndex < counter - 1) {
      targetData.selectionIndex = targetData.selectionIndex + 1;
      node.firstChild.scrollBy({
        top: 34,
        left: 0,
        behavior: "smooth",
      });
      highlightSelection(node, targetData);
    }
  };

  textarea.addEventListener("input", (event) => {
    if (available(event)) {
      openSelectorDialog(node, textarea, targetType, targetData);
      filterBySearchWord(targetData.searchWord, highlightSelection);
    } else if (targetData.processing) {
      if (targetData.startPosition - 1 === textarea.selectionStart) {
        closeSelectorDialog(node, textarea, targetData);
      } else {
        targetData.searchWord = textarea.value.substring(
          targetData.startPosition,
          textarea.selectionStart
        );
        filterBySearchWord(targetData.searchWord, highlightSelection);
      }
    }
  });

  textarea.addEventListener("keydown", (event) => {
    if (targetData.processing) {
      if (event.keyCode === 13) {
        event.preventDefault();
        const data = findDataFor(getSelectedNode());
        insertData(data, node, textarea, targetData);
      } else if (event.key === "Escape") {
        event.preventDefault();
        closeSelectorDialog(node, textarea, targetData);
        setTimeout(() => {
          textarea.focus();
        }, 100);
      } else if (event.key === "ArrowDown") {
        event.preventDefault();
        selectBelow();
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        selectAbove();
      } else if (event.key === "End") {
        event.preventDefault();
      } else if (event.key === "Home") {
        event.preventDefault();
      } else if (event.key === "PageDown") {
        event.preventDefault();
      } else if (event.key === "PageUp") {
        event.preventDefault();
      }
    }
  });
};

const atMarkData = {
  processing: false,
  startPosition: 0,
  searchWord: "",
  selectionIndex: 0,
};

const initAtMarkDialog = (textarea, targetType) => {
  const targetData = atMarkData;
  const oldNode = document.getElementById("__at_mark_to");
  if (oldNode) {
    oldNode.parentNode.removeChild(oldNode);
    targetData.processing = false;
    targetData.startPosition = 0;
    targetData.searchWord = "";
    targetData.selectionIndex = 0;
  }
  const to = document.querySelector("#_to");
  const toList = document.querySelector("#_toList");
  if (to && toList) {
    const node = toList.cloneNode(false);
    node.setAttribute("id", `__at_mark_to`);
    toList.style.visibility = "collapse";
    to.click();
    const ulForClone = toList.querySelector("ul");
    const ul = ulForClone.cloneNode(false);
    node.appendChild(ul);
    const firstLi = ulForClone.firstChild.cloneNode(true);
    let liForClone;
    if (firstLi.querySelector(".toSelectorTooltip__toAllIcon")) {
      ul.appendChild(firstLi);
      liForClone = ulForClone.firstChild.nextSibling.cloneNode(true);
    } else {
      liForClone = firstLi;
    }
    roomMap[roomId].forEach((accountId) => {
      const li = liForClone.cloneNode(true);
      li.setAttribute("data-cwui-lt-value", `${accountId}`);
      li.firstChild.setAttribute("data-aid", `${accountId}`);
      li.firstChild.setAttribute(
        "src",
        `https://appdata.chatwork.com${accountMap[accountId].av}`
      );
      const suffix = language === "ja" ? "さん" : "";
      const name =
        accountMap[accountId].nickname ??
        `${accountMap[accountId].name}${suffix}`;
      li.lastChild.textContent = name;
      ul.appendChild(li);
    });
    toList.parentNode.appendChild(node);
    toList.style.display = "none";
    toList.style.visibility = "visible";

    const svgForClone = htmlStringToNode(
      `<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24">
      <path d="M40-160v-112q0-34 17.5-62.5T104-378q62-31 126-46.5T360-440q66 0 130 15.5T616-378q29 15 46.5 43.5T680-272v112H40Zm720 0v-120q0-44-24.5-84.5T666-434q51 6 96 20.5t84 35.5q36 20 55 44.5t19 53.5v120H760ZM360-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47Zm400-160q0 66-47 113t-113 47q-11 0-28-2.5t-28-5.5q27-32 41.5-71t14.5-81q0-42-14.5-81T544-792q14-5 28-6.5t28-1.5q66 0 113 47t47 113ZM120-240h480v-32q0-11-5.5-20T580-306q-54-27-109-40.5T360-360q-56 0-111 13.5T140-306q-9 5-14.5 14t-5.5 20v32Zm240-320q33 0 56.5-23.5T440-640q0-33-23.5-56.5T360-720q-33 0-56.5 23.5T280-640q0 33 23.5 56.5T360-560Zm0 320Zm0-400Z"/>
      </svg>`
    );
    svgForClone.setAttribute(
      "class",
      ul.querySelector("img").getAttribute("class")
    );
    const teamIds = Object.keys(teamMemberMap);
    teamIds.forEach((teamId) => {
      const li = liForClone.cloneNode(true);
      const svg = svgForClone.cloneNode(true);
      svg.setAttribute("data-aid", `team_${teamId}`);
      li.removeChild(li.querySelector("img"));
      li.insertBefore(svg, li.firstChild);
      li.lastChild.textContent = teamMap[teamId].name;
      ul.appendChild(li);
    });

    const filterBySearchWord = (searchWord, highlightSelection) => {
      Array.from(ul.children).forEach((node) => {
        const s = searchWord.toLowerCase();
        const dispName = node.querySelector("p")?.textContent.toLowerCase();
        const aid = node.querySelector("img")?.getAttribute("data-aid");
        const isTeam = !!node.querySelector("svg")?.getAttribute("data-aid");
        const name =
          aid && accountMap[aid]
            ? (accountMap[aid]["name"] ?? "").toLowerCase()
            : "";
        const nickname =
          aid && accountMap[aid]
            ? (accountMap[aid]["nickname"] ?? "").toLowerCase()
            : "";
        const dp =
          aid && accountMap[aid]
            ? (accountMap[aid]["dp"] ?? "").toLowerCase()
            : "";
        const cwid =
          aid && accountMap[aid]
            ? (accountMap[aid]["cwid"] ?? "").toLowerCase()
            : "";
        if (isTeam) {
          if (s === "" || dispName.includes(s) || "team".includes(s)) {
            node.style.display = "flex";
          } else {
            node.style.display = "none";
          }
        } else {
          if (
            s === "" ||
            dispName.includes(s) ||
            name.includes(s) ||
            nickname.includes(s) ||
            dp.includes(s) ||
            cwid.includes(s)
          ) {
            node.style.display = "flex";
          } else {
            node.style.display = "none";
          }
        }
      });
      targetData.selectionIndex = 0;
      ul.scrollTop = 0;
      highlightSelection(node, targetData);
    };

    initKeyboardDialog(
      node,
      textarea,
      targetType,
      targetData,
      "@",
      filterBySearchWord,
      findDataForAtMark
    );
  }
};

const hatData = {
  processing: false,
  startPosition: 0,
  searchWord: "",
  selectionIndex: 0,
};

const initHatDialog = (textarea, targetType) => {
  if (
    customMessages.every((customMessage) => customMessage.label.length === 0)
  ) {
    return;
  }
  const targetData = hatData;
  const oldNode = document.getElementById(`__custom_message_${targetType}`);
  if (oldNode) {
    oldNode.parentNode.removeChild(oldNode);
    targetData.processing = false;
    targetData.startPosition = 0;
    targetData.searchWord = "";
    targetData.selectionIndex = 0;
  }

  const node = htmlStringToNode(
    `<div id="__custom_message_${targetType}" class="toSelectorTooltip tooltip tooltip--white" role="tooltip"></div>`
  );
  const ul = htmlStringToNode(
    `<ul class="_cwLTList tooltipList" role="list" style="max-height: 160px; height: 160px;"></ul>`
  );
  const liForClone = htmlStringToNode(
    `<li role="listitem" class="tooltipList__item"><p style="text-wrap: nowrap;"></p></li>`
  );
  node.appendChild(ul);
  document.querySelector("#root").appendChild(node);

  customMessages.forEach((customMessage, index) => {
    if (customMessage.label.length > 0) {
      const li = liForClone.cloneNode(true);
      li.setAttribute("data-index", `${index}`);
      li.firstChild.textContent = `${customMessage.label}`;
      ul.appendChild(li);
    }
  });

  const filterBySearchWord = (searchWord, highlightSelection) => {
    Array.from(ul.children).forEach((node) => {
      const s = searchWord.toLowerCase();
      const index = node.getAttribute("data-index");
      const label = customMessages[index].label.toLowerCase();
      const message = customMessages[index].message.toLowerCase();
      if (s === "" || label.includes(s) || message.includes(s)) {
        node.style.display = "flex";
      } else {
        node.style.display = "none";
      }
    });
    targetData.selectionIndex = 0;
    ul.scrollTop = 0;
    highlightSelection(node, targetData);
  };

  initKeyboardDialog(
    node,
    textarea,
    targetType,
    targetData,
    "^",
    filterBySearchWord,
    findDataForHat
  );
};

const initTaskArea = (iconParentNode, taskParentNode, textarea, targetType) => {
  if (iconParentNode && taskParentNode) {
    if (taskParentNode.firstChild.id === `__task_icon_node_${targetType}`) {
      taskParentNode.removeChild(taskParentNode.firstChild);
    }
    const iconsNode = iconParentNode.parentNode?.cloneNode(false);
    iconsNode.setAttribute("id", `__task_icon_node_${targetType}`);
    iconsNode.setAttribute("style", "margin-top: -8px; padding: 0px 0px 4px");
    const ul = iconParentNode.cloneNode(false);
    iconsNode.appendChild(ul);
    iconsNode.firstChild.appendChild(
      createInfoNode(iconParentNode, textarea, targetType)
    );
    iconsNode.firstChild.appendChild(
      createInfoWithTitleNode(iconParentNode, textarea, targetType)
    );
    iconsNode.firstChild.appendChild(
      createCodeNode(iconParentNode, textarea, targetType)
    );
    iconsNode.firstChild.appendChild(
      createHrNode(iconParentNode, textarea, targetType)
    );
    iconsNode.firstChild.appendChild(
      createEmojiNode(iconParentNode, textarea, targetType, "please")
    );
    iconsNode.firstChild.appendChild(
      createEmojiNode(iconParentNode, textarea, targetType, "bow")
    );
    customTaskMessages.forEach((customTaskMessage, index) => {
      const customMessage = customTaskMessage.message;
      const customRoomIds = (customTaskMessage.room_ids ?? "").split("\n");
      const customIcon = customTaskMessage.icon;
      if (
        customMessage &&
        (customRoomIds[0] === "" || customRoomIds.includes(roomId))
      ) {
        iconsNode.firstChild.appendChild(
          createCustomEmojiNode(
            index,
            iconParentNode,
            textarea,
            targetType,
            customIcon,
            customMessage
          )
        );
      }
    });
    taskParentNode.firstChild.before(iconsNode);
    initHatDialog(textarea, targetType);
    wrapTextarea(textarea, targetType);
  }
};

const initTaskAssignArea = (iconParentNode, textarea) => {
  if (textarea.parentNode.lastChild.id === `__task_assign_node`) {
    textarea.parentNode.removeChild(textarea.parentNode.lastChild);
  }
  const iconsNode = iconParentNode.parentNode?.cloneNode(false);
  iconsNode.setAttribute("id", `__task_assign_node`);
  iconsNode.setAttribute("style", "margin-top: -8px; padding: 0px 0px 4px");
  const ul = iconParentNode.cloneNode(false);
  iconsNode.appendChild(ul);
  assignTaskMembers.forEach((assignTaskMember, index) => {
    const icon = assignTaskMember.icon;
    const members = (assignTaskMember.account_ids ?? "")
      .split("\n")
      .filter((x) => roomMap[roomId].includes(Number(x)))
      .map((x) => Number(x));
    const roomIds = (assignTaskMember.room_ids ?? "").split("\n");
    if (
      members.length > 0 &&
      (assignTaskMember.room_ids === "" || roomIds.includes(roomId))
    ) {
      iconsNode.firstChild.appendChild(
        createAssignIconNode(
          index,
          iconParentNode,
          textarea,
          assignTaskMember.label,
          icon,
          members
        )
      );
    }
  });
  textarea.parentNode.appendChild(iconsNode);
  const assignTargetNode =
    textarea.nextSibling?.firstChild?.firstChild?.lastChild;
  if (assignTargetNode) {
    const showAssignIconNode = (show) => {
      iconsNode.style.display = show ? "block" : "none";
    };
    const observer = new MutationObserver((mutationRecords) => {
      showAssignIconNode(
        mutationRecords.some(
          (mutationRecord) => mutationRecord.target.textContent === "選択"
        )
      );
    });
    observer.observe(assignTargetNode, {
      childList: true,
      subtree: true,
    });
    showAssignIconNode(assignTargetNode.textContent === "選択");
  }
};

const initTaskAddArea = () => {
  const iconParentNode = document
    .querySelector("#_chatSendArea")
    ?.querySelector("._showDescription")?.parentNode;
  const taskParentNode = document.querySelector("#_taskInputActive");
  if (iconParentNode && taskParentNode) {
    const textarea = taskParentNode.querySelector("textarea");
    textarea.style.height = "120px";
    initTaskArea(
      iconParentNode,
      taskParentNode,
      textarea,
      TARGET_TYPE.task_add
    );
    if (language === "ja") {
      initTaskAssignArea(iconParentNode, textarea);
    }
  }
};

const initTaskEditArea = () => {
  const iconParentNode = document
    .querySelector("#_chatSendArea")
    ?.querySelector("._showDescription")?.parentNode;
  const taskParentNode = document
    .querySelector("#RootModalsEntryPoint")
    ?.querySelector("textarea")?.parentNode;
  if (iconParentNode && taskParentNode) {
    const textarea = taskParentNode.querySelector("textarea");
    textarea.style.width = "648px";
    textarea.style.height = "206px";
    initTaskArea(
      iconParentNode,
      taskParentNode,
      textarea,
      TARGET_TYPE.task_edit
    );
  }
};

const wrapTextarea = (textarea, targetType) => {
  let wrapArea;
  if (textarea.previousSibling?.id === `__wrap_area_${targetType}`) {
    wrapArea = textarea.previousSibling;
  } else {
    wrapArea = document.createElement("pre");
    wrapArea.setAttribute("id", `__wrap_area_${targetType}`);
    wrapArea.setAttribute("role", "textbox");
    wrapArea.setAttribute("contenteditable", "true");
    wrapArea.setAttribute("aria-multiline", "true");
    wrapArea.setAttribute("aria-labelledby", "txtboxMultilineLabel");
    wrapArea.setAttribute("aria-readonly", "true");
    wrapArea.setAttribute("class", textarea.getAttribute("class"));
    wrapArea.setAttribute("style", textarea.getAttribute("style"));
    wrapArea.style.position = "absolute";
    wrapArea.style.overflowY = "auto";
  }
  textarea.parentNode.style.position = "relative";
  textarea.parentNode.insertBefore(wrapArea, textarea);
  textarea.style.color = "transparent";
  textarea.style.backgroundColor = "transparent";
  textarea.style.caretColor = window.getComputedStyle(wrapArea).color;
  textarea.style.position = "relative";
  textarea.style.zIndex = 1;
  textarea.style.overflowY = "auto";
  const observer = new MutationObserver(() => {
    wrapArea.innerHTML = decorateText(textarea.value, targetType);
    wrapArea.style.height = textarea.style.height;
    wrapArea.scrollTop = textarea.scrollTop;
  });
  observer.observe(textarea, {
    childList: true,
    attributes: true,
  });
  textarea.addEventListener("input", () => {
    wrapArea.innerHTML = decorateText(textarea.value, targetType);
    wrapArea.style.height = textarea.style.height;
    wrapArea.scrollTop = textarea.scrollTop;
  });
  textarea.addEventListener("scroll", () => {
    wrapArea.scrollTop = textarea.scrollTop;
  });
  wrapArea.innerHTML = decorateText(textarea.value, targetType);
};

const createInfoNode = (iconParentNode, textarea, targetType) => {
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
    insertTag(startTag, endTag, textarea);
  });
  return node;
};

const createInfoWithTitleNode = (iconParentNode, textarea, targetType) => {
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
    if (textSelected(textarea)) {
      const startTag = "[info][title][/title]";
      const endTag = "[/info]\n";
      insertTag(startTag, endTag, textarea, 13);
    } else {
      const startTag = "[info][title]";
      const endTag = "[/title][/info]\n";
      insertTag(startTag, endTag, textarea);
    }
  });
  return node;
};

const createCodeNode = (iconParentNode, textarea, targetType) => {
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
    insertTag(startTag, endTag, textarea);
  });
  return node;
};

const createHrNode = (iconParentNode, textarea, targetType) => {
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
    insertTag(startTag, endTag, textarea);
  });
  return node;
};

const createEmojiNode = (
  iconParentNode,
  textarea,
  targetType,
  emoji,
  sendButton
) => {
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
    insertTag(startTag, endTag, textarea);
    if (sendButton) {
      countUpEmoji(emoji);
      if ((isMac() && event.metaKey) || (!isMac() && event.ctrlKey)) {
        sendButton.click();
      }
    }
  });
  return node;
};

const createCustomEmojiNode = (
  index,
  iconParentNode,
  textarea,
  targetType,
  emoji,
  text,
  sendButton
) => {
  const iconNode = htmlStringToNode(
    emoji.length > 0
      ? `<span style="font-size: 16px; align-self: center;">${emoji}</span>`
      : `<span style="font-size: 16px; align-self: center;">${DEFAULT_ICONS[index]}</span>`
  );
  const node = iconParentNode.firstChild.cloneNode(true);
  node.setAttribute("data-tooltip", textWithEllipsis(text));
  node
    .querySelector("button")
    ?.setAttribute("id", `__icon_${index}_${targetType}`);
  node.querySelector("button")?.setAttribute("aria-label", text);
  node
    .querySelector("svg")
    ?.parentNode.replaceChild(iconNode, node.querySelector("svg"));
  node.addEventListener("mousedown", (event) => {
    const startTag = text;
    const endTag = "";
    insertTag(startTag, endTag, textarea);
    if (sendButton) {
      if ((isMac() && event.metaKey) || (!isMac() && event.ctrlKey)) {
        sendButton.click();
      }
    }
  });
  return node;
};

const getTaskLimit = (text) => {
  if (text.includes("設定")) {
    return null;
  }
  const result = text
    .replace("時間指定なし", "00:00")
    .match(/^(\d+)月(\d+)日(\d+):(\d+)$/);
  const year = new Date().getFullYear();
  const month = ("0" + result[1]).slice(-2);
  const day = ("0" + result[2]).slice(-2);
  const hour = result[3];
  const minute = result[4];
  const date = new Date(
    `${year}-${month}-${day}T${hour}:${minute}:00.000+09:00`
  );
  if (date.getTime() + 60 * 60 * 24 * 7 > new Date().getTime()) {
    return date.getTime() / 1000;
  } else {
    return (
      new Date(
        `${year}-${month}-${day}T${hour}:${minute}:00.000+09:00`
      ).getTime() / 1000
    );
  }
};

const getLimitType = (text) => {
  if (text.includes("設定")) {
    return "none";
  } else if (text.includes("時間指定なし")) {
    return "date";
  } else {
    return "time";
  }
};

const createDefaultAssignIcon = (members) => {
  if (members.length === 1) {
    return `<img src="https://appdata.chatwork.com${
      accountMap[members[0]].av
    }" style="border-radius: 50%; width: 24px; height: 24px; margin-left: -4px;">`;
  } else {
    return `<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" style="margin-top: 4px; margin-left: -4px;">
  <path d="M40-160v-112q0-34 17.5-62.5T104-378q62-31 126-46.5T360-440q66 0 130 15.5T616-378q29 15 46.5 43.5T680-272v112H40Zm720 0v-120q0-44-24.5-84.5T666-434q51 6 96 20.5t84 35.5q36 20 55 44.5t19 53.5v120H760ZM360-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47Zm400-160q0 66-47 113t-113 47q-11 0-28-2.5t-28-5.5q27-32 41.5-71t14.5-81q0-42-14.5-81T544-792q14-5 28-6.5t28-1.5q66 0 113 47t47 113ZM120-240h480v-32q0-11-5.5-20T580-306q-54-27-109-40.5T360-360q-56 0-111 13.5T140-306q-9 5-14.5 14t-5.5 20v32Zm240-320q33 0 56.5-23.5T440-640q0-33-23.5-56.5T360-720q-33 0-56.5 23.5T280-640q0 33 23.5 56.5T360-560Zm0 320Zm0-400Z"/>
  </svg>`;
  }
};

const createAssignIconNode = (
  index,
  iconParentNode,
  textarea,
  label,
  icon,
  members
) => {
  const iconNode = htmlStringToNode(
    `<span style="align-self: center">${
      icon.length > 0 ? icon : createDefaultAssignIcon(members)
    }</span>`
  );
  const node = iconParentNode.firstChild.cloneNode(true);
  node.setAttribute("data-tooltip", textWithEllipsis(label));
  node.querySelector("button")?.setAttribute("id", `__icon_assign_${index}`);
  node.querySelector("button")?.setAttribute("aria-label", label);
  node
    .querySelector("svg")
    ?.parentNode.replaceChild(iconNode, node.querySelector("svg"));

  node.addEventListener("mousedown", () => {
    const task = textarea.value;
    if (task.length > 0) {
      const limitText =
        textarea.nextSibling.lastChild.lastChild.lastChild.textContent;
      const assign = members;
      const limit_type = getLimitType(limitText);
      const task_limit = getTaskLimit(limitText);
      chrome.runtime
        .sendMessage({
          type: "add_task",
          host: location.host,
          myid: myid,
          room_id: roomId,
          task: task,
          assign: assign,
          limit_type: limit_type,
          task_limit: task_limit,
          token: accessToken,
        })
        .then(() => {
          textarea.nextSibling.nextSibling.firstChild
            .querySelector("button")
            ?.click();
        });
    }
  });
  return node;
};

const textSelected = (textarea) => {
  if (textarea) {
    const selectionStart = textarea.selectionStart;
    const selectionEnd = textarea.selectionEnd;
    return selectionStart !== selectionEnd;
  } else {
    return false;
  }
};

const insertTag = (startTag, endTag, textarea, cursorPos) => {
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

const decorateText = (text, targetType) => {
  let transformedText = text;
  if (
    (targetType === TARGET_TYPE.chat ||
      targetType === TARGET_TYPE.upload_chat) &&
    atMarkData.processing
  ) {
    const before = text.substring(0, atMarkData.startPosition - 1);
    const target = text.substring(
      atMarkData.startPosition - 1,
      atMarkData.startPosition + atMarkData.searchWord.length
    );
    const after = text.substring(
      atMarkData.startPosition + atMarkData.searchWord.length
    );
    transformedText = `${before}<<<${target}>>>${after}`;
  } else if (hatData.processing) {
    const before = text.substring(0, hatData.startPosition - 1);
    const target = text.substring(
      hatData.startPosition - 1,
      hatData.startPosition + hatData.searchWord.length
    );
    const after = text.substring(
      hatData.startPosition + hatData.searchWord.length
    );
    transformedText = `${before}<<<${target}>>>${after}`;
  }
  transformedText = ESCAPE_EMOJIS.reduce(
    (acc, value) => acc.replaceAll(value.emoji, `<-<${value.escape_word}>->`),
    transformedText
  );
  transformedText = Object.values(EMOJI).reduce(
    (acc, m) => acc.replaceAll(m, `<-<${m}>->`),
    transformedText
  );
  return highlightTag(
    escapeHtml(transformedText + "\n").replaceAll("\n", "<br>"),
    targetType
  );
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

const highlightTag = (text, targetType) => {
  let transformedText = text;
  if (
    (targetType === TARGET_TYPE.chat ||
      targetType === TARGET_TYPE.upload_chat) &&
    atMarkData.processing
  ) {
    const atMarkTo = escapeHtml(`<<<@${atMarkData.searchWord}>>>`);
    transformedText = text.replace(
      atMarkTo,
      `<span id="__keyboard_dialog_span" style="color: mediumseagreen;">@${escapeHtml(
        atMarkData.searchWord
      )}</span>`
    );
  } else if (hatData.processing) {
    const hat = escapeHtml(`<<<^${hatData.searchWord}>>>`);
    transformedText = text.replace(
      hat,
      `<span id="__keyboard_dialog_span" style="color: royalblue;">^${escapeHtml(
        hatData.searchWord
      )}</span>`
    );
  }
  transformedText = ESCAPE_EMOJIS.reduce(
    (acc, value) =>
      acc.replaceAll(
        escapeHtml(`<-<${value.escape_word}>->`),
        `<span style="color: tomato;">${escapeHtml(value.emoji)}</span>`
      ),
    transformedText
  );
  transformedText = Object.values(EMOJI).reduce(
    (acc, m) =>
      acc.replaceAll(
        escapeHtml(`<-<${m}>->`),
        `<span style="color: tomato;">${escapeHtml(m)}</span>`
      ),
    transformedText
  );

  return transformedText
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
      /\[\/?(Quote|引用|Trích dẫn|qt|qtmeta)(.*?)\]/g,
      (m) => `<span style="color: mediumslateblue;">${m}</span>`
    )
    .replace(
      /\[\/?(preview|download|picon|piconname)(.*?)\]/g,
      (m) => `<span style="color: darkcyan;">${m}</span>`
    )
    .replace(
      /\[\/?(Reply|返信|回覆|Trả lời|rp)(.*?)\]/g,
      (m) => `<span style="color: mediumseagreen;">${m}</span>`
    )
    .replace(
      /\[\/?(task|dtext)(.*?)\]/g,
      (m) => `<span style="color: darkcyan;">${m}</span>`
    );
};

const findDataForAtMark = (node) => {
  if (node) {
    if (node.nodeName === "LI") {
      return findDataForAtMarkFromLi(node);
    } else {
      return findDataForAtMarkFromLi(node.closest("li"));
    }
  } else {
    return null;
  }
};

const findDataForAtMarkFromLi = (node) => {
  if (node.querySelector(".toSelectorTooltip__toAllIconContainer")) {
    return "[toall]";
  }
  const aid = node.firstChild?.getAttribute("data-aid");
  if (!aid) {
    return null;
  }
  const suffix = language === "ja" ? "さん" : "";
  if (aid.startsWith("team_")) {
    const teamId = aid.slice(5);
    const teamName = teamMap[teamId]?.name ?? "";
    let to = `To: ${teamName}\n`;
    const aids = teamMemberMap[teamId] ?? [];
    aids.forEach((aid) => {
      if (accountMap[aid]) {
        const name =
          accountMap[aid].nickname ?? `${accountMap[aid].name}${suffix}`;
        to = to + `[To:${aid}]${name}\n`;
      }
    });
    return to;
  } else {
    const name = accountMap[aid].nickname ?? `${accountMap[aid].name}${suffix}`;
    return `[To:${aid}]${name}\n`;
  }
};

const findDataForHat = (node) => {
  if (node) {
    if (node.nodeName === "LI") {
      return findDataForHatFromLi(node);
    } else {
      return findDataForHatFromLi(node.closest("li"));
    }
  } else {
    return null;
  }
};

const findDataForHatFromLi = (node) => {
  const index = node.getAttribute("data-index");
  const message = customMessages[index].message;
  return message;
};

const isDark = () => {
  return theme === "dark";
};
