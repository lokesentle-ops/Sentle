import React, { useEffect, useRef, useState } from "react";
import { Loader2, MessageSquare, Send, Trash2, Volume2, X, Square } from "lucide-react";
import type { Article, ChatMessage, Language } from "../types";
import { postJson } from "../utils/api";
import { VoiceRecorderButton } from "./VoiceRecorderButton";

interface CitizenAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  articles: Article[];
  activeAudioId: string | null;
  ttsLoadingId: string | null;
  onSpeakText: (audioKey: string, text: string) => void;
  onToast: (message: string) => void;
}

const STARTER_PROMPTS_EN = [
  "Summarize the latest official gov.ls documents",
  "Which notices mention tenders or vehicle hire?",
  "Translate the Data Management Policy summary into Sesotho",
];

const STARTER_PROMPTS_ST = [
  "Akaretsa litokomane tsa morao-rao tsa gov.ls",
  "Ke litsebiso life tse buang ka lithendara kapa likoloi?",
  "Hlalosa Leano la Tsamaiso ea Lintlha ka bokhutšoanyane",
];

export const CitizenAssistant: React.FC<CitizenAssistantProps> = ({
  isOpen,
  onClose,
  language,
  articles,
  activeAudioId,
  ttsLoadingId,
  onSpeakText,
  onToast,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<"general" | "fast">("general");
  const [isSending, setIsSending] = useState(false);
  const threadEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      threadEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const sendMessage = async (textOverride?: string) => {
    const content = (textOverride ?? input).trim();
    if (!content || isSending) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      text: content,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    if (!textOverride) setInput("");
    setIsSending(true);

    try {
      const data = await postJson<{ reply: string; modelUsed?: string }>("/api/chat", {
        messages: nextMessages.map((m) => ({ role: m.role, text: m.text })),
        mode,
        language,
        contextArticles: articles
          .filter((a) => !a.status || a.status === "published")
          .map((a) => ({
            title: a.title,
            category: a.category,
            ministry: a.ministry,
            date: a.date,
            summary: a.summary,
            isOfficialDoc: a.isOfficialDoc,
            sourceUrl: a.sourceUrl,
          })),
      });

      const modelMessage: ChatMessage = {
        id: `model-${Date.now()}`,
        role: "model",
        text: data.reply,
        modelUsed: data.modelUsed,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, modelMessage]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Assistant request failed.";
      onToast(msg);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: "model",
          text: msg,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  if (!isOpen) return null;

  const starters = language === "st" ? STARTER_PROMPTS_ST : STARTER_PROMPTS_EN;

  return (
    <aside
      aria-label="Public Information Assistant"
      className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white border-l border-slate-200 shadow-2xl flex flex-col"
    >
      <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between gap-3 bg-[#112a46] text-white">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-[#e9b44c] shrink-0" />
            <h2 className="text-sm font-bold truncate">
              {language === "st"
                ? "Mothusi oa Litaba tsa Sechaba"
                : "Public Information Assistant"}
            </h2>
          </div>
          <p className="text-[11px] text-slate-300 mt-0.5 truncate">
            {language === "st"
              ? "Botsa ka litokomane tsa gov.ls kapa liphatlalatso"
              : "Ask about gov.ls documents, notices, or Sesotho summaries"}
          </p>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {messages.length > 0 && (
            <button
              type="button"
              onClick={() => setMessages([])}
              title="Clear conversation"
              aria-label="Clear conversation"
              className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close assistant"
            className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="px-5 py-2.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between gap-2">
        <span className="text-[11px] font-semibold text-slate-600">Response mode</span>
        <div className="inline-flex rounded-lg bg-slate-200/70 p-0.5">
          <button
            type="button"
            onClick={() => setMode("general")}
            className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              mode === "general"
                ? "bg-white text-[#112a46] shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Standard
          </button>
          <button
            type="button"
            onClick={() => setMode("fast")}
            className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              mode === "fast"
                ? "bg-white text-[#112a46] shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Fast Lookup
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-white">
        {messages.length === 0 ? (
          <div className="space-y-4">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-xs text-slate-700 leading-relaxed">
              <p className="font-bold text-[#112a46] mb-1">
                {language === "st"
                  ? "Lumela! Nka u thusa joang kajeno?"
                  : "Lumela! How can I help you navigate public notices today?"}
              </p>
              <p>
                {language === "st"
                  ? "Ke khona ho akaretsa litokomane tsa gov.ls, ho toloka litsebiso ho ea ho Sesotho, le ho bontša makala a ikarabellang."
                  : "I can summarize official gov.ls records, explain procurement notices, or translate portal stories into Sesotho. Speak into the microphone or type below."}
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-[11px] font-semibold text-slate-500">Suggested questions</p>
              {starters.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => void sendMessage(prompt)}
                  className="w-full text-left rounded-lg border border-slate-200 hover:border-[#1c5d91] hover:bg-slate-50 px-3.5 py-2.5 text-xs font-medium text-slate-700 transition-colors cursor-pointer"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg) => {
            const audioKey = msg.id;
            const isPlaying = activeAudioId === audioKey;
            const isLoading = ttsLoadingId === audioKey;

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[88%] rounded-xl px-4 py-3 text-xs md:text-[13px] leading-relaxed whitespace-pre-wrap ${
                    msg.role === "user"
                      ? "bg-[#112a46] text-white"
                      : "bg-slate-50 border border-slate-200 text-slate-800"
                  }`}
                >
                  {msg.text}
                </div>
                <div className="mt-1 flex items-center gap-2 text-[10px] text-slate-400">
                  <span className="tabular-nums">{msg.timestamp}</span>
                  {msg.role === "model" && (
                    <>
                      <span aria-hidden="true">·</span>
                      <button
                        type="button"
                        onClick={() => onSpeakText(audioKey, msg.text)}
                        disabled={isLoading}
                        className="inline-flex items-center gap-1 text-[#1c5d91] hover:text-[#112a46] font-semibold cursor-pointer"
                      >
                        {isLoading ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : isPlaying ? (
                          <Square className="w-2.5 h-2.5 fill-current" />
                        ) : (
                          <Volume2 className="w-3 h-3" />
                        )}
                        <span>{isPlaying ? "Stop" : "Listen"}</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}

        {isSending && (
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-[#1c5d91]" />
            <span>{language === "st" ? "E ntse e nahana..." : "Searching portal context..."}</span>
          </div>
        )}
        <div ref={threadEndRef} />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void sendMessage();
        }}
        className="p-4 border-t border-slate-200 bg-slate-50 space-y-2.5"
      >
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              language === "st"
                ? "Ngola potso kapa sebelisa maekrofounu..."
                : "Ask a question or dictate with mic..."
            }
            className="flex-1 min-w-0 h-10 rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#1c5d91]"
          />
          <VoiceRecorderButton
            language={language}
            compact
            onTranscript={(transcript) =>
              setInput((prev) => (prev ? `${prev} ${transcript}` : transcript))
            }
            onError={onToast}
          />
          <button
            type="submit"
            disabled={!input.trim() || isSending}
            aria-label="Send message"
            className="h-10 px-3.5 rounded-lg bg-[#1c5d91] hover:bg-[#112a46] text-white text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
        <p className="text-[10px] text-slate-500">
          Verify official legal notices on{" "}
          <a
            href="https://www.gov.ls"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-slate-800"
          >
            gov.ls
          </a>
          .
        </p>
      </form>
    </aside>
  );
};
