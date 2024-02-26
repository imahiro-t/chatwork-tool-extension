// Saves options to chrome.storage
const saveOptions = () => {
  const emoji_count = document.getElementById("emoji_count").value;
  const chat_icons = ["", "", "", "", "", "", "", "", "", ""];
  const chat_messages = ["", "", "", "", "", "", "", "", "", ""];
  const chat_room_ids = ["", "", "", "", "", "", "", "", "", ""];
  for (i = 0; i < 10; i++) {
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
  const task_icons = ["", "", "", "", "", "", "", "", "", ""];
  const task_messages = ["", "", "", "", "", "", "", "", "", ""];
  const task_room_ids = ["", "", "", "", "", "", "", "", "", ""];
  for (i = 0; i < 10; i++) {
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

  chrome.storage.sync.clear();
  chrome.storage.sync.set(
    {
      emoji_count: emoji_count,
      chat_icons: chat_icons,
      chat_messages: chat_messages,
      chat_room_ids: chat_room_ids,
      task_icons: task_icons,
      task_messages: task_messages,
      task_room_ids: task_room_ids,
    },
    () => {
      // Update status to let user know options were saved.
      const status = document.getElementById("status");
      status.textContent = "Options saved.";
      setTimeout(() => {
        status.textContent = "";
      }, 750);
    }
  );
};

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
const restoreOptions = () => {
  chrome.storage.sync.get(
    {
      emoji_count: "5",
      chat_icons: ["", "", "", "", "", "", "", "", "", ""],
      chat_messages: ["", "", "", "", "", "", "", "", "", ""],
      chat_room_ids: ["", "", "", "", "", "", "", "", "", ""],
      task_icons: ["", "", "", "", "", "", "", "", "", ""],
      task_messages: ["", "", "", "", "", "", "", "", "", ""],
      task_room_ids: ["", "", "", "", "", "", "", "", "", ""],
      // TODO: remove next version
      // ---------- from ----------
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
      // ---------- to ----------
    },
    (items) => {
      document.getElementById("emoji_count").value = items.emoji_count;
      for (i = 0; i < 10; i++) {
        document.getElementById(`chat_icon_${i + 1}`).value =
          items.chat_icons[i];
        document.getElementById(`chat_message_${i + 1}`).value =
          items.chat_messages[i];
        document.getElementById(`chat_room_id_${i + 1}`).value =
          items.chat_room_ids[i];
      }
      for (i = 0; i < 10; i++) {
        document.getElementById(`task_icon_${i + 1}`).value =
          items.task_icons[i];
        document.getElementById(`task_message_${i + 1}`).value =
          items.task_messages[i];
        document.getElementById(`task_room_id_${i + 1}`).value =
          items.task_room_ids[i];
      }
      // TODO: remove next version
      // ---------- from ----------
      if (items.icon_1.length > 0) {
        document.getElementById("chat_icon_1").value = items.icon_1;
        document.getElementById("chat_message_1").value = items.text_1;
        document.getElementById("chat_icon_2").value = items.icon_2;
        document.getElementById("chat_message_2").value = items.text_2;
        document.getElementById("chat_icon_3").value = items.icon_3;
        document.getElementById("chat_message_3").value = items.text_3;
        document.getElementById("chat_icon_4").value = items.icon_4;
        document.getElementById("chat_message_4").value = items.text_4;
        document.getElementById("chat_icon_5").value = items.icon_5;
        document.getElementById("chat_message_5").value = items.text_5;
      }
      if (items.task_icon_1.length > 0) {
        document.getElementById("task_icon_1").value = items.task_icon_1;
        document.getElementById("task_message_1").value = items.task_text_1;
        document.getElementById("task_icon_2").value = items.task_icon_2;
        document.getElementById("task_message_2").value = items.task_text_2;
        document.getElementById("task_icon_3").value = items.task_icon_3;
        document.getElementById("task_message_3").value = items.task_text_3;
      }
      // ---------- to ----------
    }
  );
};

document.addEventListener("DOMContentLoaded", restoreOptions);
document.getElementById("save").addEventListener("click", saveOptions);
