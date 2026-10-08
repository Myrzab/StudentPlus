/* ==================================================
   STUDENT+ AI FRONTEND
   ================================================== */

const API_URL = "http://localhost:3000";


// ==================================================
// DOM
// ==================================================

const mainNav = document.getElementById("mainNav");
const menuToggle = document.getElementById("menuToggle");

const aiSidebar = document.getElementById("aiSidebar");
const sidebarOverlay = document.getElementById("sidebarOverlay");
const sidebarOpenBtn = document.getElementById("sidebarOpenBtn");

const newChatBtn = document.getElementById("newChatBtn");

const chatList = document.getElementById("chatList");
const chatCount = document.getElementById("chatCount");
const emptyChats = document.getElementById("emptyChats");
const chatSearch = document.getElementById("chatSearch");

const currentChatTitle =
  document.getElementById("currentChatTitle");

const messagesContainer =
  document.getElementById("messagesContainer");

const messages =
  document.getElementById("messages");

const welcomeScreen =
  document.getElementById("welcomeScreen");

const typingIndicator =
  document.getElementById("typingIndicator");

const chatForm =
  document.getElementById("chatForm");

const messageInput =
  document.getElementById("messageInput");

const sendBtn =
  document.getElementById("sendBtn");

const clearChatBtn =
  document.getElementById("clearChatBtn");

const attachBtn =
  document.getElementById("attachBtn");

const imageInput =
  document.getElementById("imageInput");

const attachmentPreview =
  document.getElementById("attachmentPreview");

const previewImage =
  document.getElementById("previewImage");

const removeImageBtn =
  document.getElementById("removeImageBtn");


// ==================================================
// STATE
// ==================================================

let chats = [];

let currentChatId = null;

let selectedImage = null;

let isSending = false;


// ==================================================
// MOBILE HEADER
// ==================================================

if (menuToggle) {

  menuToggle.addEventListener("click", () => {

    mainNav.classList.toggle("open");

  });

}


document.addEventListener("click", (event) => {

  if (!mainNav || !menuToggle) return;

  if (
    mainNav.classList.contains("open") &&
    !mainNav.contains(event.target) &&
    !menuToggle.contains(event.target)
  ) {

    mainNav.classList.remove("open");

  }

});


// ==================================================
// SIDEBAR MOBILE
// ==================================================

function openSidebar() {

  aiSidebar.classList.add("open");

  sidebarOverlay.classList.add("open");

}


function closeSidebar() {

  aiSidebar.classList.remove("open");

  sidebarOverlay.classList.remove("open");

}


if (sidebarOpenBtn) {

  sidebarOpenBtn.addEventListener(
    "click",
    openSidebar
  );

}


if (sidebarOverlay) {

  sidebarOverlay.addEventListener(
    "click",
    closeSidebar
  );

}


// ==================================================
// INIT
// ==================================================

document.addEventListener(
  "DOMContentLoaded",
  async () => {

    setupSuggestionButtons();

    setupTextarea();

    setupImageUpload();

    await loadChats();

  }
);


// ==================================================
// LOAD CHATS
// ==================================================

async function loadChats() {

  try {

    const response =
      await fetch(`${API_URL}/api/chats`);

    if (!response.ok) {

      throw new Error(
        "Чаттарды жүктеу мүмкін болмады."
      );

    }

    chats = await response.json();

    renderChatList();

    if (chats.length > 0) {

      await openChat(chats[0].id);

    } else {

      showWelcome();

    }

  } catch (error) {

    console.error(error);

    showError(
      "Чаттарды жүктеу мүмкін болмады. Backend сервері жұмыс істеп тұрғанын тексер."
    );

  }

}


// ==================================================
// RENDER CHAT LIST
// ==================================================

function renderChatList(searchText = "") {

  chatList.innerHTML = "";

  const query =
    searchText.trim().toLowerCase();

  const filteredChats =
    chats.filter((chat) => {

      if (!query) return true;

      return chat.title
        .toLowerCase()
        .includes(query);

    });

  chatCount.textContent = chats.length;

  if (filteredChats.length === 0) {

    emptyChats.classList.remove("hidden");

  } else {

    emptyChats.classList.add("hidden");

  }


  filteredChats.forEach((chat) => {

    const item =
      document.createElement("div");

    item.className = "chat-item";

    if (chat.id === currentChatId) {

      item.classList.add("active");

    }


    const icon =
      document.createElement("div");

    icon.className =
      "chat-item-icon";

    icon.textContent = "💬";


    const content =
      document.createElement("div");

    content.className =
      "chat-item-content";


    const title =
      document.createElement("span");

    title.className =
      "chat-item-title";

    title.textContent =
      chat.title || "Жаңа чат";


    const date =
      document.createElement("span");

    date.className =
      "chat-item-date";

    date.textContent =
      formatDate(chat.updatedAt);


    content.appendChild(title);

    content.appendChild(date);


    const deleteBtn =
      document.createElement("button");

    deleteBtn.className =
      "chat-delete";

    deleteBtn.type = "button";

    deleteBtn.title =
      "Чатты өшіру";

    deleteBtn.textContent =
      "×";


    deleteBtn.addEventListener(
      "click",
      async (event) => {

        event.stopPropagation();

        await deleteChat(chat.id);

      }
    );


    item.appendChild(icon);

    item.appendChild(content);

    item.appendChild(deleteBtn);


    item.addEventListener(
      "click",
      () => openChat(chat.id)
    );


    chatList.appendChild(item);

  });

}


