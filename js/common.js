const createArray = (size, value = "") => {
  const array = new Array(size);
  array.fill(value);
  return array;
};

const htmlStringToNode = (str) => {
  return document.createRange().createContextualFragment(str).firstChild;
};

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

chrome.storage.sync.get(
  {
    version: 1,
  },
  (items) => {
    if (Number(items.version ?? "1") > 1) {
      chrome.storage.sync.get(
        {
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
            customMessages[i] = items.custom_messages[i];
            customChatMessages[i] = items.custom_chat_messages[i];
            customTaskMessages[i] = items.custom_task_messages[i];
            assignTaskMembers[i] = items.assign_task_members[i];
          }
          emojiMaxCount = items.emoji_max_count;
        }
      );
    } else {
      chrome.storage.sync.get(
        {
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
          emojiMaxCount = items.emoji_count;
          for (i = 0; i < 20; i++) {
            customMessages[i] = {
              label: items.custom_labels[i] ?? "",
              message: items.custom_messages[i] ?? "",
            };
            customChatMessages[i] = {
              message: items.chat_messages[i] ?? "",
              icon: items.chat_icons[i] ?? "",
              room_ids: items.chat_room_ids[i] ?? "",
            };
            customTaskMessages[i] = {
              message: items.task_messages[i] ?? "",
              icon: items.task_icons[i] ?? "",
              room_ids: items.task_room_ids[i] ?? "",
            };
            assignTaskMembers[i] = {
              account_ids: items.assign_members[i] ?? "",
              label: items.assign_labels[i] ?? "",
              icon: items.assign_icons[i] ?? "",
              room_ids: items.assign_room_ids[i] ?? "",
            };
          }
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
            () => {}
          );
        }
      );
    }
  }
);
