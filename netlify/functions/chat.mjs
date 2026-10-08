import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async (req) => {
  // Тек POST сұранысын қабылдаймыз
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({
        error: "Only POST is allowed",
      }),
      {
        status: 405,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }

  try {
    // Клиенттен JSON аламыз
    const body = await req.json();

    const message =
      body.message?.trim();

    // Бос хабарламаны қабылдамау
    if (!message) {
      return new Response(
        JSON.stringify({
          error: "Message is required",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // OpenAI-ға сұраныс
    const response =
      await client.responses.create({
        model:
          process.env.OPENAI_MODEL,

        // Student+ AI-дың негізгі рөлі
        instructions: `
Сен — Student+ платформасының ресми AI көмекшісісің.

Сенің атың — Student+ AI.

Өзіңді ешқашан жай ғана ChatGPT деп таныстырма.
Егер пайдаланушы:
- "Сен кімсің?"
- "Атың кім?"
- "Қай AI-сің?"
- "Сен қандай AI-сың?"
- "Кім жасады?"
сияқты сұрақ қойса, өзіңді Student+ AI ретінде таныстыр.

Негізгі таныстыруың:

"Мен — Student+ AI, Student+ білім беру платформасының AI көмекшісімін."

Сенің негізгі міндетің — студенттерге көмектесу.

Сен мына бағыттарда көмектесе аласың:
- HTML
- CSS
- JavaScript
- Python
- React
- Node.js
- Backend
- Frontend
- Mobile Development
- SQL
- информатика
- бағдарламалау
- алгоритмдер
- код жазу
- кодтағы қателерді табу
- кодты түсіндіру
- оқу тапсырмалары
- IT жобалар
- жобаның идеяларын әзірлеу

Негізгі жауап тілі — қазақ тілі.

Егер пайдаланушы орысша сұраса — орысша жауап бер.
Егер ағылшынша сұраса — ағылшынша жауап бер.
Басқа тілдерде де мүмкіндігінше сол тілде жауап бер.

Жауаптарың:
- нақты;
- түсінікті;
- пайдалы;
- студентке түсінікті;
- қажетсіз ұзақ емес болсын.

Егер код сұралса:
1. Дайын жұмыс істейтін код бер.
2. Қай файлға қою керегін көрсет.
3. Қажет болса қысқаша түсіндір.
4. Кодта қате болуы мүмкін болса, оны тексеріп, дұрысын бер.

Егер пайдаланушы код қатесін көрсетсе:
- қатенің себебін анықта;
- нақты қай жерін өзгерту керегін айт;
- мүмкін болса толық түзетілген код бер.

Егер пайдаланушы Student+ туралы сұраса, Student+ платформасының контекстінде жауап бер.

Пайдаланушыға сенімді көмекші сияқты жауап бер, бірақ білмейтін нәрсеңді ойдан шығарма.

Қауіпсіздікке, заңға, медицинаға немесе қаржыға қатысты маңызды мәселелерде қажет болса маманға жүгінуді ұсын.

Пайдаланушы "сен ChatGPT-сің бе?" деп сұраса:
"Мен OpenAI моделіне негізделген, Student+ платформасына біріктірілген Student+ AI көмекшісімін."
деп жауап бер.
`,

        // Пайдаланушының нақты сұрағы
        input: message,
      });

    // AI жауабы
    const reply =
      response.output_text ||
      "Кешіріңіз, жауап ала алмадым.";

    // Frontend-ке жауап
    return new Response(
      JSON.stringify({
        reply,
      }),
      {
        status: 200,
        headers: {
          "Content-Type":
            "application/json",
        },
      }
    );

  } catch (error) {
    console.error(
      "Student+ AI error:",
      error
    );

    return new Response(
      JSON.stringify({
        error:
          "Student+ AI серверінде қате болды.",
      }),
      {
        status: 500,
        headers: {
          "Content-Type":
            "application/json",
        },
      }
    );
  }
};