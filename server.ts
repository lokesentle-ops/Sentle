import "dotenv/config";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI, ThinkingLevel } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT || 3000);

app.use(express.json({ limit: "20mb" }));

function getAiClient(apiVersion?: string) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured in the server environment.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      ...(apiVersion ? { apiVersion } : {}),
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

function formatGeminiError(error: unknown): { status: number; message: string } {
  const err = error as { status?: number; message?: string };
  const rawMsg = err?.message || "An unexpected AI service error occurred.";
  const upstreamStatus = typeof err?.status === "number" ? err.status : 500;
  console.error("[Gemini API Error]", { upstreamStatus, message: rawMsg });

  if (
    rawMsg.includes("free tier is not available") ||
    rawMsg.includes("billing")
  ) {
    return {
      status: 422,
      message:
        "The Gemini API is not enabled for billing/free tier on this Google Cloud project. Select a billing-enabled Gemini API key in Settings > Secrets to activate the AI Assistant, Voice Transcription, and TTS.",
    };
  }

  if (
    upstreamStatus === 403 ||
    rawMsg.includes("PERMISSION_DENIED") ||
    rawMsg.includes("API_KEY_INVALID")
  ) {
    // Return 502 instead of 403 so upstream Cloud Run / AI Studio proxies never intercept the JSON body with an HTML 403 page.
    return {
      status: 502,
      message:
        "Gemini API permission error. Please verify your Gemini API key in Settings > Secrets.",
    };
  }
  if (upstreamStatus === 429 || rawMsg.includes("RESOURCE_EXHAUSTED")) {
    return {
      status: 429,
      message:
        "Rate limit or quota reached for this Gemini model. Please try again shortly or switch to Fast Lookup mode.",
    };
  }
  return { status: upstreamStatus >= 400 && upstreamStatus < 600 ? upstreamStatus : 500, message: rawMsg };
}

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, timestamp: new Date().toISOString() });
});

app.post("/api/chat", async (req, res) => {
  try {
    const {
      messages,
      mode = "general",
      language = "en",
      contextArticles = [],
    } = req.body as {
      messages: Array<{ role: "user" | "model"; text: string }>;
      mode?: "general" | "fast" | "deep";
      language?: "en" | "st";
      contextArticles?: Array<{
        title: string;
        category: string;
        ministry: string;
        date: string;
        summary: string;
        isOfficialDoc?: boolean;
        sourceUrl?: string;
      }>;
    };

    if (!Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({ error: "Please provide at least one message." });
      return;
    }

    const latestMessage = messages[messages.length - 1];
    if (!latestMessage || latestMessage.role !== "user" || !latestMessage.text.trim()) {
      res.status(400).json({ error: "The latest message must be a non-empty user message." });
      return;
    }

    const ai = getAiClient();
    const model = mode === "fast" ? "gemini-3.1-flash-lite" : "gemini-4-hydrogen";

    const portalSnapshot = contextArticles
      .slice(0, 16)
      .map(
        (a, i) =>
          `${i + 1}. [${a.isOfficialDoc ? "Official gov.ls Record" : "Prototype Sample"}] "${a.title}" (${a.category}, ${a.ministry}, ${a.date}) — ${a.summary}${a.sourceUrl ? ` Source: ${a.sourceUrl}` : ""}`
      )
      .join("\n");

    const systemInstruction = [
      "You are the Kingdom of Lesotho Public Information Assistant for the Government News Portal.",
      "Your role is to help citizens, journalists, civil-society researchers, and Basotho living abroad find, understand, and translate government announcements, public notices, tenders, and official documents.",
      "Guidelines:",
      "1. Always clearly distinguish between verified Government of Lesotho records (marked Official gov.ls Record) and illustrative prototype sample stories (marked Prototype Sample). Never present prototype sample stories as confirmed government policy.",
      "2. Respond in clear, plain, accessible language. If the user writes in Sesotho or requests Sesotho (current interface language: " +
        (language === "st" ? "Sesotho" : "English") +
        "), provide helpful bilingual or Sesotho-first answers.",
      "3. Keep responses structured and concise (under 250 words unless detailed analysis is requested).",
      "4. Remind readers when appropriate to verify official deadlines and tenders on https://www.gov.ls or via the Government Contact Centre at (+266) 8001 0100 / contact.centre@gov.ls.",
      portalSnapshot ? `\nCurrent Portal Catalog Context:\n${portalSnapshot}` : "",
    ].join("\n");

    const history = messages.slice(0, -1).map((m) => ({
      role: m.role,
      parts: [{ text: m.text }],
    }));

    const chat = ai.chats.create({
      model,
      history,
      config: {
        systemInstruction,
        ...(model === "gemini-4-hydrogen"
          ? {
              thinkingConfig: {
                thinkingLevel: mode === "deep" ? ThinkingLevel.HIGH : ThinkingLevel.MEDIUM,
              },
            }
          : {}),
      },
    });

    const response = await chat.sendMessage({
      message: latestMessage.text.trim(),
    });

    res.json({
      reply: response.text ?? "I could not generate a response. Please try rephrasing your question.",
      modelUsed: model,
    });
  } catch (error) {
    const formatted = formatGeminiError(error);
    res.status(formatted.status).json({ error: formatted.message });
  }
});

