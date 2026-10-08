import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";
import multer from "multer";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";

dotenv.config();

// --------------------------------------------------
// PATH
// --------------------------------------------------

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BACKEND_DIR = __dirname;
const CHATS_FILE = path.join(BACKEND_DIR, "chats.json");
const UPLOADS_DIR = path.join(BACKEND_DIR, "uploads");

// --------------------------------------------------
// CREATE REQUIRED FILES / FOLDERS
// --------------------------------------------------

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

if (!fs.existsSync(CHATS_FILE)) {
  fs.writeFileSync(CHATS_FILE, "[]", "utf8");
}

// --------------------------------------------------
// APP
// --------------------------------------------------

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

app.use(
  express.json({
    limit: "20mb",
  })
);

// Uploaded images can be opened from:
// http://localhost:3000/uploads/filename.jpg
app.use("/uploads", express.static(UPLOADS_DIR));

// --------------------------------------------------
// OPENAI
// --------------------------------------------------

if (!process.env.OPENAI_API_KEY) {
  console.error("❌ OPENAI_API_KEY табылмады!");
  process.exit(1);
}

if (!process.env.OPENAI_MODEL) {
  console.error("❌ OPENAI_MODEL табылмады!");
  process.exit(1);
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

console.log(`🤖 Model: ${process.env.OPENAI_MODEL}`);

// --------------------------------------------------
// MULTER - IMAGE UPLOAD
// --------------------------------------------------

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },

  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();

    const uniqueName =
      `${Date.now()}-${crypto.randomBytes(6).toString("hex")}` +
      extension;

    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,

  limits: {
    fileSize: 10 * 1024 * 1024,
  },

  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
    ];

    if (!allowedTypes.includes(file.mimetype)) {
      return cb(
        new Error(
          "Тек PNG, JPG, JPEG, WEBP немесе GIF суреттерін жүктеуге болады."
        )
      );
    }

    cb(null, true);
  },
});

// --------------------------------------------------
// HELPERS
// --------------------------------------------------

function readChats() {
  try {
    const data = fs.readFileSync(CHATS_FILE, "utf8");

    if (!data.trim()) {
      return [];
    }

    return JSON.parse(data);
  } catch (error) {
    console.error("❌ chats.json оқу қатесі:", error);
    return [];
  }
}

function writeChats(chats) {
  fs.writeFileSync(
    CHATS_FILE,
    JSON.stringify(chats, null, 2),
    "utf8"
  );
}

function generateId() {
  return crypto.randomUUID();
}

function createTitle(message) {
  if (!message || !message.trim()) {
    return "Жаңа чат";
  }

  const clean = message.trim().replace(/\s+/g, " ");

  if (clean.length <= 40) {
    return clean;
  }

  return clean.substring(0, 40) + "...";
}

// --------------------------------------------------
// HOME / HEALTH CHECK
// --------------------------------------------------

app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "Student+ AI Server жұмыс істеп тұр!",
    model: process.env.OPENAI_MODEL,
  });
});

// --------------------------------------------------
// GET ALL CHATS
// --------------------------------------------------

app.get("/api/chats", (req, res) => {
  try {
    const chats = readChats();

    const result = chats
      .map((chat) => ({
        id: chat.id,
        title: chat.title,
        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt,
        messageCount: chat.messages?.length || 0,
      }))
      .sort(
        (a, b) =>
          new Date(b.updatedAt) -
          new Date(a.updatedAt)
      );

    res.json(result);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Чаттарды алу кезінде қате болды.",
    });
  }
});

// --------------------------------------------------
// CREATE NEW CHAT
// --------------------------------------------------

app.post("/api/chats", (req, res) => {
  try {
    const chats = readChats();

    const now = new Date().toISOString();

    const newChat = {
      id: generateId(),
      title: "Жаңа чат",
      createdAt: now,
      updatedAt: now,
      messages: [],
    };

    chats.push(newChat);

    writeChats(chats);

    res.status(201).json(newChat);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Жаңа чат жасау кезінде қате болды.",
    });
  }
});

// --------------------------------------------------
// GET ONE CHAT
// --------------------------------------------------

app.get("/api/chats/:id", (req, res) => {
  try {
    const chats = readChats();

    const chat = chats.find(
      (item) => item.id === req.params.id
    );

    if (!chat) {
      return res.status(404).json({
        error: "Чат табылмады.",
      });
    }

    res.json(chat);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Чатты алу кезінде қате болды.",
    });
  }
});

// --------------------------------------------------
// DELETE CHAT
// --------------------------------------------------

app.delete("/api/chats/:id", (req, res) => {
  try {
    const chats = readChats();

    const chat = chats.find(
      (item) => item.id === req.params.id
    );

    if (!chat) {
      return res.status(404).json({
        error: "Чат табылмады.",
      });
    }

    const updatedChats = chats.filter(
      (item) => item.id !== req.params.id
    );

    writeChats(updatedChats);

    res.json({
      success: true,
      message: "Чат өшірілді.",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Чатты өшіру кезінде қате болды.",
    });
  }
});

// --------------------------------------------------
// CHAT WITH AI
// Supports:
// - text
// - chat history
// - image
// --------------------------------------------------

