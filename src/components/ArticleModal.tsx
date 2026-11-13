import React, { useEffect } from "react";
import { Bookmark, Check, ExternalLink, Loader2, Share2, Square, Volume2, X } from "lucide-react";
import type { Article, Language } from "../types";
import { getLocalizedArticle } from "../data/articles";

interface ArticleModalProps {
  article: Article | null;
  language: Language;
  isSaved: boolean;
  ttsLoadingId: string | null;
  activeAudioId: string | null;
  onClose: () => void;
  onLanguageChange: (lang: Language) => void;
  onListen: (article: Article) => void;
  onShare: (article: Article) => void;
  onSave: (articleId: number) => void;
}

export const ArticleModal: React.FC<ArticleModalProps> = ({
  article,
  language,
  isSaved,
  ttsLoadingId,
  activeAudioId,
  onClose,
  onLanguageChange,
  onListen,
  onShare,
  onSave,
}) => {
  useEffect(() => {
    if (!article) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [article, onClose]);

  if (!article) return null;

  const localized = getLocalizedArticle(article, language);
  const audioKey = `article-${article.id}`;
  const isPlaying = activeAudioId === audioKey;
  const isLoadingAudio = ttsLoadingId === audioKey;
  const formattedDate = new Date(article.date + "T12:00:00").toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-[2px] p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="article-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-2xl max-h-[88vh] overflow-y-auto rounded-xl bg-white border border-slate-200 shadow-2xl p-6 md:p-9 text-slate-900">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close article"
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center cursor-pointer transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="mb-6 rounded-lg border border-slate-200 bg-slate-50 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <label
              htmlFor="article-modal-language"
              className="block text-xs font-bold text-slate-800"
            >
              {language === "st"
                ? "Puo ea sengoloa / Fetola puo"
                : "Reading language / Switch language"}
            </label>
            <p className="text-xs text-slate-500 mt-0.5">
              {language === "st"
                ? "Fetola lipakeng tsa Senyesemane le Sesotho pele u bala kapa u mamela."
                : "Audio narration and article text adapt to the selected language."}
            </p>
          </div>
          <select
            id="article-modal-language"
            value={language}
            onChange={(e) => onLanguageChange(e.target.value as Language)}
            className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-800 shrink-0"
          >
            <option value="en">English</option>
            <option value="st">Sesotho</option>
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mb-2">
          <span className="font-semibold text-[#1c5d91]">{article.category}</span>
          <span aria-hidden="true">·</span>
          <span className="tabular-nums">{formattedDate}</span>
          <span aria-hidden="true">·</span>
          <span>{article.ministry}</span>
          {article.fileType && article.fileSize && (
            <>
              <span aria-hidden="true">·</span>
              <span className="font-mono text-[11px]">{article.fileType} ({article.fileSize})</span>
            </>
          )}
        </div>

        <h2
          id="article-modal-title"
          className="text-2xl md:text-3xl font-bold text-[#112a46] leading-tight mb-4 [text-wrap:balance]"
        >
          {localized.title}
        </h2>

        {localized.translationMissing && (
          <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-xs text-amber-900">
            Sesotho translation has not been added for this article yet. Showing English text.
          </p>
        )}

        <div className="space-y-4 text-sm md:text-[15px] leading-relaxed text-slate-700 max-w-prose">
          <p className="font-medium text-slate-800">{localized.summary}</p>
          <p>{localized.body}</p>
          <p className="text-xs text-slate-500">
            {language === "st"
              ? "Netefatsa litaba le lekala le ikarabellang pele u li sebelisa kapa u li arolelana."
              : "Readers should verify deadlines and statutory details with the responsible ministry publication."}
          </p>
        </div>

        <div className="mt-6 pt-5 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <a
            href={article.sourceUrl || "https://www.gov.ls/documents/"}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1c5d91] hover:text-[#112a46] underline underline-offset-4"
          >
            <span>
              {article.isOfficialDoc
                ? "Open official document on gov.ls"
                : "Visit Government of Lesotho portal"}
            </span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          {article.isOfficialDoc ? (
            <span className="text-xs font-medium text-[#1e6b52]">
              Official gov.ls document reference
            </span>
          ) : (
            <span className="text-xs text-amber-800">
              Prototype sample story · Not an official notice
            </span>
          )}
        </div>

        <div className="mt-6 flex flex-wrap gap-2.5">
          <button
            type="button"
            onClick={() => onListen(article)}
            disabled={isLoadingAudio}
            className="inline-flex items-center gap-2 rounded-lg bg-[#1c5d91] hover:bg-[#112a46] text-white px-4 py-2.5 text-xs font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-60"
          >
            {isLoadingAudio ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>{language === "st" ? "E lokisa molumo..." : "Generating audio..."}</span>
              </>
            ) : isPlaying ? (
              <>
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>{language === "st" ? "Emisa molumo" : "Stop audio"}</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5" />
                <span>
                  {language === "st" ? "Mamela sengoloa" : "Listen to article"}
                </span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => onShare(article)}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 px-4 py-2.5 text-xs font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{language === "st" ? "Arolelana" : "Share"}</span>
          </button>

          <button
            type="button"
            onClick={() => onSave(article.id)}
            className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-xs font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              isSaved
                ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                : "border-slate-300 bg-white hover:bg-slate-50 text-slate-700"
            }`}
          >
            {isSaved ? <Check className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
            <span>
              {isSaved
                ? language === "st"
                  ? "E bolokiloe"
                  : "Saved"
                : language === "st"
                ? "Boloka sengoloa"
                : "Save article"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
