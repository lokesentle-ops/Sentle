import React, { useEffect, useMemo, useState } from "react";
import {
  Archive,
  ArrowRight,
  Bookmark,
  BookOpen,
  Building2,
  CheckCircle2,
  ExternalLink,
  FileText,
  Globe,
  HeartPulse,
  Landmark,
  Loader2,
  Mail,
  Menu,
  MessageSquare,
  Phone,
  Search,
  Share2,
  ShieldCheck,
  Square,
  Volume2,
  X,
} from "lucide-react";
import { INITIAL_ARTICLES, UI_COPY, getLocalizedArticle } from "./data/articles";
import type {
  Article,
  Category,
  DemoUser,
  Language,
  SmsDraft,
  UserSession,
} from "./types";
import { audioPlayer } from "./utils/audio";
import { postJson } from "./utils/api";
import { VoiceRecorderButton } from "./components/VoiceRecorderButton";
import { ArticleModal } from "./components/ArticleModal";
import { CitizenAssistant } from "./components/CitizenAssistant";
import { DistrictExplorer } from "./components/DistrictExplorer";
import { PublisherDashboard } from "./components/PublisherDashboard";

const STORAGE_KEYS = {
  articles: "governmentNewsCustomArticles",
  users: "governmentNewsDemoUsers",
  session: "governmentNewsDemoSession",
  sms: "governmentNewsAdminSmsDrafts",
  saved: "savedGovernmentNews",
};

const CATEGORY_FILTERS: Array<{ value: "all" | Category; labelEn: string; labelSt: string }> = [
  { value: "all", labelEn: "All stories", labelSt: "Litaba tsohle" },
  { value: "Public Notices", labelEn: "Public notices", labelSt: "Litsebiso tsa sechaba" },
  { value: "Official Documents", labelEn: "Official documents", labelSt: "Litokomane tsa semmuso" },
  { value: "Health", labelEn: "Health", labelSt: "Bophelo bo botle" },
  { value: "Education", labelEn: "Education", labelSt: "Thuto" },
  { value: "Development", labelEn: "Development", labelSt: "Ntlafatso" },
];

function safeJsonParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export default function App() {
  const [language, setLanguage] = useState<Language>("en");
  const [highContrast, setHighContrast] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Portal catalog & local workflow persistence
  const [customArticles, setCustomArticles] = useState<Article[]>(() =>
    safeJsonParse<Article[]>(localStorage.getItem(STORAGE_KEYS.articles), [])
  );
  const [demoUsers, setDemoUsers] = useState<DemoUser[]>(() =>
    safeJsonParse<DemoUser[]>(localStorage.getItem(STORAGE_KEYS.users), [])
  );
  const [session, setSession] = useState<UserSession | null>(() =>
    safeJsonParse<UserSession | null>(sessionStorage.getItem(STORAGE_KEYS.session), null)
  );
  const [smsDrafts, setSmsDrafts] = useState<SmsDraft[]>(() =>
    safeJsonParse<SmsDraft[]>(localStorage.getItem(STORAGE_KEYS.sms), [])
  );
  const [savedIds, setSavedIds] = useState<number[]>(() =>
    safeJsonParse<number[]>(localStorage.getItem(STORAGE_KEYS.saved), [])
  );

  // Discovery, filter, sort & archive state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<"all" | Category>("all");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [recommendedTopic, setRecommendedTopic] = useState<Category>("Official Documents");

  const [archiveKeyword, setArchiveKeyword] = useState("");
  const [archiveCategory, setArchiveCategory] = useState<"all" | Category>("all");
  const [archiveAfter, setArchiveAfter] = useState("");

  // Modal, assistant, audio & toast state
  const [activeArticle, setActiveArticle] = useState<Article | null>(null);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [activeAudioId, setActiveAudioId] = useState<string | null>(null);
  const [ttsLoadingId, setTtsLoadingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    document.body.classList.toggle("high-contrast", highContrast);
  }, [highContrast]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.articles, JSON.stringify(customArticles));
  }, [customArticles]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(demoUsers));
  }, [demoUsers]);

  useEffect(() => {
    if (session) {
      sessionStorage.setItem(STORAGE_KEYS.session, JSON.stringify(session));
    } else {
      sessionStorage.removeItem(STORAGE_KEYS.session);
    }
  }, [session]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.sms, JSON.stringify(smsDrafts));
  }, [smsDrafts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.saved, JSON.stringify(savedIds));
  }, [savedIds]);

  useEffect(() => {
    return audioPlayer.subscribe(() => {
      setActiveAudioId(audioPlayer.getActiveId());
    });
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    window.setTimeout(() => {
      setToastMessage((curr) => (curr === msg ? null : curr));
    }, 3600);
  };

  // Combine initial records + published custom articles
  const allPublicArticles = useMemo(() => {
    const publishedCustom = customArticles.filter((a) => a.status === "published");
    return [...publishedCustom, ...INITIAL_ARTICLES];
  }, [customArticles]);

  const filteredArticles = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = allPublicArticles.filter((article) => {
      if (selectedCategory !== "all" && article.category !== selectedCategory) return false;
      if (!q) return true;
      const localized = getLocalizedArticle(article, language);
      return (
        localized.title.toLowerCase().includes(q) ||
        localized.summary.toLowerCase().includes(q) ||
        article.ministry.toLowerCase().includes(q) ||
        article.category.toLowerCase().includes(q) ||
        (article.district || "").toLowerCase().includes(q)
      );
    });

    return [...list].sort((a, b) => {
      const diff = new Date(b.date).getTime() - new Date(a.date).getTime();
      return sortOrder === "newest" ? diff : -diff;
    });
  }, [allPublicArticles, selectedCategory, searchQuery, sortOrder, language]);

  const recommendedArticles = useMemo(() => {
    return allPublicArticles
      .filter((a) => a.category === recommendedTopic)
      .slice(0, 3);
  }, [allPublicArticles, recommendedTopic]);

  const archiveResults = useMemo(() => {
    const kw = archiveKeyword.trim().toLowerCase();
    return allPublicArticles
      .filter((article) => {
        if (archiveCategory !== "all" && article.category !== archiveCategory) return false;
        if (archiveAfter && article.date < archiveAfter) return false;
        if (!kw) return true;
        const localized = getLocalizedArticle(article, language);
        return (
          localized.title.toLowerCase().includes(kw) ||
          localized.summary.toLowerCase().includes(kw) ||
          article.ministry.toLowerCase().includes(kw)
        );
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [allPublicArticles, archiveKeyword, archiveCategory, archiveAfter, language]);

  const copy = UI_COPY[language];

  // Gemini TTS playback with browser SpeechSynthesis fallback
  const handleSpeakText = async (audioKey: string, textToRead: string) => {
    if (activeAudioId === audioKey) {
      audioPlayer.stop();
      return;
    }

    audioPlayer.stop();
    setTtsLoadingId(audioKey);

    try {
      const data = await postJson<{ audioBase64: string; mimeType?: string }>("/api/tts", {
        text: textToRead,
        language,
        voiceName: "Kore",
      });
      await audioPlayer.playBase64Audio(audioKey, data.audioBase64, data.mimeType || "audio/wav");
    } catch {
      // Fallback to browser SpeechSynthesis if Gemini TTS is unavailable
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        const utterance = new SpeechSynthesisUtterance(textToRead.slice(0, 1200));
        utterance.lang = language === "st" ? "st-ZA" : "en-ZA";
        utterance.onend = () => setActiveAudioId(null);
        utterance.onerror = () => setActiveAudioId(null);
        setActiveAudioId(audioKey);
        window.speechSynthesis.speak(utterance);
        showToast("Using browser voice fallback for audio playback.");
      } else {
        showToast("Audio narration could not be started.");
      }
    } finally {
      setTtsLoadingId(null);
    }
  };

  const handleListenArticle = (article: Article) => {
    const localized = getLocalizedArticle(article, language);
    const spokenText = `${localized.title}. ${article.ministry}. ${localized.summary} ${localized.body}`;
    void handleSpeakText(`article-${article.id}`, spokenText);
  };

  const handleShareArticle = async (article: Article) => {
    const localized = getLocalizedArticle(article, language);
    const shareUrl = article.sourceUrl || window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: localized.title,
          text: localized.summary,
          url: shareUrl,
        });
        return;
      } catch {
        // User cancelled or share unsupported in iframe -> copy link
      }
    }
    try {
      await navigator.clipboard.writeText(`${localized.title} — ${shareUrl}`);
      showToast(
        language === "st"
          ? "Sehokelo se kopilitsoe!"
          : "Article link copied to clipboard."
      );
    } catch {
      showToast("Could not copy share link.");
    }
  };

  const toggleSaveArticle = (articleId: number) => {
    setSavedIds((prev) => {
      const exists = prev.includes(articleId);
      const next = exists ? prev.filter((id) => id !== articleId) : [...prev, articleId];
      showToast(
        exists
          ? language === "st"
            ? "E tlositsoe ho tse bolokiloeng."
            : "Removed from saved articles."
          : language === "st"
          ? "Sengoloa se bolokiloe."
          : "Article saved for quick access."
      );
      return next;
    });
  };

  // Publishing & Admin workflow handlers
  const handleLogin = (username: string, password: string) => {
    if (username === "admin" && password === "Admin123!") {
      setSession({ username: "admin", role: "admin" });
      showToast("Signed in as Portal Administrator.");
      return { ok: true };
    }
    const found = demoUsers.find(
      (u) => u.username.toLowerCase() === username.toLowerCase() && u.password === password
    );
    if (found) {
      setSession({ username: found.username, role: "publisher" });
      showToast(`Signed in as publisher (${found.username}).`);
      return { ok: true };
    }
    return {
      ok: false,
      error: "Invalid username or password. Use admin / Admin123! or an admin-created publisher.",
    };
  };

  const handleLogout = () => {
    setSession(null);
    showToast("Signed out of publishing workspace.");
  };

  const handleCreatePublisher = (username: string, password: string) => {
    if (username.toLowerCase() === "admin") {
      return { ok: false, error: "Username 'admin' is reserved." };
    }
    if (demoUsers.some((u) => u.username.toLowerCase() === username.toLowerCase())) {
      return { ok: false, error: "A publisher with that username already exists." };
    }
    setDemoUsers((prev) => [
      ...prev,
      { username, password, role: "publisher", createdAt: new Date().toISOString() },
    ]);
    showToast(`Created publisher account: ${username}`);
    return { ok: true };
  };

  const handleSaveCustomArticle = (
    article: Article,
    targetStatus: "draft" | "pending_review"
  ) => {
    setCustomArticles((prev) => {
      const exists = prev.some((a) => a.id === article.id);
      return exists ? prev.map((a) => (a.id === article.id ? article : a)) : [article, ...prev];
    });
    showToast(
      targetStatus === "pending_review"
        ? "Article submitted to Admin Review Queue."
        : "Article saved as draft."
    );
  };

  const handleDeleteDraft = (id: number) => {
    setCustomArticles((prev) => prev.filter((a) => a.id !== id));
    showToast("Draft deleted.");
  };

  const handleAdminReview = (
    id: number,
    decision: "published" | "changes_requested",
    reviewNote: string
  ) => {
    const nowIso = new Date().toISOString();
    setCustomArticles((prev) =>
      prev.map((a) =>
        a.id === id
          ? {
              ...a,
              status: decision,
              reviewNote: reviewNote.trim() || undefined,
              reviewedBy: session?.username || "admin",
              reviewedAt: nowIso,
              updatedAt: nowIso,
            }
          : a
      )
    );
    showToast(
      decision === "published"
        ? "Article approved and published to the public portal."
        : "Changes requested — returned to publisher."
    );
  };

  const handleSaveSmsDraft = (
    draft: Omit<SmsDraft, "id" | "createdAt" | "createdBy">
  ) => {
    const next: SmsDraft = {
      ...draft,
      id: `sms-${Date.now()}`,
      createdBy: session?.username || "admin",
      createdAt: new Date().toISOString(),
    };
    setSmsDrafts((prev) => [next, ...prev]);
    showToast("SMS alert draft saved locally (demo only).");
  };

  const jumpToTopic = (topic: Category) => {
    setSelectedCategory(topic);
    setRecommendedTopic(topic);
    document.getElementById("latest-news")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#1d2c3c]">
      {/* Skip Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-lg focus:bg-[#112a46] focus:text-white focus:px-4 focus:py-2 focus:text-xs focus:font-bold"
      >
        Skip to main content
      </a>

      {/* Thin Institutional Utility Bar */}
      <div className="bg-[#112a46] text-slate-200 border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-10 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 min-w-0 truncate">
            <span className="inline-flex w-3.5 h-2.5 rounded-[2px] overflow-hidden shrink-0 border border-white/25">
              <span className="w-1/3 bg-[#1d4ed8]" />
              <span className="w-1/3 bg-white" />
              <span className="w-1/3 bg-[#15803d]" />
            </span>
            <span className="truncate font-medium">
              {language === "st"
                ? "'Muso oa Lesotho · Sebaka sa Litaba tsa Sechaba"
                : "Kingdom of Lesotho · Public Information Portal"}
            </span>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setHighContrast((prev) => !prev)}
              aria-pressed={highContrast}
              className="rounded px-2 py-1 text-[11px] font-semibold border border-white/25 hover:bg-white/10 transition-colors whitespace-nowrap cursor-pointer"
            >
              {highContrast ? "Standard contrast" : "High contrast"}
            </button>

            <label htmlFor="portal-lang-select" className="sr-only">
              Select language
            </label>
            <select
              id="portal-lang-select"
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              className="h-7 rounded border border-white/25 bg-[#0b1d33] px-2 text-[11px] font-semibold text-white cursor-pointer"
            >
              <option value="en">English</option>
              <option value="st">Sesotho</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3-Zone Sticky Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Brand Wordmark */}
          <a
            href="#top"
            className="flex items-center gap-2.5 shrink-0 text-[#112a46] hover:opacity-90"
          >
            <span className="w-8 h-8 rounded-lg bg-[#112a46] text-white flex items-center justify-center shrink-0">
              <Landmark className="w-4 h-4 text-[#e9b44c]" />
            </span>
            <span className="font-bold text-base tracking-tight whitespace-nowrap">
              Government News
            </span>
          </a>

          {/* Primary Navigation (Desktop) */}
          <nav aria-label="Primary navigation" className="hidden md:flex items-center gap-6">
            <a
              href="#latest-news"
              className="text-xs font-semibold text-slate-600 hover:text-[#112a46] whitespace-nowrap transition-colors"
            >
              {copy.navLatest}
            </a>
            <a
              href="#districts"
              className="text-xs font-semibold text-slate-600 hover:text-[#112a46] whitespace-nowrap transition-colors"
            >
              {copy.navDistricts}
            </a>
            <a
              href="#archive"
              className="text-xs font-semibold text-slate-600 hover:text-[#112a46] whitespace-nowrap transition-colors"
            >
              {copy.navArchive}
            </a>
            <a
              href="#publish"
              className="text-xs font-semibold text-slate-600 hover:text-[#112a46] whitespace-nowrap transition-colors"
            >
              {copy.navPublish}
            </a>
            <a
              href="#about"
              className="text-xs font-semibold text-slate-600 hover:text-[#112a46] whitespace-nowrap transition-colors"
            >
              {copy.navAbout}
            </a>
          </nav>

          {/* Primary CTA + Mobile Toggle */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setIsAssistantOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-[#1c5d91] hover:bg-[#112a46] text-white px-3.5 py-2 text-xs font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>{language === "st" ? "Botsa Mothusi" : "Ask Assistant"}</span>
            </button>

            <button
              type="button"
              onClick={() => setMobileNavOpen((prev) => !prev)}
              aria-label="Toggle navigation menu"
              aria-expanded={mobileNavOpen}
              className="md:hidden p-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              {mobileNavOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileNavOpen && (
          <nav
            aria-label="Mobile navigation"
            className="md:hidden border-t border-slate-200 bg-white px-4 py-3 flex flex-col gap-2"
          >
            {[
              { href: "#latest-news", label: copy.navLatest },
              { href: "#districts", label: copy.navDistricts },
              { href: "#archive", label: copy.navArchive },
              { href: "#publish", label: copy.navPublish },
              { href: "#about", label: copy.navAbout },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMobileNavOpen(false)}
                className="py-2 px-2 rounded-md text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                {item.label}
              </a>
            ))}
          </nav>
        )}
      </header>

      <main id="main-content" className="flex-1">
        {/* Editorial Hero Section */}
        <section
          id="top"
          className="relative bg-gradient-to-b from-[#eaf4fb] via-[#f5f8fb] to-white border-b border-slate-200 py-12 md:py-16"
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            {/* Hero Copy & Search */}
            <div className="lg:col-span-7 space-y-5">
              <p className="text-[11px] font-bold tracking-[0.16em] uppercase text-[#1c5d91]">
                {copy.heroEyebrow}
              </p>

              <h1 className="text-3xl sm:text-4xl md:text-[44px] font-extrabold text-[#112a46] leading-[1.1] tracking-tight [text-wrap:balance]">
                {copy.heroTitleLead}
                <span className="text-[#1c5d91]">{copy.heroTitleEm}</span>
              </h1>

              <p className="text-sm md:text-[15px] text-slate-600 leading-relaxed max-w-2xl">
                {copy.heroSubtitle}
              </p>

              {/* Main Search Form + Voice Transcription */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  document.getElementById("latest-news")?.scrollIntoView({ behavior: "smooth" });
                }}
                className="rounded-xl border border-slate-300 bg-white p-2 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center gap-2"
              >
                <div className="flex-1 flex items-center gap-2 px-2">
                  <Search className="w-4 h-4 text-slate-400 shrink-0" />
                  <label htmlFor="hero-search-input" className="sr-only">
                    Search government news
                  </label>
                  <input
                    id="hero-search-input"
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={copy.searchPlaceholder}
                    className="w-full h-9 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      aria-label="Clear search"
                      className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <VoiceRecorderButton
                    language={language}
                    onTranscript={(transcript) => {
                      setSearchQuery(transcript);
                      document
                        .getElementById("latest-news")
                        ?.scrollIntoView({ behavior: "smooth" });
                    }}
                    onError={showToast}
                  />
                  <button
                    type="submit"
                    className="h-10 rounded-lg bg-[#112a46] hover:bg-[#1c5d91] text-white px-4 text-xs font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    {copy.searchButton}
                  </button>
                </div>
              </form>

              {/* Quick Topic Keywords */}
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
                <span className="font-semibold text-slate-500">
                  {language === "st" ? "Lihlooho tse tsebahalang:" : "Quick searches:"}
                </span>
                {["gov.ls", "Data Management", "Vehicle Hire", "Roads", "Education"].map(
                  (keyword) => (
                    <button
                      key={keyword}
                      type="button"
                      onClick={() => {
                        setSearchQuery(keyword === "gov.ls" ? "" : keyword);
                        if (keyword === "gov.ls") {
                          setSelectedCategory("Official Documents");
                        }
                        document
                          .getElementById("latest-news")
                          ?.scrollIntoView({ behavior: "smooth" });
                      }}
                      className="rounded-md border border-slate-200 bg-white hover:border-[#1c5d91] hover:text-[#1c5d91] px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer"
                    >
                      {keyword}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Bespoke Institutional Gazette Visual */}
            <div className="lg:col-span-5">
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
                <div className="flex items-center justify-between gap-3 border-b border-slate-200 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#eaf4fb] border border-[#cde1f0] flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5 text-[#1c5d91]" />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-[#1c5d91]">
                        Verified Repository Link
                      </p>
                      <h2 className="text-sm font-bold text-[#112a46]">
                        Official gov.ls Documents & Notices
                      </h2>
                    </div>
                  </div>
                  <span className="font-mono text-xs font-bold text-slate-500 tabular-nums">
                    7 records
                  </span>
                </div>

                <ul className="divide-y divide-slate-200">
                  {INITIAL_ARTICLES.filter((a) => a.isOfficialDoc)
                    .slice(0, 3)
                    .map((doc) => {
                      const loc = getLocalizedArticle(doc, language);
                      return (
                        <li key={doc.id} className="py-3 first:pt-0 last:pb-0">
                          <button
                            type="button"
                            onClick={() => setActiveArticle(doc)}
                            className="w-full text-left group cursor-pointer"
                          >
                            <p className="text-xs font-bold text-[#112a46] group-hover:text-[#1c5d91] line-clamp-1">
                              {loc.title}
                            </p>
                            <p className="text-[11px] text-slate-500 mt-1 flex flex-wrap items-center gap-1.5">
                              <span>{doc.fileType || "Release"}</span>
                              {doc.fileSize && (
                                <>
                                  <span>·</span>
                                  <span className="font-mono">{doc.fileSize}</span>
                                </>
                              )}
                              <span>·</span>
                              <span className="tabular-nums">{doc.date}</span>
                            </p>
                          </button>
                        </li>
                      );
                    })}
                </ul>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between gap-3 text-xs">
                  <button
                    type="button"
                    onClick={() => jumpToTopic("Official Documents")}
                    className="font-bold text-[#1c5d91] hover:text-[#112a46] inline-flex items-center gap-1 cursor-pointer"
                  >
                    <span>View all official records</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <a
                    href="https://www.gov.ls/documents/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-500 hover:text-slate-800 inline-flex items-center gap-1 font-medium"
                  >
                    <span>gov.ls/documents</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Access Strip */}
        <section className="py-8 border-b border-slate-200 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="#latest-news"
              className="rounded-xl border border-slate-200 hover:border-[#1c5d91] p-5 flex items-start gap-4 transition-colors"
            >
              <BookOpen className="w-5 h-5 text-[#1c5d91] shrink-0 mt-0.5" />
              <div>
                <h2 className="text-sm font-bold text-[#112a46]">
                  {language === "st" ? "Litaba tsa morao-rao" : "Latest updates"}
                </h2>
                <p className="text-xs text-slate-600 mt-1">
                  Read individual stories, procurement tenders, and ministry announcements.
                </p>
              </div>
            </a>

            <a
              href="#archive"
              className="rounded-xl border border-slate-200 hover:border-[#1c5d91] p-5 flex items-start gap-4 transition-colors"
            >
              <Archive className="w-5 h-5 text-[#1c5d91] shrink-0 mt-0.5" />
              <div>
                <h2 className="text-sm font-bold text-[#112a46]">
                  {language === "st" ? "Polokelo ea litaba" : "News archive"}
                </h2>
                <p className="text-xs text-slate-600 mt-1">
                  Search historical publications by keyword, ministry topic, and date.
                </p>
              </div>
            </a>

            <a
              href="#districts"
              className="rounded-xl border border-slate-200 hover:border-[#1c5d91] p-5 flex items-start gap-4 transition-colors"
            >
              <Globe className="w-5 h-5 text-[#1c5d91] shrink-0 mt-0.5" />
              <div>
                <h2 className="text-sm font-bold text-[#112a46]">
                  {language === "st" ? "Litereke le litaba" : "Districts & topics"}
                </h2>
                <p className="text-xs text-slate-600 mt-1">
                  Explore notices tailored across all 10 districts of Lesotho.
                </p>
              </div>
            </a>
          </div>
        </section>

        {/* Latest News & Official Documents Grid */}
        <section
          id="latest-news"
          className="py-14 md:py-18 bg-white"
          aria-labelledby="latest-heading"
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-7">
              <div>
                <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-[#1c5d91]">
                  {copy.latestEyebrow}
                </p>
                <h2
                  id="latest-heading"
                  className="text-2xl md:text-3xl font-bold text-[#112a46] mt-1"
                >
                  {copy.latestTitle}
                </h2>
                <p className="text-sm text-slate-600 mt-1 max-w-2xl">{copy.latestSubtitle}</p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <label htmlFor="sort-order" className="text-xs font-semibold text-slate-500">
                  Sort:
                </label>
                <select
                  id="sort-order"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as "newest" | "oldest")}
                  className="h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-800"
                >
                  <option value="newest">Newest first</option>
                  <option value="oldest">Oldest first</option>
                </select>
              </div>
            </div>

            {/* Category Filter Tabs */}
            <div
              className="flex flex-wrap gap-2 mb-8"
              role="tablist"
              aria-label="Filter news by category"
            >
              {CATEGORY_FILTERS.map((cat) => {
                const isActive = selectedCategory === cat.value;
                return (
                  <button
                    key={cat.value}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setSelectedCategory(cat.value)}
                    className={`rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer border ${
                      isActive
                        ? "bg-[#112a46] text-white border-[#112a46]"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {language === "st" ? cat.labelSt : cat.labelEn}
                  </button>
                );
              })}
            </div>

            {filteredArticles.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-10 text-center space-y-3">
                <p className="text-sm font-bold text-[#112a46]">
                  No stories matched "{searchQuery}"
                </p>
                <p className="text-xs text-slate-600">
                  Try clearing your search or switching back to All stories.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("all");
                  }}
                  className="rounded-lg bg-[#112a46] text-white px-4 py-2 text-xs font-bold cursor-pointer"
                >
                  Reset filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredArticles.map((article) => {
                  const localized = getLocalizedArticle(article, language);
                  const audioKey = `article-${article.id}`;
                  const isPlaying = activeAudioId === audioKey;
                  const isLoadingAudio = ttsLoadingId === audioKey;
                  const isSaved = savedIds.includes(article.id);
                  const formattedDate = new Date(article.date + "T12:00:00").toLocaleDateString(
                    "en-GB",
                    {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    }
                  );

                  return (
                    <article
                      key={article.id}
                      className="rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors p-6 flex flex-col justify-between gap-5"
                    >
                      <div className="space-y-2.5">
                        {/* Unboxed Typographic Metadata (zero-pill discipline) */}
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-slate-500">
                          <span className="font-bold text-[#1c5d91]">{article.category}</span>
                          <span aria-hidden="true">·</span>
                          <span className="tabular-nums">{formattedDate}</span>
                          {article.fileSize && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="font-mono">
                                {article.fileType} {article.fileSize}
                              </span>
                            </>
                          )}
                        </div>

                        <h3 className="text-base font-bold text-[#112a46] leading-snug">
                          {localized.title}
                        </h3>

                        <p className="text-xs text-slate-500 font-medium">{article.ministry}</p>

                        <p className="text-xs md:text-[13px] text-slate-600 leading-relaxed line-clamp-3">
                          {localized.summary}
                        </p>
                      </div>

                      <div className="space-y-3 pt-3 border-t border-slate-200">
                        <div className="flex items-center justify-between text-[11px]">
                          <span
                            className={`font-semibold ${
                              article.isOfficialDoc ? "text-[#1e6b52]" : "text-amber-800"
                            }`}
                          >
                            {article.isOfficialDoc
                              ? "Official gov.ls record"
                              : article.isCustom
                              ? "Community / Demo Release"
                              : "Prototype sample story"}
                          </span>
                          <button
                            type="button"
                            onClick={() => toggleSaveArticle(article.id)}
                            aria-label={isSaved ? "Remove bookmark" : "Save article"}
                            className={`inline-flex items-center gap-1 font-semibold cursor-pointer ${
                              isSaved ? "text-[#1e6b52]" : "text-slate-500 hover:text-slate-800"
                            }`}
                          >
                            <Bookmark className={`w-3.5 h-3.5 ${isSaved ? "fill-current" : ""}`} />
                            <span>{isSaved ? "Saved" : "Save"}</span>
                          </button>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setActiveArticle(article)}
                            className="rounded-lg bg-[#112a46] hover:bg-[#1c5d91] text-white px-3.5 py-2 text-xs font-bold transition-colors whitespace-nowrap cursor-pointer"
                          >
                            {copy.readArticle}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleListenArticle(article)}
                            disabled={isLoadingAudio}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 px-3 py-2 text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer disabled:opacity-60"
                          >
                            {isLoadingAudio ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : isPlaying ? (
                              <Square className="w-3 h-3 fill-current" />
                            ) : (
                              <Volume2 className="w-3.5 h-3.5" />
                            )}
                            <span>{isPlaying ? copy.stop : copy.listen}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => void handleShareArticle(article)}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 px-2.5 py-2 text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                            <span>{copy.share}</span>
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* District Explorer & Personalized Recommendations */}
        <section
          id="districts"
          className="py-14 md:py-18 bg-[#f5f8fb] border-y border-slate-200"
          aria-labelledby="districts-heading"
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
            <div className="max-w-2xl">
              <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-[#1c5d91]">
                {language === "st" ? "Lisebelisoa tsa Phihlello" : "Access Tools"}
              </p>
              <h2
                id="districts-heading"
                className="text-2xl md:text-3xl font-bold text-[#112a46] mt-1"
              >
                {language === "st"
                  ? "Litaba ho ea ka litereke le lihlooho"
                  : "Find notices by district and interest"}
              </h2>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
              <div className="xl:col-span-8">
                <DistrictExplorer
                  language={language}
                  articles={allPublicArticles}
                  onSelectArticle={(article) => setActiveArticle(article)}
                />
              </div>

              {/* Topic-based Recommendations */}
              <div className="xl:col-span-4 rounded-xl border border-slate-200 bg-white p-6 space-y-4">
                <div>
                  <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-[#1c5d91]">
                    Recommended for you
                  </p>
                  <h3 className="text-lg font-bold text-[#112a46] mt-1">
                    Topic quick-pick
                  </h3>
                  <p className="text-xs text-slate-600 mt-1">
                    Choose a public-service area to surface matching announcements immediately.
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="rec-topic-select"
                    className="block text-xs font-semibold text-slate-700 mb-1"
                  >
                    Select topic
                  </label>
                  <select
                    id="rec-topic-select"
                    value={recommendedTopic}
                    onChange={(e) => setRecommendedTopic(e.target.value as Category)}
                    className="w-full h-10 rounded-lg border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-800"
                  >
                    <option value="Official Documents">Official Documents</option>
                    <option value="Public Notices">Public Notices</option>
                    <option value="Health">Health</option>
                    <option value="Education">Education</option>
                    <option value="Development">Development</option>
                  </select>
                </div>

                <ul className="divide-y divide-slate-200">
                  {recommendedArticles.map((rec) => {
                    const loc = getLocalizedArticle(rec, language);
                    return (
                      <li key={rec.id} className="py-3 first:pt-0 last:pb-0">
                        <button
                          type="button"
                          onClick={() => setActiveArticle(rec)}
                          className="w-full text-left group cursor-pointer"
                        >
                          <p className="text-xs font-bold text-[#112a46] group-hover:text-[#1c5d91]">
                            {loc.title}
                          </p>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {rec.ministry} · <span className="tabular-nums">{rec.date}</span>
                          </p>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Verification Trust Band + Topic Cards */}
        <section className="py-14 bg-white border-b border-slate-200">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-12">
            <div className="rounded-xl border border-slate-200 bg-[#eaf4fb]/60 p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-start gap-4 max-w-2xl">
                <CheckCircle2 className="w-6 h-6 text-[#1e6b52] shrink-0 mt-0.5" />
                <div>
                  <h2 className="text-lg font-bold text-[#112a46]">
                    {language === "st"
                      ? "Tšepo le Netefatso ea Litaba"
                      : "Transparent distinction between official records and prototype samples"}
                  </h2>
                  <p className="text-xs md:text-sm text-slate-700 mt-1 leading-relaxed">
                    Every verified record carries a direct source link to{" "}
                    <code className="font-mono text-xs">gov.ls</code>, publication date, and
                    responsible ministry. Sample articles are clearly marked so citizens never
                    confuse prototype demonstrations with official law.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAssistantOpen(true)}
                className="rounded-lg bg-[#112a46] hover:bg-[#1c5d91] text-white px-4 py-2.5 text-xs font-bold whitespace-nowrap shrink-0 cursor-pointer"
              >
                Ask Assistant to verify
              </button>
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#112a46] mb-5">Browse news topics</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  {
                    topic: "Public Notices" as Category,
                    icon: ShieldCheck,
                    desc: "Procurement tenders, consultation schedules, and government statements.",
                  },
                  {
                    topic: "Health" as Category,
                    icon: HeartPulse,
                    desc: "Public clinic advisories, district health updates, and community care.",
                  },
                  {
                    topic: "Education" as Category,
                    icon: BookOpen,
                    desc: "School initiatives, scholarship support, and vocational skills notices.",
                  },
                  {
                    topic: "Development" as Category,
                    icon: Building2,
                    desc: "Inter-district roads, data governance policies, and rural programmes.",
                  },
                ].map((card) => {
                  const Icon = card.icon;
                  return (
                    <button
                      key={card.topic}
                      type="button"
                      onClick={() => jumpToTopic(card.topic)}
                      className="text-left rounded-xl border border-slate-200 hover:border-[#1c5d91] bg-white p-5 transition-colors cursor-pointer group"
                    >
                      <Icon className="w-5 h-5 text-[#1c5d91] mb-3" />
                      <h3 className="text-sm font-bold text-[#112a46] group-hover:text-[#1c5d91]">
                        {card.topic}
                      </h3>
                      <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{card.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* News Archive Search Section */}
        <section id="archive" className="py-14 md:py-16 bg-white" aria-labelledby="archive-heading">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-6">
            <div>
              <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-[#1c5d91]">
                Historical Lookup
              </p>
              <h2
                id="archive-heading"
                className="text-2xl md:text-3xl font-bold text-[#112a46] mt-1"
              >
                {language === "st" ? "Polokelo ea litaba tsa khale" : "News archive search"}
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                Filter past announcements and downloadable documents by keyword, topic, or date.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label
                  htmlFor="archive-keyword"
                  className="block text-xs font-semibold text-slate-700 mb-1"
                >
                  Keyword
                </label>
                <input
                  id="archive-keyword"
                  type="text"
                  value={archiveKeyword}
                  onChange={(e) => setArchiveKeyword(e.target.value)}
                  placeholder="e.g. policy, tender, roads..."
                  className="w-full h-10 rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-900"
                />
              </div>

              <div>
                <label
                  htmlFor="archive-topic"
                  className="block text-xs font-semibold text-slate-700 mb-1"
                >
                  Topic
                </label>
                <select
                  id="archive-topic"
                  value={archiveCategory}
                  onChange={(e) => setArchiveCategory(e.target.value as "all" | Category)}
                  className="w-full h-10 rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-900"
                >
                  <option value="all">All topics</option>
                  <option value="Official Documents">Official Documents</option>
                  <option value="Public Notices">Public Notices</option>
                  <option value="Health">Health</option>
                  <option value="Education">Education</option>
                  <option value="Development">Development</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="archive-after"
                  className="block text-xs font-semibold text-slate-700 mb-1"
                >
                  Published on or after
                </label>
                <input
                  id="archive-after"
                  type="date"
                  value={archiveAfter}
                  onChange={(e) => setArchiveAfter(e.target.value)}
                  className="w-full h-10 rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-900"
                />
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white divide-y divide-slate-200">
              {archiveResults.length === 0 ? (
                <p className="p-6 text-xs text-slate-500">
                  No archived publications match those filters.
                </p>
              ) : (
                archiveResults.map((item) => {
                  const loc = getLocalizedArticle(item, language);
                  return (
                    <div
                      key={item.id}
                      className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[#112a46]">{loc.title}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          <span>{item.category}</span>
                          <span> · </span>
                          <span>{item.ministry}</span>
                          <span> · </span>
                          <span className="tabular-nums">{item.date}</span>
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveArticle(item)}
                        className="text-xs font-bold text-[#1c5d91] hover:text-[#112a46] whitespace-nowrap self-start sm:self-center cursor-pointer"
                      >
                        Open record →
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </section>

        {/* Publisher & Admin Workspace */}
        <PublisherDashboard
          language={language}
          session={session}
          demoUsers={demoUsers}
          customArticles={customArticles}
          smsDrafts={smsDrafts}
          onLogin={handleLogin}
          onLogout={handleLogout}
          onCreatePublisher={handleCreatePublisher}
          onSaveArticle={handleSaveCustomArticle}
          onDeleteDraft={handleDeleteDraft}
          onAdminReview={handleAdminReview}
          onSaveSmsDraft={handleSaveSmsDraft}
          onViewPublicArticle={(article) => setActiveArticle(article)}
          onToast={showToast}
        />

        {/* About & Official Contact Section */}
        <section id="about" className="py-14 bg-white" aria-labelledby="about-heading">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            <div className="md:col-span-7 space-y-3">
              <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-[#1c5d91]">
                About This Portal
              </p>
              <h2 id="about-heading" className="text-2xl font-bold text-[#112a46]">
                Making Lesotho government notices easier to find and listen to
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                This portal organises official{" "}
                <a
                  href="https://www.gov.ls/documents/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#1c5d91] underline font-semibold"
                >
                  gov.ls
                </a>{" "}
                publications alongside bilingual English/Sesotho navigation, voice search
                transcription, AI audio narration, and an interactive civic assistant. Note that
                the publishing dashboard and SMS alert drafts operate locally in your browser as a
                demonstration workflow.
              </p>
            </div>

            <div className="md:col-span-5 rounded-xl border border-slate-200 bg-slate-50 p-6 space-y-3">
              <h3 className="text-sm font-bold text-[#112a46]">
                Official Government Contact Centre
              </h3>
              <div className="space-y-2 text-xs text-slate-700">
                <p className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[#1c5d91] shrink-0" />
                  <span className="tabular-nums font-semibold">(+266) 8001 0100</span>
                </p>
                <p className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#1c5d91] shrink-0" />
                  <a
                    href="mailto:contact.centre@gov.ls"
                    className="underline hover:text-[#112a46]"
                  >
                    contact.centre@gov.ls
                  </a>
                </p>
                <p className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-[#1c5d91] shrink-0" />
                  <a
                    href="https://www.gov.ls"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-[#112a46]"
                  >
                    https://www.gov.ls
                  </a>
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#112a46] text-slate-300 border-t border-white/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
          <div>
            <p className="font-bold text-white">© 2026 Public Access to Government News</p>
            <p className="text-slate-400 mt-0.5">
              Kingdom of Lesotho Public Information Portal · Bilingual English & Sesotho
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-slate-300">
            <span className="tabular-nums">(+266) 8001 0100</span>
            <span aria-hidden="true">·</span>
            <a href="mailto:contact.centre@gov.ls" className="hover:text-white underline">
              contact.centre@gov.ls
            </a>
          </div>
        </div>
      </footer>

      {/* Article Reader Modal */}
      <ArticleModal
        article={activeArticle}
        language={language}
        isSaved={activeArticle ? savedIds.includes(activeArticle.id) : false}
        ttsLoadingId={ttsLoadingId}
        activeAudioId={activeAudioId}
        onClose={() => setActiveArticle(null)}
        onLanguageChange={setLanguage}
        onListen={handleListenArticle}
        onShare={(article) => void handleShareArticle(article)}
        onSave={toggleSaveArticle}
      />

      {/* Multi-turn Gemini Citizen Assistant Drawer */}
      <CitizenAssistant
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
        language={language}
        articles={allPublicArticles}
        activeAudioId={activeAudioId}
        ttsLoadingId={ttsLoadingId}
        onSpeakText={(audioKey, text) => void handleSpeakText(audioKey, text)}
        onToast={showToast}
      />

      {/* Non-intrusive Toast */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 rounded-lg bg-[#112a46] text-white px-4 py-2.5 text-xs font-semibold shadow-xl border border-white/15"
        >
          {toastMessage}
        </div>
      )}
    </div>
  );
}
