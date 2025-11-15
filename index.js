import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";

dotenv.config();

const cache = new Map();
const app = express();
app.use(cors());
app.use(express.json());


if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not defined in .env file");
}
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const MODEL_NAME = process.env.GEMINI_MODEL || "gemini-2.5-flash";


const MOTIVATION_PATH = "Câu Truyền Động Lực.txt";
const stripLeadNumber = (s) => s.replace(/^\s*\d+\.\s*/, "");
const normalizeLine = (s) =>
  stripLeadNumber((s || "").trim()).replace(/\s+/g, " ");

let motivationalLines = [];
try {
  motivationalLines = fs
    .readFileSync(MOTIVATION_PATH, "utf-8")
    .split("\n")
    .map(normalizeLine)
    .filter((s) => s.length > 6);
  console.log(`✅ Loaded ${motivationalLines.length} motivational lines.`);
} catch (err) {
  console.error(`❌ Failed to load ${MOTIVATION_PATH}. Using fallbacks.`, err);
  motivationalLines = [
    "Mỗi ngày không cần tỏa sáng, chỉ cần đừng tắt đèn là được",
  ];
}


const LAYOUT_PATH = "layout.md";
let portfolioLayouts = [];

try {
  const layoutContent = fs.readFileSync(LAYOUT_PATH, "utf-8");
  const sections = layoutContent
    .split("---")
    .filter((s) => s.trim().length > 0);

  for (const section of sections) {
    const nameMatch = section.match(/##\s*(.*)/);
    if (nameMatch && nameMatch[1]) {
      const name = nameMatch[1].trim().replace(/["']/g, ""); // Remove quotes if any
      const description = section
        .replace(/##\s*(.*)/, "") // Remove the name line
        .replace(/\*\s*\(Layout\s*\d+\s*-\s*.*\)/g, "") // Remove layout position comments
        .split("\n")
        .filter((line) => line.trim().length > 0 && line.trim() !== "*")
        .map((line) => line.replace(/^\*\s*/, "").trim())
        .join(" ");

      if (name && description) {
        const numberMatch = section.match(/\(Layout\s*(\d+)\s*-/);
        const number =
          numberMatch && numberMatch[1]
            ? parseInt(numberMatch[1], 10)
            : portfolioLayouts.length + 1;
        portfolioLayouts.push({ number, name, description });
      }
    }
  }
  console.log(
    `✅ Loaded ${portfolioLayouts.length} portfolio layouts from ${LAYOUT_PATH}.`
  );
} catch (err) {
  console.error(`❌ Failed to load ${LAYOUT_PATH}. Using fallback layouts.`, err);
  portfolioLayouts = [
    {
      number: 1,
      name: "Thẻ Cổ điển",
      description:
        "Tối giản, gọn gàng, trực tiếp. Avatar ở trên, tên và chức danh ở giữa, bio và social links bên dưới.",
    },
    {
      number: 2,
      name: "Header Chuyên nghiệp",
      description:
        "Chuyên nghiệp, trang trọng. Avatar nhỏ góc trên bên trái, tên và chức danh bên phải, bio và social links bên dưới.",
    },
    {
      number: 3,
      name: "Tiêu đề Ưu tiên",
      description:
        "Nhấn mạnh vào tên tuổi hoặc thương hiệu cá nhân trước, sau đó mới đến hình ảnh.",
    },
    {
      number: 4,
      name: "Tiêu điểm Hình ảnh",
      description:
        "Sáng tạo, năng động, gây ấn tượng thị giác mạnh. Avatar rất lớn và nổi bật.",
    },
  ];
}


const COLOR_THEME_PATH = "mausacchude.md";
let colorThemes = [];

try {
  const colorThemeContent = fs.readFileSync(COLOR_THEME_PATH, "utf-8");
  const sections = colorThemeContent
    .split("---")
    .filter((s) => s.trim().length > 0);

  for (const section of sections) {
    const nameMatch = section.match(/##\s*(.*)/);
    if (nameMatch && nameMatch[1]) {
      const name = nameMatch[1].trim().replace(/["']/g, "");
      const descriptionMatch = section.match(/\* \*\*Mô tả:\*\* (.*)/);
      const description =
        descriptionMatch && descriptionMatch[1]
          ? descriptionMatch[1].trim()
          : "";

      if (name && description) {
        const numberMatch = section.match(/##\s*(\d+)\.\s*/);
        const number =
          numberMatch && numberMatch[1]
            ? parseInt(numberMatch[1], 10)
            : colorThemes.length + 1;
        colorThemes.push({ number, name, description });
      }
    }
  }
  console.log(
    `✅ Loaded ${colorThemes.length} color themes from ${COLOR_THEME_PATH}.`
  );
} catch (err) {
  console.error(
    `❌ Failed to load ${COLOR_THEME_PATH}. Using fallback color themes.`,
    err
  );
  colorThemes = [
    { number: 1, name: "Hồng Phấn Cổ điển", description: "Một màu hồng đất đơn sắc, nhẹ nhàng và ấm áp." },
    { number: 2, name: "Xanh Bạc hà", description: "Một màu xanh lá cây nhạt đơn sắc, tươi sáng." },
    { number: 3, name: "Xanh Than Chuyên nghiệp", description: "Một màu xanh than hoặc xám đậm đơn sắc." },
    { number: 4, name: "Gradient Tím-Lục", description: "Chuyển sắc mượt mà từ Tím lavender sang Xanh lá mạ." },
    { number: 5, name: "Gradient Hoàng hôn", description: "Chuyển sắc từ Xanh da trời nhạt xuống Cam đất." },
  ];
}

function sampleStyle(n = 28) {
  const pick = [];
  const used = new Set();
  while (pick.length < Math.min(n, motivationalLines.length)) {
    const i = Math.floor(Math.random() * motivationalLines.length);
    if (!used.has(i)) {
      used.add(i);
      pick.push(motivationalLines[i]);
    }
  }
  return pick.join("\n");
}


function extractJson(text) {
  if (!text) throw new Error("Empty response");

  let cleaned = text
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/g, "")
    .replace(/```/g, "")
    .trim();

  
  cleaned = cleaned.replace(/^\{+/g, "{").replace(/\}+$/g, "}");

  const match = cleaned.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("No JSON block found");

  let jsonStr = match[0];

  try {
    return JSON.parse(jsonStr);
  } catch (e) {
    console.error("JSON parse failed:", e.message);
    console.error("Attempted JSON:", jsonStr);
    throw e;
  }
}

function getResponseText(response) {
  // Nếu response là string → trả luôn (Pass 2)
  if (typeof response === "string") {
    return response.trim();
  }

  const candidate = response.candidates?.[0];
  if (!candidate?.content?.parts?.length) {
    throw new Error("No parts in content");
  }

  let text = "";
  for (const part of candidate.content.parts) {
    if (part.text) text += part.text;
  }

  if (!text.trim()) throw new Error("Empty text in parts");
  return text.trim();
}


const BANNED_TEMPLATES = [/^giữ\s+.*\s+nhỏ\s+mỗi\s+ngày/i, /^giữ\s/i, /nhỏ\s+mỗi\s+ngày/i];
const STOPWORDS = new Set([
  "là", "và", "thì", "mà", "nhưng", "cũng", "của", "cho", "với", "để", "đến", "vẫn", "rồi",
  "một", "những", "các", "đi", "lại", "nữa", "đang", "được", "trên", "trong", "ra", "vào",
  "hôm", "nay", "mai", "bạn", "mình", "ta", "chúng", "tôi", "không", "có", "đó", "này",
  "chẳng", "điều", "thể", "bao", "giờ", "nếu", "khi", "lúc", "cần", "hơn", "đủ", "ít",
  "nữa", "vì", "nhé", "nha", "thôi", "luôn", "rất", "quá", "vẫn",
]);
function isBannedTemplate(s = "") {
  return BANNED_TEMPLATES.some((rx) => rx.test((s || "").toLowerCase()));
}
const THEME_BAD = new Set(["cần", "hơn", "đủ", "ít", "nữa", "vì", "nhé", "nha", "thôi", "luôn", "đang", "rất", "quá"]);
function toWords(s) {
  return (s || "")
    .toLowerCase()
    .normalize("NFC")
    .replace(/[^a-zA-ZÀ-ỹ0-9\s]/g, " ")
    .split(/\s+/)
    .filter(
      (w) => w && !STOPWORDS.has(w) && !THEME_BAD.has(w) && w.length >= 3
    );
}
function pickThemeKeywords(text, k = 3) {
  const counts = new Map();
  for (const w of toWords(text)) {
    counts.set(w, (counts.get(w) || 0) + 1);
  }
  const arr = [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([w]) => w);
  const SAFE_BACKUPS = ["bước", "vibe", "năng lượng", "hành trình", "tâm trạng"];
  const out = arr.slice(0, k);
  while (out.length < k) out.push(SAFE_BACKUPS[out.length % SAFE_BACKUPS.length]);
  return out;
}
const GENERIC_PATTERNS = [/từ từ rồi cũng tới/i, /mọi thứ sẽ ổn/i, /cố lên/i, /đừng.*ngủ quên/i];
function isGeneric(s) {
  if (!s || s.length < 8) return true;
  return GENERIC_PATTERNS.some((rx) => rx.test(s));
}
function overlapRatio(a, b) {
  const A = new Set(toWords(a));
  const B = new Set(toWords(b));
  if (A.size === 0 || B.size === 0) return 0;
  let inter = 0;
  for (const w of A) if (B.has(w)) inter++;
  return inter / Math.min(A.size, B.size);
}
function pickBestPlayful(candidates, quoteMain, theme) {
  const uniq = [...new Set(candidates.map((s) => s.trim()))].filter(Boolean);
  const scored = uniq.map((s) => {
    const lower = s.toLowerCase();
    const hasTheme = theme.some((t) => lower.includes(t.toLowerCase())) ? 3.0 : 0;
    const overlap = overlapRatio(s, quoteMain);
    const length = s.length;
    const hasPunctuation = /[,.!?—]/.test(s) ? 0.3 : 0;
    const tooGeneric = isGeneric(s) ? -3.0 : 0;
    const banned = isBannedTemplate(s) ? -2.0 : 0;

    let score = 0;
    score += hasTheme;
    score += (1 - overlap) * 1.5;
    score += length > 30 ? 0.5 : 0;
    score += hasPunctuation;
    score += tooGeneric;
    score += banned;

    return { s, score };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored[0]?.s || null;
}


const QUOTE_CACHE_KEY = "quote_of_the_day";
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

app.get("/quote-of-the-day", async (req, res) => {
  try {
    const cached = cache.get(QUOTE_CACHE_KEY);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log("Serving /quote-of-the-day from cache.");
      return res.json(cached.data);
    }

    const model = genAI.getGenerativeModel({
      model: MODEL_NAME,
      generationConfig: {
        temperature: 0.75 + Math.random() * 0.1,
        topP: 0.9,
      },
    });

    const prompt =
      'Viết 1 câu động lực và 1 câu vui Gen Z liên quan đến câu động lực đó. Trả JSON: {"quote_main": "...", "playful_line": "..."}';

    const result = await model.generateContent(prompt);
    const raw = getResponseText(result.response);
    const data = extractJson(raw);

    const quoteMain = normalizeLine(data.quote_main).slice(0, 140);
    const playful = normalizeLine(data.playful_line).slice(0, 140);

    const responseData = { quote_main: quoteMain, playful_line: playful };

    cache.set(QUOTE_CACHE_KEY, { data: responseData, timestamp: Date.now() });
    return res.json(responseData);
  } catch (err) {
    const fb =
      motivationalLines[Math.floor(Math.random() * motivationalLines.length)];
    return res.status(500).json({
      quote_main: fb,
      playful_line: "Cứ chill đi!",
      error: "AI đang nghỉ xíu",
    });
  }
});


app.post("/portfolio-suggestions", async (req, res) => {
  try {
    const apiKey = req.headers["x-api-key"];
    if (!apiKey || (process.env.API_KEY && apiKey !== process.env.API_KEY)) {
      console.warn("⚠️ Unauthorized attempt on /portfolio-suggestions");
      return res.status(401).json({ error: "Unauthorized" });
    }

    const userInfo = req.body.userInfo || "Sinh viên chuẩn bị làm portfolio cá nhân";

    
    const model = genAI.getGenerativeModel({
      model: MODEL_NAME,
      generationConfig: {
        temperature: 0.8,       // đa dạng hơn chút
        topP: 0.95
      }
    });

    
    const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

    const layoutsShuffled = shuffle(portfolioLayouts);
    const themesShuffled = shuffle(colorThemes);

    const availableLayouts = layoutsShuffled
      .map(layout => `- Số ${layout.number} - ${layout.name}: ${layout.description}`)
      .join('\n');

    const availableColorThemes = themesShuffled
      .map(theme => `- Số ${theme.number} - ${theme.name}: ${theme.description}`)
      .join('\n');

    const prompt = `
Người dùng: ${userInfo}

Dựa trên thông tin trên, hãy đề xuất:
1) Chọn một chủ đề màu phù hợp nhất từ danh sách sau. Chỉ trả về CHỮ SỐ (ví dụ: 1, 2, 3, 4, 5) của chủ đề màu đã chọn.
${availableColorThemes}

2) Font chữ (1 heading, 1 body).

3) Dựa trên thông tin người dùng, hãy chọn MỘT layout phù hợp nhất từ danh sách sau. Cố gắng đa dạng hóa lựa chọn và không luôn chọn cùng một layout. Trả về số thứ tự, tên của layout đã chọn và giải thích ngắn gọn (1-2 câu) lý do tại sao layout này phù hợp.
${availableLayouts}

4) Bio cá nhân ngắn (1-2 câu), thân thiện.
5) Gợi ý 3 social nên gắn (ví dụ: LinkedIn, GitHub, Behance).

Trả về CHỈ MỘT JSON object, không có markdown:
{
  "palette": ["Số chủ đề màu đã chọn"],
  "fonts": ["Tên font 1", "Tên font 2"],
  "layout": {
    "number": 1,
    "name": "Tên layout đã chọn",
    "explanation": "Giải thích lý do lựa chọn layout này"
  },
  "bio": "Đoạn giới thiệu ngắn",
  "social_suggestions": ["Instagram", "LinkedIn", "Behance"]
}
`.trim();

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    console.log("🔍 Raw response (Portfolio) - FULL:", text);

    
    const data = extractJson(text);
    console.log("🔍 AI Response Data (before post-processing):", JSON.stringify(data, null, 2));

    
    let paletteValue = null;
    if (data.palette) {
      if (Array.isArray(data.palette) && data.palette.length > 0) {
        paletteValue = String(data.palette[0]);
      } else if (typeof data.palette === 'number' || typeof data.palette === 'string') {
        paletteValue = String(data.palette);
      }
    }
    if (paletteValue) {
      const m = paletteValue.match(/\d+/);
      if (m) {
        data.palette = [Math.max(1, Math.min(parseInt(m[0], 10), colorThemes.length))];
      } else {
        data.palette = [1];
        console.warn(`AI returned non-numeric palette: "${paletteValue}". Defaulting to theme 1.`);
      }
    } else {
      data.palette = [1];
      console.warn(`AI returned missing or invalid palette. Defaulting to theme 1.`);
    }

    
    data.allColorThemes = colorThemes.map(({ number, name, description }) => ({ number, name, description }));
    data.allLayouts = portfolioLayouts.map(({ number, name, description }) => ({ number, name, description }));

    return res.json(data);

  } catch (err) {
    console.error("❌ Error generating portfolio suggestions:", err);
    return res.status(500).json({ error: "Failed to generate suggestions" });
  }
});



const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`✅ AI Server running on http://localhost:${PORT}`);
  console.log(`   Using model: ${MODEL_NAME}`);
});
