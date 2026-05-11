import { Router, type IRouter } from "express";
import OpenAI from "openai";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

function getOpenAI() {
  return new OpenAI({
    apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY || undefined,
    baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL || undefined,
  });
}

const GENRE_LABELS: Record<string, string> = {
  fiction: "خيال أدبي",
  romance: "رومانسي",
  drama: "دراما",
  history: "تاريخي",
  science: "خيال علمي",
  mystery: "غموض وتشويق",
  fantasy: "فانتازيا",
  horror: "رعب",
  poetry: "شعر نثري",
};

const ADULT_KEYWORDS = [
  "جنس", "إباحي", "عاري", "مشهد جنسي", "غرفة النوم", "ممارسة", "إثارة جنسية",
  "sex", "porn", "nude", "naked", "erotic", "explicit", "adult content",
  "محتوى بالغين", "18+", "لقاء حميم", "مضاجعة",
];

function containsAdultContent(text: string): boolean {
  const lower = text.toLowerCase();
  return ADULT_KEYWORDS.some((kw) => lower.includes(kw.toLowerCase()));
}

router.post("/ai/write", requireAuth, async (req, res): Promise<void> => {
  const { prompt, genre = "fiction", title = "رواية جديدة", language = "ar" } = req.body as {
    prompt?: string;
    genre?: string;
    title?: string;
    language?: string;
  };

  if (!prompt || typeof prompt !== "string" || prompt.trim().length < 5) {
    res.status(400).json({ error: "يرجى تقديم فكرة القصة" });
    return;
  }

  if (containsAdultContent(prompt) || containsAdultContent(title)) {
    res.status(400).json({ error: "المحتوى الإباحي أو للبالغين غير مسموح به على المنصة." });
    return;
  }

  res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  const genreAr = GENRE_LABELS[genre] ?? genre;
  const isEnglish = language === "en";

  const openai = getOpenAI();

  const systemPrompt = isEnglish
    ? `You are a skilled novelist who writes long, rich stories in fluent English. Your style is literary and sophisticated, combining deep character descriptions, vivid scenes, and emotional depth. Write continuous prose without subheadings or numbering.

Strict rules:
- Do not write any explicit sexual content or adult material under any circumstances.
- If asked for inappropriate content, politely decline and write a quality literary alternative instead.
- Content must be appropriate for general audiences (PG-13 maximum).`
    : `أنت روائي بارع تكتب روايات طويلة وغنية باللغة العربية الفصحى. أسلوبك أدبي راقٍ يجمع بين وصف عميق للشخصيات والأحداث والمشاعر. اكتب نصاً طويلاً متواصلاً دون عناوين فرعية أو ترقيم.

قواعد صارمة يجب الالتزام بها:
- لا تكتب أي محتوى إباحي أو جنسي صريح أو محتوى للبالغين تحت أي ظرف.
- إذا طُلب منك كتابة محتوى غير لائق، ارفض بأدب واكتب بديلاً أدبياً راقياً.
- المحتوى يجب أن يكون لائقاً لجميع الأعمار (PG-13 كحد أقصى).`;

  const userPrompt = isEnglish
    ? `Write a long, complete chapter for a "${genreAr}" novel titled "${title.trim()}".

Story idea: ${prompt.trim()}

Write a full chapter (1500 words or more) in a refined literary style, with vivid dialogue, rich visual descriptions, and deep characters. Make the story gripping from the very first line.`
    : `اكتب فصلاً طويلاً وكاملاً لرواية من تصنيف "${genreAr}" بعنوان "${title.trim()}".

فكرة القصة: ${prompt.trim()}

اكتب فصلاً طويلاً (١٥٠٠ كلمة أو أكثر) بأسلوب أدبي رفيع، مع حوارات حية وأوصاف بصرية غنية وشخصيات ذات عمق. اجعل القصة مشوّقة من السطر الأول.`;

  try {
    const stream = await openai.chat.completions.create({
      model: "gpt-4.1",
      max_tokens: 8192,
      stream: true,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
    }
    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "حدث خطأ في توليد المحتوى";
    res.write(`data: ${JSON.stringify({ error: message })}\n\n`);
    res.end();
  }
});

export default router;
