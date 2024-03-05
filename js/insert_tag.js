let token;
let myid;
let language;
const init = () => {
  const getBy = (key) => {
    return Array.from(document.querySelectorAll("script"))
      .filter((x) => x.innerText !== undefined)
      .find((x) => x.innerText.includes(key))
      .innerText.split("\n")
      .find((x) => x.includes(key))
      .split("=")[1]
      .replaceAll("'", "")
      .replaceAll(";", "")
      .trim();
  };
  token = getBy("ACCESS_TOKEN");
  myid = getBy("MYID");
  language = getBy("LANGUAGE");
};

let accountMap = {};
let teamMap = {};
let roomMap = {};
const initAccountsAndTeams = async () => {
  return chrome.runtime
    .sendMessage({
      type: "accounts",
      host: location.host,
      myid: myid,
      token: token,
    })
    .then((res) => {
      const result = JSON.parse(res.result);
      accountMap = result.accounts;
      teamMap = result.teams;
      roomMap = result.rooms;
      console.log(roomMap);
    });
};

let roomId;
const resetRoomId = () => {
  roomId = location.hash ? location.hash.match(/(?<=!rid)(.*)/)[0] : "";
};

let teamMemberMap = {};
const resetTeamMembers = async () => {
  return chrome.runtime
    .sendMessage({
      type: "team_members",
      host: location.host,
      myid: myid,
      room_id: roomId,
      token: token,
    })
    .then((res) => {
      teamMemberMap = JSON.parse(res.result);
    });
};

window.addEventListener("load", () => {
  setTimeout(() => {
    init();
    initAccountsAndTeams().then(() => {
      resetRoomId();
      resetTeamMembers().then(() => {
        initChatSendArea();
        initTaskAddArea();
      });
    });
  }, 1000);
});

window.addEventListener("hashchange", () => {
  setTimeout(() => {
    resetRoomId();
    resetTeamMembers().then(() => {
      initChatSendArea();
      initTaskAddArea();
    });
  }, 100);
});

setTimeout(() => {
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
}, 1000);

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

let emojiCount = 5;
const customChatIcons = ["", "", "", "", "", "", "", "", "", ""];
const customChatMessages = ["", "", "", "", "", "", "", "", "", ""];
const customChatRoomIds = ["", "", "", "", "", "", "", "", "", ""];
const customTaskIcons = ["", "", "", "", "", "", "", "", "", ""];
const customTaskMessages = ["", "", "", "", "", "", "", "", "", ""];
const customTaskRoomIds = ["", "", "", "", "", "", "", "", "", ""];
const assignIcons = ["", "", "", "", "", "", "", "", "", ""];
const assignLabels = ["", "", "", "", "", "", "", "", "", ""];
const assignMembers = ["", "", "", "", "", "", "", "", "", ""];
const assignRoomIds = ["", "", "", "", "", "", "", "", "", ""];

chrome.storage.sync.get(
  {
    emoji_count: "5",
    chat_icons: ["", "", "", "", "", "", "", "", "", ""],
    chat_messages: ["", "", "", "", "", "", "", "", "", ""],
    chat_room_ids: ["", "", "", "", "", "", "", "", "", ""],
    task_icons: ["", "", "", "", "", "", "", "", "", ""],
    task_messages: ["", "", "", "", "", "", "", "", "", ""],
    task_room_ids: ["", "", "", "", "", "", "", "", "", ""],
    assign_icons: ["", "", "", "", "", "", "", "", "", ""],
    assign_labels: ["", "", "", "", "", "", "", "", "", ""],
    assign_members: ["", "", "", "", "", "", "", "", "", ""],
    assign_room_ids: ["", "", "", "", "", "", "", "", "", ""],
  },
  (items) => {
    emojiCount = items.emoji_count;
    for (i = 0; i < 10; i++) {
      customChatIcons[i] = items.chat_icons[i];
      customChatMessages[i] = items.chat_messages[i];
      customChatRoomIds[i] = items.chat_room_ids[i];
    }
    for (i = 0; i < 10; i++) {
      customTaskIcons[i] = items.task_icons[i];
      customTaskMessages[i] = items.task_messages[i];
      customTaskRoomIds[i] = items.task_room_ids[i];
    }
    for (i = 0; i < 10; i++) {
      assignIcons[i] = items.assign_icons[i];
      assignLabels[i] = items.assign_labels[i];
      assignMembers[i] = items.assign_members[i];
      assignRoomIds[i] = items.assign_room_ids[i];
    }
  }
);

