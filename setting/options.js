// Saves options to chrome.storage
const saveOptions = () => {
  const emoji_count = document.getElementById("emoji_count").value;
  const icon_1 = document.getElementById("icon_1").value;
  const text_1 = document.getElementById("text_1").value;
  const icon_2 = document.getElementById("icon_2").value;
  const text_2 = document.getElementById("text_2").value;
  const icon_3 = document.getElementById("icon_3").value;
  const text_3 = document.getElementById("text_3").value;
  const icon_4 = document.getElementById("icon_4").value;
  const text_4 = document.getElementById("text_4").value;
  const icon_5 = document.getElementById("icon_5").value;
  const text_5 = document.getElementById("text_5").value;

  chrome.storage.sync.set(
    {
      emoji_count: emoji_count,
      icon_1: icon_1,
      text_1: text_1,
      icon_2: icon_2,
      text_2: text_2,
      icon_3: icon_3,
      text_3: text_3,
      icon_4: icon_4,
      text_4: text_4,
      icon_5: icon_5,
      text_5: text_5,
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
    },
    (items) => {
      document.getElementById("emoji_count").value = items.emoji_count;
      document.getElementById("icon_1").value = items.icon_1;
      document.getElementById("text_1").value = items.text_1;
      document.getElementById("icon_2").value = items.icon_2;
      document.getElementById("text_2").value = items.text_2;
      document.getElementById("icon_3").value = items.icon_3;
      document.getElementById("text_3").value = items.text_3;
      document.getElementById("icon_4").value = items.icon_4;
      document.getElementById("text_4").value = items.text_4;
      document.getElementById("icon_5").value = items.icon_5;
      document.getElementById("text_5").value = items.text_5;
    }
  );
};

document.addEventListener("DOMContentLoaded", restoreOptions);
document.getElementById("save").addEventListener("click", saveOptions);
