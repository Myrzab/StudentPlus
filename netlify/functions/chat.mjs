import OpenAI from "openai";
import { getStore } from "@netlify/blobs";
import crypto from "node:crypto";

/*
==================================================
STUDENT+ AI
БАРЛЫҚ CHAT ФУНКЦИЯЛАРЫ БІР ФАЙЛДА
==================================================

GET    /chat                 → барлық чаттар
GET    /chat?id=ID           → нақты чат
POST   /chat                → AI хабарлама
POST   /chat {action:create}→ жаңа чат
DELETE /chat?id=ID           → чат өшіру

Netlify Blobs:
studentplus-chats
==================================================
*/


/*
==================================================
OPENAI
==================================================
*/

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});


/*
==================================================
NETLIFY BLOBS
==================================================
*/

const chatStore = getStore("studentplus-chats");


/*
==================================================
JSON RESPONSE
==================================================
*/

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
}


/*
==================================================
ID
==================================================
*/

function createId() {
  return crypto.randomUUID();
}


/*
==================================================
CHAT TITLE
==================================================
*/

function createTitle(text) {
  const clean = String(text || "")
    .replace(/\s+/g, " ")
    .trim();

  if (!clean) {
    return "Жаңа чат";
  }

  if (clean.length > 45) {
    return clean.slice(0, 45) + "...";
  }

  return clean;
}


/*
==================================================
NEW CHAT OBJECT
==================================================
*/

function createNewChat(title = "Жаңа чат") {
  const now = new Date().toISOString();

  return {
    id: createId(),

    title: title || "Жаңа чат",

    createdAt: now,

    updatedAt: now,

    messages: [],
  };
}


/*
==================================================
NORMALIZE CHAT
==================================================
*/

function normalizeChat(chat) {
  return {
    id: chat.id,

    title:
      chat.title ||
      "Жаңа чат",

    createdAt:
      chat.createdAt,

    updatedAt:
      chat.updatedAt,

    messages:
      Array.isArray(chat.messages)
        ? chat.messages
        : [],
  };
}


/*
==================================================
STUDENT+ AI IDENTITY
==================================================
*/

const STUDENT_PLUS_INSTRUCTIONS = `
Сен — Student+ платформасының ресми AI көмекшісісің.

Сенің атың — Student+ AI.

Өзіңді ешқашан жай ғана "ChatGPT" деп таныстырма.

Егер қолданушы:
- "Сен кімсің?"
- "Атың кім?"
- "Сен не істейсің?"
- "Сен ChatGPT-сің бе?"
- "Қандай AI-сің?"
- "Сені кім жасады?"
- "Сенің атың кім?"
сияқты сұрақтар қойса, Student+ AI ретінде жауап бер.

"Сен кімсің?" деген сұраққа:

"Мен — Student+ AI, Student+ білім беру платформасының AI көмекшісімін."

деп жауап бер.

"Сен ChatGPT-сің бе?" деген сұраққа:

"Мен OpenAI моделіне негізделген, Student+ платформасына біріктірілген Student+ AI көмекшісімін."

деп жауап бер.

Негізгі тілің — қазақ тілі.

Егер қолданушы орыс тілінде сұрақ қойса,
орыс тілінде жауап бер.

Егер қолданушы ағылшын тілінде сұрақ қойса,
ағылшын тілінде жауап бер.

Сен студенттерге арналған AI көмекшісісің.

Сен келесі бағыттарда көмектесе аласың:

HTML
CSS
JavaScript
Python
React
Node.js
Express
Backend
Frontend
SQL
PHP
Flutter
Mobile Development
Programming
Computer Science
Algorithms
Git
GitHub
IT
Web Development

Код жазғанда түсінікті және жұмыс істейтін код бер.

Егер қолданушы кодтағы қатені көрсетсе,
қатенің себебін түсіндіріп,
дұрыс нұсқасын бер.

Егер есеп сұралса,
қажет болған жағдайда қадам-қадамымен түсіндір.

Егер қолданушы Student+ туралы сұраса,
Student+ — студенттерге арналған білім беру платформасы екенін түсіндір.

Егер Student+ AI туралы сұраса,
Student+ AI — Student+ платформасына біріктірілген AI көмекшісі екенін айт.

Өзіңді OpenAI компаниясының жеке ресми ChatGPT өнімі ретінде көрсетпе.

Сен — Student+ платформасындағы Student+ AI.

Жауаптарың түсінікті, нақты және пайдалы болсын.
`;