// ==================================================
// OPEN CHAT
// ==================================================

async function openChat(chatId) {

  try {

    const response =
      await fetch(
        `${API_URL}/api/chats/${chatId}`
      );

    if (!response.ok) {

      throw new Error(
        "Чатты ашу мүмкін болмады."
      );

    }

    const chat =
      await response.json();

    currentChatId =
      chat.id;

    currentChatTitle.textContent =
      chat.title || "Student+ AI";

    renderMessages(
      chat.messages || []
    );

    renderChatList(
      chatSearch.value
    );

    closeSidebar();

  } catch (error) {

    console.error(error);

    showError(
      "Чатты ашу кезінде қате болды."
    );

  }

}


// ==================================================
// CREATE NEW CHAT
// ==================================================

newChatBtn.addEventListener(
  "click",
  async () => {

    try {

      const response =
        await fetch(
          `${API_URL}/api/chats`,
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json"
            }
          }
        );

      if (!response.ok) {

        throw new Error(
          "Жаңа чат жасау мүмкін болмады."
        );

      }

      const newChat =
        await response.json();

      chats.unshift({
        id: newChat.id,
        title: newChat.title,
        createdAt: newChat.createdAt,
        updatedAt: newChat.updatedAt,
        messageCount: 0
      });

      currentChatId =
        newChat.id;

      currentChatTitle.textContent =
        "Жаңа чат";

      renderMessages([]);

      renderChatList();

      messageInput.focus();

      closeSidebar();

    } catch (error) {

      console.error(error);

      showError(
        "Жаңа чат жасау мүмкін болмады."
      );

    }

  }
);


// ==================================================
// DELETE CHAT
// ==================================================

async function deleteChat(chatId) {

  const chat =
    chats.find(
      (item) => item.id === chatId
    );

  const title =
    chat?.title || "осы чат";

  const confirmed =
    confirm(
      `"${title}" чатын өшіруге сенімдісіз бе?`
    );

  if (!confirmed) return;


  try {

    const response =
      await fetch(
        `${API_URL}/api/chats/${chatId}`,
        {
          method: "DELETE"
        }
      );

    if (!response.ok) {

      throw new Error(
        "Чатты өшіру мүмкін болмады."
      );

    }

    chats =
      chats.filter(
        (item) =>
          item.id !== chatId
      );


    if (currentChatId === chatId) {

      currentChatId =
        null;

      messages.innerHTML = "";

      currentChatTitle.textContent =
        "Student+ AI";

      showWelcome();

      if (chats.length > 0) {

        await openChat(
          chats[0].id
        );

      }

    }

    renderChatList();

  } catch (error) {

    console.error(error);

    showError(
      "Чатты өшіру кезінде қате болды."
    );

  }

}


// ==================================================
// RENDER MESSAGES
// ==================================================

function renderMessages(chatMessages) {

  messages.innerHTML = "";

  if (
    !chatMessages ||
    chatMessages.length === 0
  ) {

    showWelcome();

    return;

  }


  hideWelcome();


  chatMessages.forEach(
    (message) => {

      addMessageToUI(
        message.role,
        message.content,
        message.image
      );

    }
  );


  scrollToBottom();

}


// ==================================================
// ADD MESSAGE TO UI
// ==================================================

function addMessageToUI(
  role,
  content,
  image = null
) {

  const row =
    document.createElement("div");

  row.className =
    `message-row ${role}`;


  const avatar =
    document.createElement("div");

  avatar.className =
    "message-avatar";

  avatar.textContent =
    role === "user"
      ? "YOU"
      : "S+";


  const bubble =
    document.createElement("div");

  bubble.className =
    "message-content";


  if (image?.url) {

    const imageElement =
      document.createElement("img");

    imageElement.className =
      "message-image";

    imageElement.src =
      `${API_URL}${image.url}`;

    imageElement.alt =
      "Жіберілген сурет";

    imageElement.loading =
      "lazy";

    bubble.appendChild(
      imageElement
    );

  }


  if (content) {

    const textElement =
      document.createElement("div");

    textElement.innerHTML =
      formatAIResponse(content);

    bubble.appendChild(
      textElement
    );

  }


  row.appendChild(avatar);

  row.appendChild(bubble);

  messages.appendChild(row);

}