app.post(
  "/api/chat",
  upload.single("image"),
  async (req, res) => {
    try {
      const message = req.body.message?.trim();
      let chatId = req.body.chatId;

      if (!message && !req.file) {
        return res.status(400).json({
          error: "Хабарлама немесе сурет жіберіңіз.",
        });
      }

      const chats = readChats();

      // ----------------------------------------------
      // FIND OR CREATE CHAT
      // ----------------------------------------------

      let chat = chats.find(
        (item) => item.id === chatId
      );

      if (!chat) {
        const now = new Date().toISOString();

        chat = {
          id: generateId(),
          title: createTitle(message),
          createdAt: now,
          updatedAt: now,
          messages: [],
        };

        chats.push(chat);

        chatId = chat.id;
      }

      // ----------------------------------------------
      // USER MESSAGE
      // ----------------------------------------------

      const userMessage = {
        id: generateId(),
        role: "user",
        content: message || "",
        createdAt: new Date().toISOString(),
      };

      // ----------------------------------------------
      // IMAGE
      // ----------------------------------------------

      let imageDataUrl = null;

      if (req.file) {
        const imageBuffer = fs.readFileSync(
          req.file.path
        );

        const base64Image =
          imageBuffer.toString("base64");

        imageDataUrl =
          `data:${req.file.mimetype};base64,${base64Image}`;

        userMessage.image = {
          filename: req.file.filename,
          originalName: req.file.originalname,
          mimetype: req.file.mimetype,
          url: `/uploads/${req.file.filename}`,
        };
      }

      // ----------------------------------------------
      // BUILD HISTORY
      // ----------------------------------------------

      const previousMessages =
        chat.messages.slice(-20);

      const history = previousMessages.map(
        (item) => ({
          role: item.role,
          content: item.content || "",
        })
      );

      // ----------------------------------------------
      // CURRENT USER CONTENT
      // ----------------------------------------------

      const currentContent = [];

      if (message) {
        currentContent.push({
          type: "input_text",
          text: message,
        });
      }

      if (imageDataUrl) {
        currentContent.push({
          type: "input_image",
          image_url: imageDataUrl,
          detail: "auto",
        });
      }

      // ----------------------------------------------
      // OPENAI INPUT
      // ----------------------------------------------

      let input;

      if (history.length > 0) {
        input = [
          ...history.map((item) => ({
            role: item.role,
            content: item.content,
          })),

          {
            role: "user",
            content: currentContent,
          },
        ];
      } else {
        input = [
          {
            role: "user",
            content: currentContent,
          },
        ];
      }

      // ----------------------------------------------
      // OPENAI REQUEST
      // ----------------------------------------------

      const response = await openai.responses.create({
        model: process.env.OPENAI_MODEL,
        input,
      });

      const reply =
        response.output_text ||
        "Кешіріңіз, жауап ала алмадым.";

      // ----------------------------------------------
      // SAVE USER MESSAGE
      // ----------------------------------------------

      chat.messages.push(userMessage);

      // ----------------------------------------------
      // SAVE AI MESSAGE
      // ----------------------------------------------

      const assistantMessage = {
        id: generateId(),
        role: "assistant",
        content: reply,
        createdAt: new Date().toISOString(),
      };

      chat.messages.push(assistantMessage);

      // ----------------------------------------------
      // UPDATE CHAT
      // ----------------------------------------------

      chat.updatedAt =
        new Date().toISOString();

      if (
        chat.title === "Жаңа чат" &&
        message
      ) {
        chat.title = createTitle(message);
      }

      writeChats(chats);

      // ----------------------------------------------
      // RESPONSE TO FRONTEND
      // ----------------------------------------------

      res.json({
        success: true,
        chatId: chat.id,
        reply,
        message: assistantMessage,
        image: userMessage.image || null,
      });
    } catch (error) {
      console.error(
        "❌ OpenAI Error:",
        error
      );

      // Егер upload жасалып, кейін API error болса
      if (req.file) {
        try {
          fs.unlinkSync(req.file.path);
        } catch {}
      }

      res.status(500).json({
        error: "OpenAI API қатесі.",
        details:
          error?.message ||
          "Белгісіз қате.",
      });
    }
  }
);

// --------------------------------------------------
// UPLOAD ERROR
// --------------------------------------------------

app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    return res.status(400).json({
      error:
        error.code === "LIMIT_FILE_SIZE"
          ? "Сурет көлемі 10 MB-тан аспауы керек."
          : error.message,
    });
  }

  if (error) {
    return res.status(400).json({
      error: error.message,
    });
  }

  next();
});

// --------------------------------------------------
// SERVER
// --------------------------------------------------

app.listen(PORT, () => {
  console.log("");
  console.log("=================================");
  console.log("🚀 Student+ AI Server іске қосылды");
  console.log(`🌐 http://localhost:${PORT}`);
  console.log(`🤖 Model: ${process.env.OPENAI_MODEL}`);
  console.log("💬 Chat API: /api/chat");
  console.log("🗂️ Chats API: /api/chats");
  console.log("🖼️ Uploads: /uploads");
  console.log("=================================");
  console.log("");
});