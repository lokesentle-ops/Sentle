import React, { useMemo, useState } from "react";
import {
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  Edit3,
  ExternalLink,
  FilePlus2,
  Lock,
  LogOut,
  MessageSquareWarning,
  ShieldCheck,
  Trash2,
  UserPlus,
} from "lucide-react";
import { LESOTHO_DISTRICTS } from "../data/articles";
import type {
  Article,
  ArticleStatus,
  Category,
  DemoUser,
  Language,
  SmsDraft,
  UserSession,
  VisualTone,
} from "../types";

interface PublisherDashboardProps {
  language: Language;
  session: UserSession | null;
  demoUsers: DemoUser[];
  customArticles: Article[];
  smsDrafts: SmsDraft[];
  onLogin: (username: string, password: string) => { ok: boolean; error?: string };
  onLogout: () => void;
  onCreatePublisher: (
    username: string,
    password: string
  ) => { ok: boolean; error?: string };
  onSaveArticle: (article: Article, targetStatus: "draft" | "pending_review") => void;
  onDeleteDraft: (id: number) => void;
  onAdminReview: (
    id: number,
    decision: "published" | "changes_requested",
    reviewNote: string
  ) => void;
  onSaveSmsDraft: (draft: Omit<SmsDraft, "id" | "createdAt" | "createdBy">) => void;
  onViewPublicArticle: (article: Article) => void;
  onToast: (message: string) => void;
}

const CATEGORY_TO_VISUAL: Record<Category, VisualTone> = {
  "Public Notices": "notice",
  Health: "health",
  Education: "education",
  Development: "development",
  "Official Documents": "document",
};

const STATUS_LABEL: Record<ArticleStatus, string> = {
  draft: "Draft",
  pending_review: "Pending review",
  changes_requested: "Changes requested",
  published: "Published",
  rejected: "Rejected",
};

const STATUS_STYLE: Record<ArticleStatus, string> = {
  draft: "text-slate-600",
  pending_review: "text-amber-700",
  changes_requested: "text-red-700",
  published: "text-[#1e6b52]",
  rejected: "text-red-800",
};