app.post("/api/tts", async (req, res) => {
  try {
    const {
      text,
      language = "en",
      voiceName = "Kore",
    } = req.body as {
      text?: string;
      language?: "en" | "st";
      voiceName?: string;
    };

    if (!text || !text.trim()) {
      res.status(400).json({ error: "Text is required for speech synthesis." });
      return;
    }

    const clippedText = text.trim().slice(0, 3500);
    const ai = getAiClient("v1beta");

    const stylePrompt =
      language === "st"
        ? "Clear, respectful, measured Sesotho public information broadcaster"
        : "Clear, warm, authoritative public service news anchor";

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash-lite-tts",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: clippedText,
              speechMetadata: {
                style: stylePrompt,
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName },
          },
        },
      },
    });

    const part = response.candidates?.[0]?.content?.parts?.[0];
    const base64Audio = part?.inlineData?.data;
    const mimeType = part?.inlineData?.mimeType || "audio/wav";

    if (!base64Audio) {
      res.status(502).json({ error: "No audio data was returned by the TTS service." });
      return;
    }

    res.json({ audioBase64: base64Audio, mimeType });
  } catch (error) {
    const formatted = formatGeminiError(error);
    res.status(formatted.status).json({ error: formatted.message });
  }
});

app.post("/api/transcribe", async (req, res) => {
  try {
    const {
      audioBase64,
      mimeType = "audio/webm",
      languageHint = "en",
    } = req.body as {
      audioBase64?: string;
      mimeType?: string;
      languageHint?: "en" | "st";
    };

    if (!audioBase64) {
      res.status(400).json({ error: "Recorded audio data is required." });
      return;
    }

    const ai = getAiClient();

    const response = await ai.models.generateContent({
      model: "gemini-3.5-transcribe",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType,
              data: audioBase64,
            },
          },
          {
            text:
              languageHint === "st"
                ? "Transcribe this spoken audio accurately. The speaker may speak Sesotho or English. Return only the clean transcription text."
                : "Transcribe this spoken audio accurately. The speaker may speak English or Sesotho. Return only the clean transcription text.",
          },
        ],
      },
    });

    res.json({ transcript: (response.text ?? "").trim() });
  } catch (error) {
    const formatted = formatGeminiError(error);
    res.status(formatted.status).json({ error: formatted.message });
  }
});

app.all("/api/*", (_req, res) => {
  res.status(404).json({ error: "API route not found." });
});

app.use(
  (
    err: unknown,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    if (req.path.startsWith("/api/")) {
      const e = err as { status?: number; type?: string; message?: string };
      const status = typeof e?.status === "number" ? e.status : 400;
      const message =
        e?.type === "entity.too.large"
          ? "Audio recording is too large. Please keep recordings under 60 seconds."
          : e?.message || "Invalid API request.";
      res.status(status).json({ error: message });
      return;
    }
    next(err);
  }
);


async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, "dist");
    app.use(express.static(distDir));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distDir, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Lesotho Government News server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
