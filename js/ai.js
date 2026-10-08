/* ==================================================
   STUDENT+ AI FRONTEND
   Netlify Function version
   ================================================== */

const API_URL = "";

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

let currentMessages = [];
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
  if (aiSidebar) {
    aiSidebar.classList.add("open");
  }

  if (sidebarOverlay) {
    sidebarOverlay.classList.add("open");
  }
}

function closeSidebar() {
  if (aiSidebar) {
    aiSidebar.classList.remove("open");
  }

  if (sidebarOverlay) {
    sidebarOverlay.classList.remove("open");
  }
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
  () => {
    setupSuggestionButtons();
    setupTextarea();
    setupImageUpload();

    showWelcome();

    if (currentChatTitle) {
      currentChatTitle.textContent = "Student+ AI";
    }

    if (chatCount) {
      chatCount.textContent = "0";
    }
  }
);

// ==================================================
// SUGGESTION BUTTONS
// ==================================================

function setupSuggestionButtons() {
  const buttons =
    document.querySelectorAll(
      ".suggestion-card"
    );

  buttons.forEach((button) => {
    button.addEventListener(
      "click",
      () => {
        const text =
          button.dataset.message;

        if (!text) return;

        messageInput.value = text;

        autoResizeTextarea();

        messageInput.focus();
      }
    );
  });
}

// ==================================================
// TEXTAREA
// ==================================================

function setupTextarea() {
  if (!messageInput) return;

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

        if (chatForm) {
          chatForm.requestSubmit();
        }
      }
    }
  );
}

function autoResizeTextarea() {
  if (!messageInput) return;

  messageInput.style.height = "auto";

  messageInput.style.height =
    `${Math.min(
      messageInput.scrollHeight,
      150
    )}px`;
}

// ==================================================
// SEND MESSAGE
// ==================================================

if (chatForm) {
  chatForm.addEventListener(
    "submit",
    async (event) => {
      event.preventDefault();

      await sendMessage();
    }
  );
}

async function sendMessage() {
  if (isSending) return;

  const text =
    messageInput.value.trim();

  if (!text && !selectedImage) {
    return;
  }

  isSending = true;

  if (sendBtn) {
    sendBtn.disabled = true;
  }

  hideWelcome();

  // ----------------------------------------------
  // SHOW USER MESSAGE
  // ----------------------------------------------

  const localImage =
    selectedImage
      ? URL.createObjectURL(selectedImage)
      : null;

  addLocalMessage(
    "user",
    text,
    localImage
  );

  const imageForRequest =
    selectedImage;

  clearComposer();

  showTyping();

  try {
    // --------------------------------------------
    // NETLIFY FUNCTION REQUEST
    // --------------------------------------------

    const response =
      await fetch(
        "/.netlify/functions/chat",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({
            message: text
          })
        }
      );

    let data;

    try {
      data =
        await response.json();
    } catch {
      data = {};
    }

    if (!response.ok) {
      throw new Error(
        data.error ||
        data.details ||
        "AI серверінде қате болды."
      );
    }

    // --------------------------------------------
    // AI MESSAGE
    // --------------------------------------------

    hideTyping();

    addMessageToUI(
      "assistant",
      data.reply ||
        "Жауап алынбады."
    );

    scrollToBottom();

  } catch (error) {
    hideTyping();

    console.error(
      "Student+ AI error:",
      error
    );

    addMessageToUI(
      "assistant",
      `❌ Қате: ${error.message}`
    );

  } finally {
    isSending = false;

    if (sendBtn) {
      sendBtn.disabled = false;
    }

    if (messageInput) {
      messageInput.focus();
    }
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

    image.src = imageUrl;

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
      image.url;

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

  scrollToBottom();
}

// ==================================================
// FORMAT AI RESPONSE
// ==================================================

function escapeHTML(text) {
  const div =
    document.createElement("div");

  div.textContent = text;

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
// IMAGE UPLOAD
// ==================================================

function setupImageUpload() {
  if (!attachBtn || !imageInput) {
    return;
  }

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

      selectedImage = file;

      if (previewImage) {
        previewImage.src =
          URL.createObjectURL(file);
      }

      if (attachmentPreview) {
        attachmentPreview.classList.remove(
          "hidden"
        );
      }
    }
  );

  if (removeImageBtn) {
    removeImageBtn.addEventListener(
      "click",
      removeSelectedImage
    );
  }
}

function removeSelectedImage() {
  selectedImage = null;

  if (imageInput) {
    imageInput.value = "";
  }

  if (previewImage) {
    previewImage.src = "";
  }

  if (attachmentPreview) {
    attachmentPreview.classList.add(
      "hidden"
    );
  }
}

// ==================================================
// CLEAR COMPOSER
// ==================================================

function clearComposer() {
  if (messageInput) {
    messageInput.value = "";

    autoResizeTextarea();
  }

  removeSelectedImage();
}

// ==================================================
// WELCOME
// ==================================================

function showWelcome() {
  if (!welcomeScreen) return;

  welcomeScreen.classList.remove(
    "hidden"
  );
}

function hideWelcome() {
  if (!welcomeScreen) return;

  welcomeScreen.classList.add(
    "hidden"
  );
}

// ==================================================
// TYPING
// ==================================================

function showTyping() {
  if (!typingIndicator) return;

  typingIndicator.classList.remove(
    "hidden"
  );

  scrollToBottom();
}

function hideTyping() {
  if (!typingIndicator) return;

  typingIndicator.classList.add(
    "hidden"
  );
}

// ==================================================
// SCROLL
// ==================================================

function scrollToBottom() {
  if (!messagesContainer) return;

  requestAnimationFrame(
    () => {
      messagesContainer.scrollTop =
        messagesContainer.scrollHeight;
    }
  );
}

// ==================================================
// CLEAR CHAT
// ==================================================

if (clearChatBtn) {
  clearChatBtn.addEventListener(
    "click",
    () => {
      if (!messages) return;

      messages.innerHTML = "";

      currentMessages = [];

      showWelcome();

      if (currentChatTitle) {
        currentChatTitle.textContent =
          "Student+ AI";
      }
    }
  );
}

// ==================================================
// NEW CHAT
// ==================================================

if (newChatBtn) {
  newChatBtn.addEventListener(
    "click",
    () => {
      currentMessages = [];

      if (messages) {
        messages.innerHTML = "";
      }

      if (currentChatTitle) {
        currentChatTitle.textContent =
          "Student+ AI";
      }

      showWelcome();

      closeSidebar();

      if (messageInput) {
        messageInput.focus();
      }
    }
  );
}

// ==================================================
// SEARCH
// ==================================================

if (chatSearch) {
  chatSearch.addEventListener(
    "input",
    () => {
      // Chat history will be connected
      // after persistent storage is added.
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