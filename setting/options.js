document.querySelectorAll(".tab").forEach((node) => {
  node.addEventListener("click", (event) => {
    const previousTab = document.querySelector(".active");
    previousTab.classList.remove("active");
    event.target.classList.add("active");
    const tabs = Array.from(document.querySelector(".tab-area").children);
    const contents = Array.from(
      document.querySelector(".content-area").children
    );
    let index = -1;
    for (let i = 0; i < tabs.length; i++) {
      if (tabs[i] === event.target) {
        index = i;
        break;
      }
    }
    for (let i = 0; i < contents.length; i++) {
      if (i === index) {
        contents[i].classList.add("show");
      } else {
        contents[i].classList.remove("show");
      }
    }
    if (index === 5) {
      document.getElementById("save").style.display = "none";
      document.getElementById("import").style.display = "block";
    } else {
      document.getElementById("save").style.display = "block";
      document.getElementById("import").style.display = "none";
    }
  });
});

const createArray = (size, value = "") => {
  const array = new Array(size);
  array.fill(value);
  return array;
};

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
const restoreOptions = () => {
  chrome.storage.sync.get(
    {
      version: 1,
    },
    (items) => {
      if (Number(items.version ?? "1") > 1) {
        chrome.storage.sync.get(
          {
            version: 2,
            custom_messages: createArray(20, {
              label: "",
              message: "",
            }),
            custom_chat_messages: createArray(20, {
              message: "",
              icon: "",
              room_ids: "",
            }),
            custom_task_messages: createArray(20, {
              message: "",
              icon: "",
              room_ids: "",
            }),
            assign_task_members: createArray(20, {
              account_ids: "",
              label: "",
              icon: "",
              room_ids: "",
            }),
            emoji_max_count: 5,
          },
          (items) => {
            for (i = 0; i < 20; i++) {
              document.getElementById(`custom_label_${i + 1}`).value =
                items.custom_messages[i].label ?? "";
              document.getElementById(`custom_message_${i + 1}`).value =
                items.custom_messages[i].message ?? "";
            }
            for (i = 0; i < 20; i++) {
              document.getElementById(`chat_message_${i + 1}`).value =
                items.custom_chat_messages[i].message ?? "";
              document.getElementById(`chat_icon_${i + 1}`).value =
                items.custom_chat_messages[i].icon ?? "";
              document.getElementById(`chat_room_id_${i + 1}`).value =
                items.custom_chat_messages[i].room_ids ?? "";
            }
            for (i = 0; i < 20; i++) {
              document.getElementById(`task_message_${i + 1}`).value =
                items.custom_task_messages[i].message ?? "";
              document.getElementById(`task_icon_${i + 1}`).value =
                items.custom_task_messages[i].icon ?? "";
              document.getElementById(`task_room_id_${i + 1}`).value =
                items.custom_task_messages[i].room_ids ?? "";
            }
            for (i = 0; i < 20; i++) {
              document.getElementById(`assign_member_${i + 1}`).value =
                items.assign_task_members[i].account_ids ?? "";
              document.getElementById(`assign_label_${i + 1}`).value =
                items.assign_task_members[i].label ?? "";
              document.getElementById(`assign_icon_${i + 1}`).value =
                items.assign_task_members[i].icon ?? "";
              document.getElementById(`assign_room_id_${i + 1}`).value =
                items.assign_task_members[i].room_ids ?? "";
            }
            document.getElementById("emoji_count").value =
              items.emoji_max_count;
            document.getElementById("json").value = JSON.stringify(
              items,
              null,
              4
            );
          }
        );
      } else {
        chrome.storage.sync.get(
          {
            version: 1,
            emoji_count: "5",
            chat_icons: createArray(20),
            chat_messages: createArray(20),
            chat_room_ids: createArray(20),
            task_icons: createArray(20),
            task_messages: createArray(20),
            task_room_ids: createArray(20),
            assign_icons: createArray(20),
            assign_labels: createArray(20),
            assign_members: createArray(20),
            assign_room_ids: createArray(20),
            custom_labels: createArray(20),
            custom_messages: createArray(20),
          },
          (items) => {
            document.getElementById("emoji_count").value = items.emoji_count;
            for (i = 0; i < 20; i++) {
              document.getElementById(`chat_icon_${i + 1}`).value =
                items.chat_icons[i] ?? "";
              document.getElementById(`chat_message_${i + 1}`).value =
                items.chat_messages[i] ?? "";
              document.getElementById(`chat_room_id_${i + 1}`).value =
                items.chat_room_ids[i] ?? "";
            }
            for (i = 0; i < 20; i++) {
              document.getElementById(`task_icon_${i + 1}`).value =
                items.task_icons[i] ?? "";
              document.getElementById(`task_message_${i + 1}`).value =
                items.task_messages[i] ?? "";
              document.getElementById(`task_room_id_${i + 1}`).value =
                items.task_room_ids[i] ?? "";
            }
            for (i = 0; i < 20; i++) {
              document.getElementById(`assign_icon_${i + 1}`).value =
                items.assign_icons[i] ?? "";
              document.getElementById(`assign_label_${i + 1}`).value =
                items.assign_labels[i] ?? "";
              document.getElementById(`assign_member_${i + 1}`).value =
                items.assign_members[i] ?? "";
              document.getElementById(`assign_room_id_${i + 1}`).value =
                items.assign_room_ids[i] ?? "";
            }
            for (i = 0; i < 20; i++) {
              document.getElementById(`custom_label_${i + 1}`).value =
                items.custom_labels[i] ?? "";
              document.getElementById(`custom_message_${i + 1}`).value =
                items.custom_messages[i] ?? "";
            }
            document.getElementById("json").value = JSON.stringify(
              items,
              null,
              4
            );
          }
        );
      }
    }
  );
};