// ==================================================
// FORMAT AI RESPONSE
// ==================================================

function escapeHTML(text) {

  const div =
    document.createElement("div");

  div.textContent =
    text;

  return div.innerHTML;

}


function formatAIResponse(text) {

  if (!text) return "";

  let html =
    escapeHTML(text);


  // Code blocks
  html =
    html.replace(
      /```(\w+)?\n?([\s\S]*?)```/g,
      (_, language, code) => {

        return `
          <pre><code>${code.trim()}</code></pre>
        `;

      }
    );


  // Inline code
  html =
    html.replace(
      /`([^`]+)`/g,
      "<code>$1</code>"
    );


  // Bold
  html =
    html.replace(
      /\*\*(.*?)\*\*/g,
      "<strong>$1</strong>"
    );


  // New lines
  html =
    html.replace(
      /\n/g,
      "<br>"
    );


  return html;

}


// ==================================================
// SEND MESSAGE
// ==================================================

chatForm.addEventListener(
  "submit",
  async (event) => {

    event.preventDefault();

    await sendMessage();

  }
);


async function sendMessage() {

  if (isSending) return;


  const text =
    messageInput.value.trim();


  if (!text && !selectedImage) {

    return;

  }


  isSending = true;

  sendBtn.disabled = true;


  hideWelcome();


  // ----------------------------------------------
  // CREATE CHAT AUTOMATICALLY
  // ----------------------------------------------

  if (!currentChatId) {

    await createChatAutomatically();

  }


  // ----------------------------------------------
  // SHOW USER MESSAGE IMMEDIATELY
  // ----------------------------------------------

  const localImage =
    selectedImage
      ? URL.createObjectURL(
          selectedImage
        )
      : null;


  addLocalMessage(
    "user",
    text,
    localImage
  );


  const formData =
    new FormData();

  formData.append(
    "chatId",
    currentChatId
  );

  formData.append(
    "message",
    text
  );


  if (selectedImage) {

    formData.append(
      "image",
      selectedImage
    );

  }


  clearComposer();


  showTyping();


  try {

    const response =
      await fetch(
        `${API_URL}/api/chat`,
        {
          method: "POST",
          body: formData
        }
      );


    const data =
      await response.json();


    if (!response.ok) {

      throw new Error(
        data.details ||
        data.error ||
        "AI қатесі"
      );

    }


    // --------------------------------------------
    // AI MESSAGE
    // --------------------------------------------

    hideTyping();


    addMessageToUI(
      "assistant",
      data.reply
    );


    scrollToBottom();


    // --------------------------------------------
    // UPDATE CHAT ID
    // --------------------------------------------

    if (data.chatId) {

      currentChatId =
        data.chatId;

    }


    // --------------------------------------------
    // UPDATE CHAT LIST
    // --------------------------------------------

    await loadChatsOnly();


  } catch (error) {

    hideTyping();

    console.error(error);

    addMessageToUI(
      "assistant",
      `❌ Қате: ${error.message}`
    );

  } finally {

    isSending = false;

    sendBtn.disabled = false;

    messageInput.focus();

  }

}


// ==================================================
// AUTOMATIC CHAT
// ==================================================

async function createChatAutomatically() {

  try {

    const response =
      await fetch(
        `${API_URL}/api/chats`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json"
          }
        }
      );


    if (!response.ok) {

      throw new Error(
        "Чат жасау мүмкін болмады."
      );

    }


    const chat =
      await response.json();

    currentChatId =
      chat.id;


    chats.unshift({
      id: chat.id,
      title: chat.title,
      createdAt: chat.createdAt,
      updatedAt: chat.updatedAt,
      messageCount: 0
    });


  } catch (error) {

    console.error(error);

    throw error;

  }

}


// ==================================================
// ADD LOCAL USER MESSAGE
// ==================================================

function addLocalMessage(
  role,
  content,
  imageUrl
) {

  const row =
    document.createElement("div");

  row.className =
    `message-row ${role}`;


  const avatar =
    document.createElement("div");

  avatar.className =
    "message-avatar";

  avatar.textContent =
    role === "user"
      ? "YOU"
      : "S+";


  const bubble =
    document.createElement("div");

  bubble.className =
    "message-content";


  if (imageUrl) {

    const image =
      document.createElement("img");

    image.className =
      "message-image";

    image.src =
      imageUrl;

    image.alt =
      "Жүктелген сурет";

    bubble.appendChild(image);

  }


  if (content) {

    const text =
      document.createElement("div");

    text.innerHTML =
      formatAIResponse(content);

    bubble.appendChild(text);

  }


  row.appendChild(avatar);

  row.appendChild(bubble);

  messages.appendChild(row);


  scrollToBottom();

}


// ==================================================
// LOAD CHATS ONLY
// ==================================================

async function loadChatsOnly() {

  const response =
    await fetch(
      `${API_URL}/api/chats`
    );

  if (!response.ok) return;

  chats =
    await response.json();

  renderChatList(
    chatSearch.value
  );

}


// ==================================================
// CLEAR CHAT
// ==================================================

clearChatBtn.addEventListener(
  "click",
  async () => {

    if (!currentChatId) return;

    await deleteChat(
      currentChatId
    );

  }
);


// ==================================================
// SEARCH
// ==================================================

chatSearch.addEventListener(
  "input",
  () => {

    renderChatList(
      chatSearch.value
    );

  }
);


// ==================================================
// SUGGESTIONS
// ==================================================

function setupSuggestionButtons() {

  const buttons =
    document.querySelectorAll(
      ".suggestion-card"
    );


  buttons.forEach(
    (button) => {

      button.addEventListener(
        "click",
        () => {

          const text =
            button.dataset.message;

          messageInput.value =
            text;

          autoResizeTextarea();

          messageInput.focus();

        }
      );

    }
  );

}


// ==================================================
// TEXTAREA
// ==================================================

function setupTextarea() {

  messageInput.addEventListener(
    "input",
    autoResizeTextarea
  );


  messageInput.addEventListener(
    "keydown",
    (event) => {

      if (
        event.key === "Enter" &&
        !event.shiftKey
      ) {

        event.preventDefault();

        chatForm.requestSubmit();

      }

    }
  );

}


function autoResizeTextarea() {

  messageInput.style.height =
    "auto";

  messageInput.style.height =
    `${Math.min(
      messageInput.scrollHeight,
      150
    )}px`;

}


// ==================================================
// IMAGE UPLOAD
// ==================================================

function setupImageUpload() {

  attachBtn.addEventListener(
    "click",
    () => {

      imageInput.click();

    }
  );


  imageInput.addEventListener(
    "change",
    () => {

      const file =
        imageInput.files?.[0];

      if (!file) return;


      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif"
      ];


      if (
        !allowedTypes.includes(
          file.type
        )
      ) {

        alert(
          "Тек JPG, PNG, WEBP немесе GIF суреттерін таңдаңыз."
        );

        imageInput.value = "";

        return;

      }


      if (
        file.size >
        10 * 1024 * 1024
      ) {

        alert(
          "Сурет көлемі 10 MB-тан аспауы керек."
        );

        imageInput.value = "";

        return;

      }


      selectedImage =
        file;


      previewImage.src =
        URL.createObjectURL(file);

      attachmentPreview.classList.remove(
        "hidden"
      );

    }
  );


  removeImageBtn.addEventListener(
    "click",
    removeSelectedImage
  );

}


function removeSelectedImage() {

  selectedImage =
    null;

  imageInput.value =
    "";

  previewImage.src =
    "";

  attachmentPreview.classList.add(
    "hidden"
  );

}


// ==================================================
// CLEAR COMPOSER
// ==================================================

function clearComposer() {

  messageInput.value =
    "";

  autoResizeTextarea();

  removeSelectedImage();

}


// ==================================================
// WELCOME
// ==================================================

function showWelcome() {

  welcomeScreen.classList.remove(
    "hidden"
  );

}


function hideWelcome() {

  welcomeScreen.classList.add(
    "hidden"
  );

}


// ==================================================
// TYPING
// ==================================================

function showTyping() {

  typingIndicator.classList.remove(
    "hidden"
  );

  scrollToBottom();

}


function hideTyping() {

  typingIndicator.classList.add(
    "hidden"
  );

}


// ==================================================
// SCROLL
// ==================================================

function scrollToBottom() {

  requestAnimationFrame(
    () => {

      messagesContainer.scrollTop =
        messagesContainer.scrollHeight;

    }
  );

}


// ==================================================
// DATE
// ==================================================

function formatDate(dateString) {

  if (!dateString) {
    return "";
  }


  const date =
    new Date(dateString);


  if (
    Number.isNaN(
      date.getTime()
    )
  ) {

    return "";

  }


  const now =
    new Date();


  const sameDay =
    date.toDateString() ===
    now.toDateString();


  if (sameDay) {

    return date.toLocaleTimeString(
      "kk-KZ",
      {
        hour: "2-digit",
        minute: "2-digit"
      }
    );

  }


  return date.toLocaleDateString(
    "kk-KZ",
    {
      day: "2-digit",
      month: "2-digit"
    }
  );

}


// ==================================================
// ERROR
// ==================================================

function showError(message) {

  console.error(message);

  addMessageToUI(
    "assistant",
    `❌ ${message}`
  );

}