const initChatArea = (iconParentNode, textarea, targetType, sendButton) => {
  if (iconParentNode) {
    if (
      iconParentNode.childNodes &&
      Array.from(iconParentNode.childNodes).every(
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
      const emojis = sortedEmojis().slice(0, emojiCount);
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
      customChatIcons.forEach((customIcon, index) => {
        const customMessage = customChatMessages[index];
        const customRoomIds = customChatRoomIds[index].split("\n");
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
    initAtMarkTo(textarea, targetType);
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
    textarea.style.overflowY = "auto";
    textarea.style.padding = "8px";
    initChatArea(iconParentNode, textarea, TARGET_TYPE.upload_chat, sendButton);
  }
};

const atMarkData = {
  processing: false,
  startPosition: 0,
  searchWord: "",
  selectionIndex: 0,
};

const initAtMarkTo = (textarea, targetType) => {
  const oldNode = document.getElementById("__at_mark_to");
  if (oldNode) {
    oldNode.parentNode.removeChild(oldNode);
    atMarkData.processing = false;
    atMarkData.startPosition = 0;
    atMarkData.searchWord = "";
    atMarkData.selectionIndex = 0;
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
    const liForClone = ulForClone.firstChild.nextSibling
      ? ulForClone.firstChild.nextSibling.cloneNode(true)
      : ulForClone.firstChild.cloneNode(true);
    roomMap[roomId].forEach((accountId) => {
      const li = liForClone.cloneNode(true);
      li.setAttribute("data-cwui-lt-value", `${accountId}`);
      li.firstChild.setAttribute("data-aid", `${accountId}`);
      li.firstChild.setAttribute(
        "src",
        `https://appdata.chatwork.com/avatar/${accountMap[accountId].av}`
      );
      const suffix = language === "ja" ? "さん" : "";
      li.lastChild.textContent = `${accountMap[accountId].name}${suffix}`;
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

    const getTargetRect = (textarea) => {
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
      const atMarkSpan = dummy.querySelector("#__at_mark_span");
      const rect = atMarkSpan.getBoundingClientRect();
      textarea.parentNode.removeChild(dummy);
      return rect;
    };

    const openAtMarkToDialog = (textarea) => {
      atMarkData.processing = true;
      atMarkData.startPosition = textarea.selectionStart;
      atMarkData.searchWord = "";
      atMarkData.selectionIndex = 0;
      const targetRect = getTargetRect(textarea);
      node.style.position = "absolute";
      node.style.top = targetRect.top - 180 + "px";
      node.style.left = targetRect.left - 20 + "px";
      node.style.display = "block";
      node.style.opacity = 1;
      ul.scrollTop = 0;
    };

    const closeAtMarkToDialog = (textarea) => {
      atMarkData.processing = false;
      atMarkData.startPosition = 0;
      atMarkData.searchWord = "";
      atMarkData.selectionIndex = 0;
      node.style.display = "none";
      textarea.dispatchEvent(
        new Event("input", {
          bubbles: true,
        })
      );
    };

    const insertTo = (to, textarea) => {
      if (to) {
        const before = textarea.value.substring(
          0,
          atMarkData.startPosition - 1
        );
        const after = textarea.value.substring(
          atMarkData.startPosition + atMarkData.searchWord.length
        );
        textarea.value = `${before}${to}${after}`;
        textarea.focus();
        textarea.selectionStart = (before + to).length;
        textarea.selectionEnd = (before + to).length;
        closeAtMarkToDialog(textarea);
      }
    };

    ul.addEventListener("click", (event) => {
      event.stopPropagation();
      const to = findToForAtMark(event.target);
      insertTo(to, textarea);
    });

    textarea.addEventListener("click", () => {
      if (atMarkData.processing) {
        closeAtMarkToDialog(textarea);
      }
    });

    const atMarkToAvailable = (event) => {
      if (event.data !== "@") return false;
      if (atMarkData.processing) return false;
      const cursorPos = event.target.selectionStart;
      if (cursorPos === 1) return true;
      const previousWord = event.target.value.substring(
        cursorPos - 2,
        cursorPos - 1
      );
      if ([" ", "\n"].includes(previousWord)) return true;
      return false;
    };

    const filterAtMarkTo = (searchWord) => {
      ul.childNodes.forEach((node) => {
        const s = searchWord.toLowerCase();
        const dispName = node.querySelector("p")?.textContent.toLowerCase();
        const aid = node.querySelector("img")?.getAttribute("data-aid");
        const isTeam = !!node.querySelector("svg")?.getAttribute("data-aid");
        const name =
          aid && accountMap[aid]
            ? (accountMap[aid]["name"] ?? "").toLowerCase()
            : "";
        const nm =
          aid && accountMap[aid]
            ? (accountMap[aid]["nm"] ?? "").toLowerCase()
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
            nm.includes(s) ||
            dp.includes(s) ||
            cwid.includes(s)
          ) {
            node.style.display = "flex";
          } else {
            node.style.display = "none";
          }
        }
      });
      atMarkData.selectionIndex = 0;
      ul.scrollTop = 0;
      highlightSelection();
    };

    const getSelectedNode = () => {
      return Array.from(ul.childNodes).find(
        (node) =>
          node.style.display === "flex" &&
          node.style.backgroundColor !== "transparent"
      );
    };

    const highlightSelection = () => {
      let currentIndex = 0;
      ul.childNodes.forEach((node) => {
        if (node.style.display === "flex") {
          if (atMarkData.selectionIndex === currentIndex) {
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

    const selectAbove = () => {
      if (atMarkData.selectionIndex > 0) {
        atMarkData.selectionIndex = atMarkData.selectionIndex - 1;
        ul.scrollBy({
          top: -34,
          left: 0,
          behavior: "smooth",
        });
        highlightSelection();
      }
    };

    const selectBelow = () => {
      let counter = 0;
      ul.childNodes.forEach((node) => {
        if (node.style.display === "flex") {
          counter++;
        }
      });
      if (atMarkData.selectionIndex < counter - 1) {
        atMarkData.selectionIndex = atMarkData.selectionIndex + 1;
        ul.scrollBy({
          top: 34,
          left: 0,
          behavior: "smooth",
        });
        highlightSelection();
      }
    };

    textarea.addEventListener("input", (event) => {
      if (atMarkToAvailable(event)) {
        openAtMarkToDialog(textarea);
        filterAtMarkTo(atMarkData.searchWord);
      } else if (atMarkData.processing) {
        if (atMarkData.startPosition - 1 === textarea.selectionStart) {
          closeAtMarkToDialog(textarea);
        } else {
          atMarkData.searchWord = textarea.value.substring(
            atMarkData.startPosition,
            textarea.selectionStart
          );
          filterAtMarkTo(atMarkData.searchWord);
        }
      }
    });

    textarea.addEventListener("keydown", (event) => {
      if (atMarkData.processing) {
        if (event.keyCode === 13) {
          event.preventDefault();
          const to = findToForAtMark(getSelectedNode());
          insertTo(to, textarea);
        } else if (event.key === "Escape") {
          event.preventDefault();
          closeAtMarkToDialog(textarea);
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
  }
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
    customTaskIcons.forEach((customIcon, index) => {
      const customMessage = customTaskMessages[index];
      const customRoomIds = customTaskRoomIds[index].split("\n");
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
  assignLabels.forEach((label, index) => {
    const icon = assignIcons[index];
    const members = assignMembers[index]
      .split("\n")
      .filter((x) => roomMap[roomId].includes(x))
      .map((x) => Number(x));
    const roomIds = assignRoomIds[index].split("\n");
    if (
      members.length > 0 &&
      (assignRoomIds[index] === "" || roomIds.includes(roomId))
    ) {
      iconsNode.firstChild.appendChild(
        createAssignIconNode(
          index,
          iconParentNode,
          textarea,
          label,
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
    textarea.style.overflowY = "auto";
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
  if (textarea.parentNode.firstChild.id !== `__wrap_area_${targetType}`) {
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
  } else {
    wrapArea = textarea.parentNode.firstChild;
  }
  textarea.parentNode.style.position = "relative";
  textarea.parentNode.insertBefore(wrapArea, textarea);
  textarea.style.color = "transparent";
  textarea.style.backgroundColor = "transparent";
  textarea.style.caretColor = window.getComputedStyle(wrapArea).color;
  textarea.style.position = "relative";
  textarea.style.zIndex = 1;
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

const createAssignIconNode = (
  index,
  iconParentNode,
  textarea,
  label,
  icon,
  members
) => {
  const iconNode = htmlStringToNode(
    icon.length > 0
      ? `<span style="align-self: center">${icon}</span>`
      : `<span style="font-size: 22px; align-self: center; margin-left: -3px">${DEFAULT_ICONS[index]}</span>`
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
          token: token,
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

const htmlStringToNode = (str) => {
  return document.createRange().createContextualFragment(str).firstChild;
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
      `<span id="__at_mark_span" style="color: royalblue;">@${escapeHtml(
        atMarkData.searchWord
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

const findToForAtMark = (node) => {
  if (node) {
    if (node.nodeName === "LI") {
      return findToForAtMarkFromLi(node);
    } else {
      return findToForAtMarkFromLi(node.closest("li"));
    }
  } else {
    return null;
  }
};

const findToForAtMarkFromLi = (node) => {
  if (node.querySelector(".toSelectorTooltip__toAllIconContainer")) {
    return "[toall]";
  }
  const aid = node.firstChild?.getAttribute("data-aid");
  if (!aid) {
    return null;
  }
  if (aid.startsWith("team_")) {
    const teamId = aid.slice(5);
    const teamName = teamMap[teamId]?.name ?? "";
    let to = `To: ${teamName}\n`;
    const suffix = language === "ja" ? "さん" : "";
    const members = teamMemberMap[teamId] ?? [];
    members.forEach((member) => {
      const name = accountMap[member.aid]?.nm ?? "";
      to = to + `[To:${member.aid}]${name}${suffix}\n`;
    });
    return to;
  } else {
    const name = node.lastChild?.textContent ?? "";
    return `[To:${aid}]${name}\n`;
  }
};

const isDark = () => {
  return document.querySelector("body").classList.contains("dark");
};