/*
==================================================
MAIN FUNCTION
==================================================
*/

export default async function handler(req) {

  const url = new URL(req.url);


  try {

    /*
    ==================================================
    1. GET
    ==================================================

    GET /chat
    → барлық чат

    GET /chat?id=123
    → нақты чат
    */


    if (req.method === "GET") {

      const chatId =
        url.searchParams.get("id");


      /*
      ================================================
      НАҚТЫ ЧАТТЫ АЛУ
      ================================================
      */

      if (chatId) {

        const chat =
          await chatStore.get(chatId, {
            type: "json",
          });


        if (!chat) {

          return json(
            {
              success: false,

              error:
                "Чат табылмады.",
            },

            404
          );

        }


        return json({
          success: true,

          chat:
            normalizeChat(chat),
        });

      }


      /*
      ================================================
      БАРЛЫҚ ЧАТТАР
      ================================================
      */

      const result =
        await chatStore.list();


      const chats = [];


      for (const item of result.blobs) {

        try {

          const chat =
            await chatStore.get(
              item.key,
              {
                type: "json",
              }
            );


          if (!chat) {
            continue;
          }


          chats.push({

            id:
              chat.id,

            title:
              chat.title ||
              "Жаңа чат",

            createdAt:
              chat.createdAt,

            updatedAt:
              chat.updatedAt,

            messageCount:
              Array.isArray(chat.messages)
                ? chat.messages.length
                : 0,

          });


        } catch (error) {

          console.error(
            "Chat read error:",
            item.key,
            error
          );

        }

      }


      /*
      ================================================
      СОҢҒЫ ӨЗГЕРГЕН ЧАТ ЖОҒАРЫДА
      ================================================
      */

      chats.sort(
        (a, b) =>
          new Date(
            b.updatedAt
          ).getTime() -
          new Date(
            a.updatedAt
          ).getTime()
      );


      return json({

        success: true,

        chats,

        count:
          chats.length,

      });

    }


    /*
    ==================================================
    2. POST
    ==================================================

    POST /chat

    Екі түрлі жұмыс істейді:

    A)
    { action: "create" }

    → жаңа бос чат

    B)
    {
      chatId,
      message
    }

    → AI сұрағы
    */


    if (req.method === "POST") {

      let body = {};


      try {

        body =
          await req.json();

      } catch {

        body = {};

      }


      /*
      ================================================
      ЖАҢА БОС ЧАТ
      ================================================
      */

      if (
        body.action === "create"
      ) {

        const chat =
          createNewChat(
            body.title ||
            "Жаңа чат"
          );


        await chatStore.setJSON(
          chat.id,
          chat
        );


        return json({

          success: true,

          chat,

        }, 201);

      }


      /*
      ================================================
      AI MESSAGE
      ================================================
      */

      const message =
        String(
          body.message || ""
        ).trim();


      let chatId =
        body.chatId ||
        null;


      if (!message) {

        return json(
          {
            success: false,

            error:
              "Message is required.",
          },

          400
        );

      }


      /*
      ================================================
      CHAT АЛУ
      ================================================
      */

      let chat = null;


      if (chatId) {

        chat =
          await chatStore.get(
            chatId,
            {
              type: "json",
            }
          );

      }


      /*
      ================================================
      CHAT ЖОҚ БОЛСА
      АВТОМАТТЫ ТҮРДЕ ЖАҢА ЧАТ
      ================================================
      */

      if (!chat) {

        chat =
          createNewChat(
            createTitle(message)
          );

        chatId =
          chat.id;

      }


      /*
      ================================================
      USER MESSAGE
      ================================================
      */

      const userMessage = {

        id:
          createId(),

        role:
          "user",

        content:
          message,

        createdAt:
          new Date().toISOString(),

      };


      chat.messages.push(
        userMessage
      );


      /*
      ================================================
      CHAT TITLE
      ================================================
      */

      if (
        !chat.title ||
        chat.title === "Жаңа чат"
      ) {

        chat.title =
          createTitle(message);

      }


      /*
      ================================================
      OPENAI HISTORY
      ================================================
      */

      const history =
        chat.messages
          .slice(-40)
          .map((item) => {

            return {

              role:
                item.role ===
                "assistant"
                  ? "assistant"
                  : "user",

              content: [

                {

                  type:
                    "input_text",

                  text:
                    item.content ||
                    "",

                },

              ],

            };

          });


      /*
      ================================================
      OPENAI
      ================================================
      */

      const response =
        await client.responses.create({

          model:
            process.env.OPENAI_MODEL,

          instructions:
            STUDENT_PLUS_INSTRUCTIONS,

          input:
            history,

        });


      /*
      ================================================
      AI RESPONSE
      ================================================
      */

      const reply =
        response.output_text ||
        "Кешіріңіз, жауап ала алмадым.";


      /*
      ================================================
      ASSISTANT MESSAGE
      ================================================
      */

      const assistantMessage = {

        id:
          createId(),

        role:
          "assistant",

        content:
          reply,

        createdAt:
          new Date().toISOString(),

      };


      chat.messages.push(
        assistantMessage
      );


      /*
      ================================================
      MESSAGE LIMIT
      ================================================
      */

      if (
        chat.messages.length >
        100
      ) {

        chat.messages =
          chat.messages.slice(
            -100
          );

      }


      /*
      ================================================
      UPDATE TIME
      ================================================
      */

      chat.updatedAt =
        new Date().toISOString();


      /*
      ================================================
      NETLIFY BLOBS
      ================================================
      */

      await chatStore.setJSON(
        chat.id,
        chat
      );


      /*
      ================================================
      RESPONSE
      ================================================
      */

      return json({

        success: true,

        chatId:
          chat.id,

        title:
          chat.title,

        reply,

        message:
          assistantMessage,

        chat: {

          id:
            chat.id,

          title:
            chat.title,

          createdAt:
            chat.createdAt,

          updatedAt:
            chat.updatedAt,

        },

      });

    }


    /*
    ==================================================
    3. DELETE
    ==================================================

    DELETE /chat?id=CHAT_ID

    → чат өшіру
    */


    if (req.method === "DELETE") {

      const chatId =
        url.searchParams.get(
          "id"
        );


      if (!chatId) {

        return json(
          {
            success: false,

            error:
              "Chat ID қажет.",
          },

          400
        );

      }


      /*
      ================================================
      CHAT ТЕКСЕРУ
      ================================================
      */

      const existing =
        await chatStore.get(
          chatId,
          {
            type: "json",
          }
        );


      if (!existing) {

        return json(
          {
            success: false,

            error:
              "Чат табылмады.",
          },

          404
        );

      }


      /*
      ================================================
      DELETE
      ================================================
      */

      await chatStore.delete(
        chatId
      );


      return json({

        success: true,

        id:
          chatId,

      });

    }


    /*
    ==================================================
    METHOD NOT ALLOWED
    ==================================================
    */

    return json(
      {
        success: false,

        error:
          "Бұл HTTP әдіс қолдау таппайды.",
      },

      405
    );


  } catch (error) {

    console.error(
      "Student+ AI error:",
      error
    );


    return json(
      {

        success: false,

        error:
          "Student+ AI серверінде қате болды.",

      },

      500
    );

  }

}