export const PublisherDashboard: React.FC<PublisherDashboardProps> = ({
  language,
  session,
  demoUsers,
  customArticles,
  smsDrafts,
  onLogin,
  onLogout,
  onCreatePublisher,
  onSaveArticle,
  onDeleteDraft,
  onAdminReview,
  onSaveSmsDraft,
  onViewPublicArticle,
  onToast,
}) => {
  // Login state
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  // Admin: create publisher
  const [newPubUsername, setNewPubUsername] = useState("");
  const [newPubPassword, setNewPubPassword] = useState("");
  const [createdCredentials, setCreatedCredentials] = useState<{
    username: string;
    password: string;
  } | null>(null);
  const [pubFormError, setPubFormError] = useState("");

  // Admin: review notes map by article id
  const [reviewNotes, setReviewNotes] = useState<Record<number, string>>({});

  // Admin: SMS alert draft composer
  const [smsDistrict, setSmsDistrict] = useState("All districts");
  const [smsTopic, setSmsTopic] = useState("Public Notice");
  const [smsMessage, setSmsMessage] = useState("");

  // Publisher: create/edit article form
  const [editingId, setEditingId] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<Category>("Public Notices");
  const [ministry, setMinistry] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [district, setDistrict] = useState("All districts");
  const [sourceUrl, setSourceUrl] = useState("");
  const [summary, setSummary] = useState("");
  const [body, setBody] = useState("");
  const [showSesothoFields, setShowSesothoFields] = useState(false);
  const [titleSt, setTitleSt] = useState("");
  const [summarySt, setSummarySt] = useState("");
  const [bodySt, setBodySt] = useState("");
  const [articleFormError, setArticleFormError] = useState("");

  // Inline delete confirmation (avoid window.confirm)
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const pendingReviewQueue = useMemo(
    () => customArticles.filter((a) => a.status === "pending_review"),
    [customArticles]
  );

  const myArticles = useMemo(() => {
    if (!session) return [];
    if (session.role === "admin") return customArticles;
    return customArticles.filter((a) => a.author === session.username);
  }, [customArticles, session]);

  const stats = useMemo(() => {
    return {
      total: myArticles.length,
      drafts: myArticles.filter((a) => a.status === "draft").length,
      pending: myArticles.filter((a) => a.status === "pending_review").length,
      published: myArticles.filter((a) => a.status === "published").length,
    };
  }, [myArticles]);

  const resetArticleForm = () => {
    setEditingId(null);
    setTitle("");
    setCategory("Public Notices");
    setMinistry("");
    setDate(new Date().toISOString().slice(0, 10));
    setDistrict("All districts");
    setSourceUrl("");
    setSummary("");
    setBody("");
    setTitleSt("");
    setSummarySt("");
    setBodySt("");
    setArticleFormError("");
    setShowSesothoFields(false);
  };

  const populateForEdit = (article: Article) => {
    setEditingId(article.id);
    setTitle(article.title);
    setCategory(article.category);
    setMinistry(article.ministry);
    setDate(article.date);
    setDistrict(article.district || "All districts");
    setSourceUrl(article.sourceUrl || "");
    setSummary(article.summary);
    setBody(article.body);
    setTitleSt(article.titleSt || "");
    setSummarySt(article.summarySt || "");
    setBodySt(article.bodySt || "");
    setShowSesothoFields(Boolean(article.titleSt || article.summarySt || article.bodySt));
    setArticleFormError("");
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    const result = onLogin(loginUsername.trim(), loginPassword);
    if (!result.ok) {
      setLoginError(result.error || "Invalid credentials.");
    } else {
      setLoginUsername("");
      setLoginPassword("");
    }
  };

  const handleCreatePublisherSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPubFormError("");
    const cleanUser = newPubUsername.trim();
    if (!cleanUser || newPubPassword.length < 6) {
      setPubFormError("Enter a username and a password of at least 6 characters.");
      return;
    }
    const res = onCreatePublisher(cleanUser, newPubPassword);
    if (!res.ok) {
      setPubFormError(res.error || "Could not create publisher account.");
      return;
    }
    setCreatedCredentials({ username: cleanUser, password: newPubPassword });
    setNewPubUsername("");
    setNewPubPassword("");
  };

  const handleArticleSubmit = (targetStatus: "draft" | "pending_review") => {
    setArticleFormError("");
    if (!title.trim() || !ministry.trim() || !summary.trim() || !body.trim()) {
      setArticleFormError(
        "Please fill in Headline, Ministry, Summary, and Full article text."
      );
      return;
    }
    if (sourceUrl.trim() && !/^https?:\/\//i.test(sourceUrl.trim())) {
      setArticleFormError("Official source URL must begin with http:// or https://");
      return;
    }

    const nowIso = new Date().toISOString();
    const existing = editingId ? customArticles.find((a) => a.id === editingId) : null;

    const payload: Article = {
      id: existing ? existing.id : Date.now(),
      title: title.trim(),
      category,
      ministry: ministry.trim(),
      date: date || nowIso.slice(0, 10),
      visual: CATEGORY_TO_VISUAL[category],
      district,
      sourceUrl: sourceUrl.trim() || undefined,
      summary: summary.trim(),
      body: body.trim(),
      titleSt: titleSt.trim() || undefined,
      summarySt: summarySt.trim() || undefined,
      bodySt: bodySt.trim() || undefined,
      isOfficialDoc: false,
      isCustom: true,
      author: existing?.author || session?.username || "publisher",
      status: targetStatus,
      createdAt: existing?.createdAt || nowIso,
      updatedAt: nowIso,
      reviewNote: targetStatus === "pending_review" ? "" : existing?.reviewNote,
    };

    onSaveArticle(payload, targetStatus);
    resetArticleForm();
  };

  const handleSmsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!smsMessage.trim()) {
      onToast("Enter an SMS alert draft message first.");
      return;
    }
    onSaveSmsDraft({
      district: smsDistrict,
      topic: smsTopic,
      message: smsMessage.trim().slice(0, 320),
    });
    setSmsMessage("");
  };

  const copyCredentials = async () => {
    if (!createdCredentials) return;
    const text = `Portal: Government News (Publish Demo)\nUsername: ${createdCredentials.username}\nTemporary password: ${createdCredentials.password}`;
    try {
      await navigator.clipboard.writeText(text);
      onToast("Publisher credentials copied to clipboard.");
    } catch {
      onToast("Copy failed — please note down the credentials manually.");
    }
  };

  return (
    <section
      id="publish"
      className="py-16 md:py-20 bg-[#f5f8fb] border-y border-slate-200"
      aria-labelledby="publish-heading"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-[#1c5d91]">
              {language === "st" ? "Sebaka sa Baphatlalatsi" : "Editorial & Publishing Demo"}
            </p>
            <h2
              id="publish-heading"
              className="text-2xl md:text-3xl font-bold text-[#112a46] mt-1"
            >
              {language === "st"
                ? "Ho ngola, ho hlahloba le ho phatlalatsa litaba"
                : "Publish & editorial review workspace"}
            </h2>
            <p className="text-sm text-slate-600 mt-1.5 max-w-2xl">
              Role-based publishing workflow stored locally in this browser session. Publishers
              create drafts and submit them for Admin verification before appearing on the public
              portal.
            </p>
          </div>

          {session && (
            <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-2.5">
              <div className="text-xs">
                <span className="text-slate-500">Signed in as </span>
                <strong className="text-[#112a46]">{session.username}</strong>
                <span className="text-slate-400 mx-1.5">·</span>
                <span className="font-semibold uppercase text-[11px] text-[#1c5d91]">
                  {session.role}
                </span>
              </div>
              <button
                type="button"
                onClick={onLogout}
                className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 hover:bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-700 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign out</span>
              </button>
            </div>
          )}
        </div>

        {!session ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <form
              onSubmit={handleLoginSubmit}
              className="lg:col-span-6 rounded-xl border border-slate-200 bg-white p-6 md:p-7 space-y-4"
            >
              <div className="flex items-center gap-2 text-[#112a46]">
                <Lock className="w-4 h-4 text-[#1c5d91]" />
                <h3 className="text-lg font-bold">Sign in to publishing workspace</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Authorized ministry information officers and portal administrators sign in below.
                Demo administrator account:{" "}
                <code className="font-mono text-[11px] bg-slate-100 px-1.5 py-0.5 rounded">
                  admin
                </code>{" "}
                /{" "}
                <code className="font-mono text-[11px] bg-slate-100 px-1.5 py-0.5 rounded">
                  Admin123!
                </code>
              </p>

              <div className="space-y-3">
                <div>
                  <label
                    htmlFor="pub-login-user"
                    className="block text-xs font-semibold text-slate-700 mb-1"
                  >
                    Username
                  </label>
                  <input
                    id="pub-login-user"
                    type="text"
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    placeholder="e.g. admin"
                    autoComplete="username"
                    className="w-full h-10 rounded-lg border border-slate-300 px-3 text-sm text-slate-900 focus:outline-none focus:border-[#1c5d91]"
                  />
                </div>
                <div>
                  <label
                    htmlFor="pub-login-pass"
                    className="block text-xs font-semibold text-slate-700 mb-1"
                  >
                    Password
                  </label>
                  <input
                    id="pub-login-pass"
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter password"
                    autoComplete="current-password"
                    className="w-full h-10 rounded-lg border border-slate-300 px-3 text-sm text-slate-900 focus:outline-none focus:border-[#1c5d91]"
                  />
                </div>
              </div>

              {loginError && (
                <p className="text-xs font-semibold text-red-700" role="alert">
                  {loginError}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  type="submit"
                  className="rounded-lg bg-[#112a46] hover:bg-[#1c5d91] text-white px-5 py-2.5 text-xs font-bold transition-colors cursor-pointer"
                >
                  Sign in
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLoginUsername("admin");
                    setLoginPassword("Admin123!");
                    setLoginError("");
                  }}
                  className="rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 px-3.5 py-2.5 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Fill demo admin
                </button>
              </div>
            </form>

            <div className="lg:col-span-6 rounded-xl border border-slate-200 bg-white p-6 md:p-7 space-y-4">
              <div className="flex items-center gap-2 text-[#112a46]">
                <ShieldCheck className="w-4 h-4 text-[#1e6b52]" />
                <h3 className="text-lg font-bold">How editorial verification works</h3>
              </div>
              <ol className="space-y-3 text-xs md:text-[13px] text-slate-600 list-decimal pl-4">
                <li>
                  <strong className="text-slate-800">Admin provisions publisher accounts:</strong>{" "}
                  Only the portal Admin can create publisher logins (currently{" "}
                  <span className="tabular-nums font-semibold">{demoUsers.length}</span>{" "}
                  publisher account{demoUsers.length === 1 ? "" : "s"} created in this browser).
                </li>
                <li>
                  <strong className="text-slate-800">Draft & submit for review:</strong>{" "}
                  Publishers draft notices with optional Sesotho translations and official{" "}
                  <code className="font-mono text-[11px]">gov.ls</code> reference URLs.
                </li>
                <li>
                  <strong className="text-slate-800">Admin approval gate:</strong> Pending
                  submissions enter the Admin Review Queue for approval or change requests before
                  going live in the public feed.
                </li>
                <li>
                  <strong className="text-slate-800">SMS alert drafts (Admin-only):</strong>{" "}
                  Administrators can prepare plain-text district SMS alert drafts for demonstration
                  (no live SMS messages are transmitted).
                </li>
              </ol>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Workspace Stats Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Workspace articles", value: stats.total },
                { label: "Drafts", value: stats.drafts },
                { label: "Pending review", value: stats.pending },
                { label: "Published live", value: stats.published },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-3.5"
                >
                  <p className="text-[11px] font-semibold text-slate-500">{stat.label}</p>
                  <p className="text-2xl font-bold text-[#112a46] tabular-nums mt-0.5">
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>

            {/* ADMIN CONTROLS */}
            {session.role === "admin" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Create Publisher + Review Queue */}
                <div className="lg:col-span-7 space-y-6">
                  {/* Pending Review Queue */}
                  <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-base font-bold text-[#112a46]">
                        Admin Review Queue ({pendingReviewQueue.length})
                      </h3>
                      <span className="text-xs text-slate-500">
                        Approve before public visibility
                      </span>
                    </div>

                    {pendingReviewQueue.length === 0 ? (
                      <p className="text-xs text-slate-500 py-3">
                        No articles are currently awaiting admin review.
                      </p>
                    ) : (
                      <div className="space-y-4">
                        {pendingReviewQueue.map((item) => (
                          <div
                            key={item.id}
                            className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-3"
                          >
                            <div>
                              <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                                <span className="font-semibold text-[#1c5d91]">
                                  {item.category}
                                </span>
                                <span>·</span>
                                <span>{item.ministry}</span>
                                <span>·</span>
                                <span>Author: {item.author}</span>
                                <span>·</span>
                                <span className="tabular-nums">{item.date}</span>
                              </div>
                              <h4 className="text-sm font-bold text-[#112a46] mt-1">
                                {item.title}
                              </h4>
                              <p className="text-xs text-slate-600 mt-1">{item.summary}</p>
                              {item.sourceUrl && (
                                <a
                                  href={item.sourceUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#1c5d91] underline mt-1.5"
                                >
                                  <span>Inspect source URL</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                            </div>

                            <div>
                              <label
                                htmlFor={`review-note-${item.id}`}
                                className="block text-[11px] font-semibold text-slate-600 mb-1"
                              >
                                Review note (optional for approval, helpful when requesting changes)
                              </label>
                              <textarea
                                id={`review-note-${item.id}`}
                                rows={2}
                                value={reviewNotes[item.id] ?? ""}
                                onChange={(e) =>
                                  setReviewNotes((prev) => ({
                                    ...prev,
                                    [item.id]: e.target.value,
                                  }))
                                }
                                placeholder="Add verification feedback for the publisher..."
                                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#1c5d91]"
                              />
                            </div>

                            <div className="flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  onAdminReview(
                                    item.id,
                                    "published",
                                    reviewNotes[item.id] || ""
                                  )
                                }
                                className="inline-flex items-center gap-1.5 rounded-lg bg-[#1e6b52] hover:bg-[#15523e] text-white px-3.5 py-2 text-xs font-bold cursor-pointer"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Approve and publish</span>
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  onAdminReview(
                                    item.id,
                                    "changes_requested",
                                    reviewNotes[item.id] ||
                                      "Please verify ministry dates and source link."
                                  )
                                }
                                className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 px-3.5 py-2 text-xs font-bold cursor-pointer"
                              >
                                <MessageSquareWarning className="w-3.5 h-3.5" />
                                <span>Request changes</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Create Publisher Account */}
                  <form
                    onSubmit={handleCreatePublisherSubmit}
                    className="rounded-xl border border-slate-200 bg-white p-6 space-y-4"
                  >
                    <div className="flex items-center gap-2">
                      <UserPlus className="w-4 h-4 text-[#1c5d91]" />
                      <h3 className="text-base font-bold text-[#112a46]">
                        Create publisher account
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label
                          htmlFor="new-pub-user"
                          className="block text-xs font-semibold text-slate-700 mb-1"
                        >
                          Publisher username
                        </label>
                        <input
                          id="new-pub-user"
                          type="text"
                          value={newPubUsername}
                          onChange={(e) => setNewPubUsername(e.target.value)}
                          placeholder="e.g. health_officer"
                          className="w-full h-10 rounded-lg border border-slate-300 px-3 text-xs text-slate-900 focus:outline-none focus:border-[#1c5d91]"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="new-pub-pass"
                          className="block text-xs font-semibold text-slate-700 mb-1"
                        >
                          Temporary password
                        </label>
                        <input
                          id="new-pub-pass"
                          type="text"
                          value={newPubPassword}
                          onChange={(e) => setNewPubPassword(e.target.value)}
                          placeholder="Min. 6 characters"
                          className="w-full h-10 rounded-lg border border-slate-300 px-3 text-xs text-slate-900 focus:outline-none focus:border-[#1c5d91]"
                        />
                      </div>
                    </div>

                    {pubFormError && (
                      <p className="text-xs font-semibold text-red-700">{pubFormError}</p>
                    )}

                    <button
                      type="submit"
                      className="rounded-lg bg-[#112a46] hover:bg-[#1c5d91] text-white px-4 py-2 text-xs font-bold cursor-pointer"
                    >
                      Create publisher login
                    </button>

                    {createdCredentials && (
                      <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3.5 flex flex-wrap items-center justify-between gap-3">
                        <div className="text-xs text-emerald-950">
                          <p className="font-bold">Publisher account ready (local demo)</p>
                          <p className="font-mono text-[11px] mt-0.5">
                            {createdCredentials.username} / {createdCredentials.password}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={copyCredentials}
                          className="inline-flex items-center gap-1.5 rounded-md border border-emerald-300 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-900 hover:bg-emerald-100 cursor-pointer"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy credentials</span>
                        </button>
                      </div>
                    )}

                    {demoUsers.length > 0 && (
                      <div className="pt-2 border-t border-slate-200">
                        <p className="text-[11px] font-semibold text-slate-500 mb-1.5">
                          Active publisher accounts ({demoUsers.length}):
                        </p>
                        <div className="flex flex-wrap gap-3 text-xs text-slate-700">
                          {demoUsers.map((u) => (
                            <span key={u.username} className="font-mono text-[11px]">
                              {u.username}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </form>
                </div>

                {/* Admin SMS Alert Drafts */}
                <div className="lg:col-span-5 rounded-xl border border-slate-200 bg-white p-6 space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-[#112a46]">
                      Admin SMS Alert Drafts
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Demo-only local drafts for low-bandwidth citizen SMS alerts. No live SMS
                      messages are sent.
                    </p>
                  </div>

                  <form onSubmit={handleSmsSubmit} className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label
                          htmlFor="sms-district"
                          className="block text-xs font-semibold text-slate-700 mb-1"
                        >
                          Target district
                        </label>
                        <select
                          id="sms-district"
                          value={smsDistrict}
                          onChange={(e) => setSmsDistrict(e.target.value)}
                          className="w-full h-9 rounded-lg border border-slate-300 px-2.5 text-xs text-slate-800 bg-white"
                        >
                          <option value="All districts">All districts</option>
                          {LESOTHO_DISTRICTS.map((d) => (
                            <option key={d.name} value={d.name}>
                              {d.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label
                          htmlFor="sms-topic"
                          className="block text-xs font-semibold text-slate-700 mb-1"
                        >
                          Topic
                        </label>
                        <select
                          id="sms-topic"
                          value={smsTopic}
                          onChange={(e) => setSmsTopic(e.target.value)}
                          className="w-full h-9 rounded-lg border border-slate-300 px-2.5 text-xs text-slate-800 bg-white"
                        >
                          <option value="Public Notice">Public Notice</option>
                          <option value="Health Advisory">Health Advisory</option>
                          <option value="Education Update">Education Update</option>
                          <option value="Road & Weather">Road & Weather</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label
                          htmlFor="sms-body"
                          className="text-xs font-semibold text-slate-700"
                        >
                          Alert message
                        </label>
                        <span className="text-[11px] text-slate-500 tabular-nums">
                          {smsMessage.length} / 320
                        </span>
                      </div>
                      <textarea
                        id="sms-body"
                        rows={3}
                        maxLength={320}
                        value={smsMessage}
                        onChange={(e) => setSmsMessage(e.target.value)}
                        placeholder="LESOTHO GOVT: Draft plain-text alert for citizens..."
                        className="w-full rounded-lg border border-slate-300 p-3 text-xs text-slate-900 focus:outline-none focus:border-[#1c5d91]"
                      />
                    </div>

                    <button
                      type="submit"
                      className="rounded-lg bg-[#1c5d91] hover:bg-[#112a46] text-white px-4 py-2 text-xs font-bold cursor-pointer"
                    >
                      Save SMS alert draft
                    </button>
                  </form>

                  <div className="pt-3 border-t border-slate-200 space-y-2.5">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Saved SMS drafts ({smsDrafts.length})
                    </p>
                    {smsDrafts.length === 0 ? (
                      <p className="text-xs text-slate-500">No SMS alert drafts saved yet.</p>
                    ) : (
                      <ul className="space-y-2 max-h-56 overflow-y-auto">
                        {smsDrafts.map((draft) => (
                          <li
                            key={draft.id}
                            className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs"
                          >
                            <div className="flex items-center justify-between gap-2 text-[11px] text-slate-500 mb-1">
                              <span className="font-semibold text-[#112a46]">
                                {draft.district} · {draft.topic}
                              </span>
                              <span className="tabular-nums">
                                {new Date(draft.createdAt).toLocaleDateString("en-GB")}
                              </span>
                            </div>
                            <p className="text-slate-700">{draft.message}</p>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* PUBLISHER & ADMIN ARTICLE COMPOSER + MY ARTICLES */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Create / Edit Article Form */}
              <div className="lg:col-span-7 rounded-xl border border-slate-200 bg-white p-6 space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <FilePlus2 className="w-4 h-4 text-[#1c5d91]" />
                    <h3 className="text-base font-bold text-[#112a46]">
                      {editingId ? "Edit article draft" : "Create government news article"}
                    </h3>
                  </div>
                  {editingId && (
                    <button
                      type="button"
                      onClick={resetArticleForm}
                      className="text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
                    >
                      Cancel editing
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2">
                    <label
                      htmlFor="art-title"
                      className="block text-xs font-semibold text-slate-700 mb-1"
                    >
                      Headline (English) *
                    </label>
                    <input
                      id="art-title"
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Clear public-friendly headline"
                      className="w-full h-10 rounded-lg border border-slate-300 px-3 text-xs text-slate-900 focus:outline-none focus:border-[#1c5d91]"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="art-category"
                      className="block text-xs font-semibold text-slate-700 mb-1"
                    >
                      Category *
                    </label>
                    <select
                      id="art-category"
                      value={category}
                      onChange={(e) => setCategory(e.target.value as Category)}
                      className="w-full h-10 rounded-lg border border-slate-300 px-3 text-xs text-slate-900 bg-white"
                    >
                      <option value="Public Notices">Public Notices</option>
                      <option value="Official Documents">Official Documents</option>
                      <option value="Health">Health</option>
                      <option value="Education">Education</option>
                      <option value="Development">Development</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="art-ministry"
                      className="block text-xs font-semibold text-slate-700 mb-1"
                    >
                      Responsible Ministry / Office *
                    </label>
                    <input
                      id="art-ministry"
                      type="text"
                      value={ministry}
                      onChange={(e) => setMinistry(e.target.value)}
                      placeholder="e.g. Ministry of Health"
                      className="w-full h-10 rounded-lg border border-slate-300 px-3 text-xs text-slate-900 focus:outline-none focus:border-[#1c5d91]"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="art-date"
                      className="block text-xs font-semibold text-slate-700 mb-1"
                    >
                      Publication date
                    </label>
                    <input
                      id="art-date"
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full h-10 rounded-lg border border-slate-300 px-3 text-xs text-slate-900 bg-white"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="art-district"
                      className="block text-xs font-semibold text-slate-700 mb-1"
                    >
                      District scope
                    </label>
                    <select
                      id="art-district"
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="w-full h-10 rounded-lg border border-slate-300 px-3 text-xs text-slate-900 bg-white"
                    >
                      <option value="All districts">All districts</option>
                      {LESOTHO_DISTRICTS.map((d) => (
                        <option key={d.name} value={d.name}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label
                      htmlFor="art-url"
                      className="block text-xs font-semibold text-slate-700 mb-1"
                    >
                      Official source URL (optional)
                    </label>
                    <input
                      id="art-url"
                      type="url"
                      value={sourceUrl}
                      onChange={(e) => setSourceUrl(e.target.value)}
                      placeholder="https://www.gov.ls/..."
                      className="w-full h-10 rounded-lg border border-slate-300 px-3 text-xs text-slate-900 focus:outline-none focus:border-[#1c5d91]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label
                      htmlFor="art-summary"
                      className="block text-xs font-semibold text-slate-700 mb-1"
                    >
                      Plain-language summary *
                    </label>
                    <textarea
                      id="art-summary"
                      rows={2}
                      value={summary}
                      onChange={(e) => setSummary(e.target.value)}
                      placeholder="Brief 1-2 sentence overview for readers"
                      className="w-full rounded-lg border border-slate-300 p-3 text-xs text-slate-900 focus:outline-none focus:border-[#1c5d91]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label
                      htmlFor="art-body"
                      className="block text-xs font-semibold text-slate-700 mb-1"
                    >
                      Full article text *
                    </label>
                    <textarea
                      id="art-body"
                      rows={4}
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      placeholder="Full public notice details, eligibility, deadlines, and contact steps..."
                      className="w-full rounded-lg border border-slate-300 p-3 text-xs text-slate-900 focus:outline-none focus:border-[#1c5d91]"
                    />
                  </div>
                </div>

                {/* Collapsible Sesotho translation fields */}
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3.5">
                  <button
                    type="button"
                    onClick={() => setShowSesothoFields((prev) => !prev)}
                    className="w-full flex items-center justify-between text-xs font-bold text-[#112a46] cursor-pointer"
                  >
                    <span>Optional Sesotho translation fields</span>
                    {showSesothoFields ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>

                  {showSesothoFields && (
                    <div className="mt-3 space-y-3 pt-3 border-t border-slate-200">
                      <div>
                        <label
                          htmlFor="art-title-st"
                          className="block text-xs font-semibold text-slate-700 mb-1"
                        >
                          Sesotho headline
                        </label>
                        <input
                          id="art-title-st"
                          type="text"
                          value={titleSt}
                          onChange={(e) => setTitleSt(e.target.value)}
                          placeholder="Sehlooho ka Sesotho"
                          className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-900"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="art-summary-st"
                          className="block text-xs font-semibold text-slate-700 mb-1"
                        >
                          Sesotho summary
                        </label>
                        <textarea
                          id="art-summary-st"
                          rows={2}
                          value={summarySt}
                          onChange={(e) => setSummarySt(e.target.value)}
                          placeholder="Kakaretso ka Sesotho"
                          className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-900"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="art-body-st"
                          className="block text-xs font-semibold text-slate-700 mb-1"
                        >
                          Sesotho full text
                        </label>
                        <textarea
                          id="art-body-st"
                          rows={3}
                          value={bodySt}
                          onChange={(e) => setBodySt(e.target.value)}
                          placeholder="Litaba tse feletseng ka Sesotho"
                          className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-900"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {articleFormError && (
                  <p className="text-xs font-semibold text-red-700" role="alert">
                    {articleFormError}
                  </p>
                )}

                <div className="flex flex-wrap gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={() => handleArticleSubmit("draft")}
                    className="rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 px-4 py-2.5 text-xs font-bold cursor-pointer"
                  >
                    Save as draft
                  </button>
                  <button
                    type="button"
                    onClick={() => handleArticleSubmit("pending_review")}
                    className="rounded-lg bg-[#1c5d91] hover:bg-[#112a46] text-white px-4 py-2.5 text-xs font-bold cursor-pointer"
                  >
                    Submit for admin review
                  </button>
                </div>
              </div>

              {/* My Articles List + Read-only SMS Drafts for Publishers */}
              <div className="lg:col-span-5 space-y-6">
                <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
                  <h3 className="text-base font-bold text-[#112a46]">
                    {session.role === "admin"
                      ? `All submitted articles (${myArticles.length})`
                      : `My articles (${myArticles.length})`}
                  </h3>

                  {myArticles.length === 0 ? (
                    <p className="text-xs text-slate-500">
                      No custom articles drafted yet. Use the form on the left to create a draft or
                      submit an article for review.
                    </p>
                  ) : (
                    <ul className="divide-y divide-slate-200">
                      {myArticles.map((item) => {
                        const status = item.status || "draft";
                        const canEdit =
                          status === "draft" ||
                          status === "changes_requested" ||
                          session.role === "admin";

                        return (
                          <li key={item.id} className="py-3.5 first:pt-0 last:pb-0 space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-[#112a46] truncate">
                                  {item.title}
                                </p>
                                <p className="text-[11px] text-slate-500 mt-0.5">
                                  <span className={`font-bold ${STATUS_STYLE[status]}`}>
                                    {STATUS_LABEL[status]}
                                  </span>
                                  <span> · </span>
                                  <span>{item.category}</span>
                                  <span> · </span>
                                  <span className="tabular-nums">{item.date}</span>
                                </p>
                              </div>
                            </div>

                            {item.reviewNote && (
                              <p className="text-[11px] rounded-md bg-amber-50 border border-amber-200 px-2.5 py-1.5 text-amber-900">
                                <strong>Admin note:</strong> {item.reviewNote}
                              </p>
                            )}

                            <div className="flex flex-wrap items-center gap-2">
                              {canEdit && (
                                <button
                                  type="button"
                                  onClick={() => populateForEdit(item)}
                                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#1c5d91] hover:text-[#112a46] cursor-pointer"
                                >
                                  <Edit3 className="w-3 h-3" />
                                  <span>Edit</span>
                                </button>
                              )}

                              {status === "published" && (
                                <button
                                  type="button"
                                  onClick={() => onViewPublicArticle(item)}
                                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#1e6b52] hover:underline cursor-pointer"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                  <span>View public article</span>
                                </button>
                              )}

                              {status !== "published" && (
                                <>
                                  {confirmDeleteId === item.id ? (
                                    <span className="inline-flex items-center gap-1.5 text-[11px]">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          onDeleteDraft(item.id);
                                          setConfirmDeleteId(null);
                                        }}
                                        className="font-bold text-red-700 hover:underline cursor-pointer"
                                      >
                                        Confirm delete
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setConfirmDeleteId(null)}
                                        className="text-slate-500 hover:text-slate-800 cursor-pointer"
                                      >
                                        Cancel
                                      </button>
                                    </span>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => setConfirmDeleteId(item.id)}
                                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-red-700 cursor-pointer"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                      <span>Delete</span>
                                    </button>
                                  )}
                                </>
                              )}
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>

                {session.role === "publisher" && (
                  <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-3">
                    <h3 className="text-sm font-bold text-[#112a46]">
                      Admin SMS Alert Drafts (Read-only)
                    </h3>
                    {smsDrafts.length === 0 ? (
                      <p className="text-xs text-slate-500">
                        No admin SMS alert drafts have been prepared yet.
                      </p>
                    ) : (
                      <ul className="space-y-2">
                        {smsDrafts.slice(0, 4).map((draft) => (
                          <li
                            key={draft.id}
                            className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs"
                          >
                            <p className="font-semibold text-[#112a46] text-[11px]">
                              {draft.district} · {draft.topic}
                            </p>
                            <p className="text-slate-600 mt-1">{draft.message}</p>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