// Saves options to chrome.storage
const saveOptions = () => {
  const custom_labels = createArray(20);
  const custom_messages = createArray(20);
  for (i = 0; i < 20; i++) {
    custom_labels[i] = document.getElementById(`custom_label_${i + 1}`)
      ? document.getElementById(`custom_label_${i + 1}`).value
      : "";
    custom_messages[i] = document.getElementById(`custom_message_${i + 1}`)
      ? document.getElementById(`custom_message_${i + 1}`).value
      : "";
  }
  const chat_icons = createArray(20);
  const chat_messages = createArray(20);
  const chat_room_ids = createArray(20);
  for (i = 0; i < 20; i++) {
    chat_icons[i] = document.getElementById(`chat_icon_${i + 1}`)
      ? document.getElementById(`chat_icon_${i + 1}`).value
      : "";
    chat_messages[i] = document.getElementById(`chat_message_${i + 1}`)
      ? document.getElementById(`chat_message_${i + 1}`).value
      : "";
    chat_room_ids[i] = document.getElementById(`chat_room_id_${i + 1}`)
      ? document.getElementById(`chat_room_id_${i + 1}`).value
      : "";
  }
  const task_icons = createArray(20);
  const task_messages = createArray(20);
  const task_room_ids = createArray(20);
  for (i = 0; i < 20; i++) {
    task_icons[i] = document.getElementById(`task_icon_${i + 1}`)
      ? document.getElementById(`task_icon_${i + 1}`).value
      : "";
    task_messages[i] = document.getElementById(`task_message_${i + 1}`)
      ? document.getElementById(`task_message_${i + 1}`).value
      : "";
    task_room_ids[i] = document.getElementById(`task_room_id_${i + 1}`)
      ? document.getElementById(`task_room_id_${i + 1}`).value
      : "";
  }
  const assign_icons = createArray(20);
  const assign_labels = createArray(20);
  const assign_members = createArray(20);
  const assign_room_ids = createArray(20);
  for (i = 0; i < 20; i++) {
    assign_icons[i] = document.getElementById(`assign_icon_${i + 1}`)
      ? document.getElementById(`assign_icon_${i + 1}`).value
      : "";
    assign_labels[i] = document.getElementById(`assign_label_${i + 1}`)
      ? document.getElementById(`assign_label_${i + 1}`).value
      : "";
    assign_members[i] = document.getElementById(`assign_member_${i + 1}`)
      ? document.getElementById(`assign_member_${i + 1}`).value
      : "";
    assign_room_ids[i] = document.getElementById(`assign_room_id_${i + 1}`)
      ? document.getElementById(`assign_room_id_${i + 1}`).value
      : "";
  }
  const emoji_count = document.getElementById("emoji_count").value;

  const customMessages = createArray(20, {
    label: "",
    message: "",
  });
  const customChatMessages = createArray(20, {
    message: "",
    icon: "",
    room_ids: "",
  });
  const customTaskMessages = createArray(20, {
    message: "",
    icon: "",
    room_ids: "",
  });
  const assignTaskMembers = createArray(20, {
    account_ids: "",
    label: "",
    icon: "",
    room_ids: "",
  });
  let emojiMaxCount = 5;
  for (i = 0; i < 20; i++) {
    customMessages[i] = {
      label: custom_labels[i],
      message: custom_messages[i],
    };
    customChatMessages[i] = {
      message: chat_messages[i],
      icon: chat_icons[i],
      room_ids: chat_room_ids[i],
    };
    customTaskMessages[i] = {
      message: task_messages[i],
      icon: task_icons[i],
      room_ids: task_room_ids[i],
    };
    assignTaskMembers[i] = {
      account_ids: assign_members[i],
      label: assign_labels[i],
      icon: assign_icons[i],
      room_ids: assign_room_ids[i],
    };
  }
  emojiMaxCount = emoji_count;
  chrome.storage.sync.clear();
  chrome.storage.sync.set(
    {
      version: 2,
      custom_messages: customMessages,
      custom_chat_messages: customChatMessages,
      custom_task_messages: customTaskMessages,
      assign_task_members: assignTaskMembers,
      emoji_max_count: emojiMaxCount,
    },
    () => {
      // Update status to let user know options were saved.
      const status = document.getElementById("status");
      status.textContent = "Saved successfully.";
      setTimeout(() => {
        status.textContent = "";
        restoreOptions();
      }, 750);
    }
  );
};

// Import options to chrome.storage
const importOptions = () => {
  const json = document.getElementById("json").value;
  const items = JSON.parse(json);
  chrome.storage.sync.clear();
  chrome.storage.sync.set(items, () => {
    // Update status to let user know options were saved.
    const status = document.getElementById("status");
    status.textContent = "Imported successfully.";
    setTimeout(() => {
      status.textContent = "";
      restoreOptions();
    }, 750);
  });
};

document.addEventListener("DOMContentLoaded", restoreOptions);
document.getElementById("save").addEventListener("click", saveOptions);
document.getElementById("import").addEventListener("click", importOptions);
