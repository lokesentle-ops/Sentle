import React, { useRef, useState } from 'react';
import {
  AdminSmsDraft,
  Article,
  ArticleCategory,
  ArticleStatus,
  ArticleVisual,
  DemoSession,
  DemoUser,
} from '../types';
import { DEPARTMENT_IMAGES, DISTRICTS, LESOTHO_MINISTRIES } from '../data/articles';

const DEMO_USERS_KEY = 'governmentNewsDemoUsers';
const DEMO_SESSION_KEY = 'governmentNewsDemoSession';
const ADMIN_SMS_KEY = 'governmentNewsAdminSmsDrafts';

function readDemoUsers(): DemoUser[] {
  try {
    return JSON.parse(localStorage.getItem(DEMO_USERS_KEY) || '[]');
  } catch {
    return [];
  }
}

function readDemoSession(): DemoSession | null {
  try {
    return JSON.parse(sessionStorage.getItem(DEMO_SESSION_KEY) || 'null');
  } catch {
    return null;
  }
}

function readSmsDrafts(): AdminSmsDraft[] {
  try {
    return JSON.parse(localStorage.getItem(ADMIN_SMS_KEY) || '[]');
  } catch {
    return [];
  }
}

function statusLabel(status?: ArticleStatus): string {
  const map: Record<ArticleStatus, string> = {
    draft: 'Draft',
    pending_review: 'Pending review',
    changes_requested: 'Changes requested',
    published: 'Published',
    rejected: 'Not approved',
  };
  return map[status || 'published'] || 'Draft';
}

interface PublisherDashboardProps {
  customArticles: Article[];
  onSaveCustomArticles: (items: Article[]) => void;
  onOpenArticle: (article: Article) => void;
  onShowToast: (message: string) => void;
}

export const PublisherDashboard: React.FC<PublisherDashboardProps> = ({
  customArticles,
  onSaveCustomArticles,
  onOpenArticle,
  onShowToast,
}) => {
  const [session, setSession] = useState<DemoSession | null>(() => readDemoSession());
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginMessage, setLoginMessage] = useState('');

  // Admin: create publisher
  const [newPubUser, setNewPubUser] = useState('');
  const [newPubPass, setNewPubPass] = useState('');
  const [createdCredentials, setCreatedCredentials] = useState<{
    username: string;
    password: string;
  } | null>(null);

  // Admin: review notes keyed by article ID
  const [reviewNotes, setReviewNotes] = useState<Record<number, string>>({});

  // Admin: SMS alert drafts
  const [smsDrafts, setSmsDrafts] = useState<AdminSmsDraft[]>(() => readSmsDrafts());
  const [smsDistrict, setSmsDistrict] = useState('All districts');
  const [smsTopic, setSmsTopic] = useState('Public Notices');
  const [smsMessage, setSmsMessage] = useState('');
  const [smsResult, setSmsResult] = useState('');

  // Publisher: delete draft inline confirmation (avoids window.confirm)
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  // Publisher: article editor
  const todayStr = new Date().toISOString().slice(0, 10);
  const editorRef = useRef<HTMLFormElement>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ArticleCategory>('Public Notices');
  const [date, setDate] = useState(todayStr);
  const [ministry, setMinistry] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [summary, setSummary] = useState('');
  const [body, setBody] = useState('');
  const [titleSt, setTitleSt] = useState('');
  const [summarySt, setSummarySt] = useState('');
  const [bodySt, setBodySt] = useState('');
  const [confirmed, setConfirmed] = useState(false);

  const resetEditor = () => {
    setEditingId(null);
    setTitle('');
    setCategory('Public Notices');
    setDate(new Date().toISOString().slice(0, 10));
    setMinistry('');
    setSourceUrl('');
    setSummary('');
    setBody('');
    setTitleSt('');
    setSummarySt('');
    setBodySt('');
    setConfirmed(false);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const u = loginUsername.trim();
    const p = loginPassword;
    let user: DemoUser | null = null;
    if (u === 'admin' && p === 'Admin123!') {
      user = { username: 'admin', role: 'admin' };
    } else {
      user = readDemoUsers().find((item) => item.username === u && item.password === p) || null;
    }

    if (!user) {
      setLoginMessage('Login failed. Check your username and password.');
      return;
    }

    const nextSession: DemoSession = { username: user.username, role: user.role };
    sessionStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(nextSession));
    setSession(nextSession);
    setLoginMessage('');
    setLoginUsername('');
    setLoginPassword('');
    onShowToast(user.role === 'admin' ? 'Administrator signed in.' : 'Publisher signed in.');
  };

  const handleLogout = () => {
    sessionStorage.removeItem(DEMO_SESSION_KEY);
    setSession(null);
    setCreatedCredentials(null);
    setSmsResult('');
    resetEditor();
    onShowToast('You have logged out.');
  };

  const handleCreatePublisher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!session || session.role !== 'admin') {
      onShowToast('Only the administrator can create publisher accounts.');
      return;
    }
    const username = newPubUser.trim();
    const password = newPubPass;
    const existing = readDemoUsers();
    if (
      username.toLowerCase() === 'admin' ||
      existing.some((item) => item.username.toLowerCase() === username.toLowerCase())
    ) {
      onShowToast('That username is already in use. Choose another username.');
      return;
    }

    const nextUsers: DemoUser[] = [
      ...existing,
      { username, password, role: 'publisher', createdAt: new Date().toISOString() },
    ];
    localStorage.setItem(DEMO_USERS_KEY, JSON.stringify(nextUsers));
    setCreatedCredentials({ username, password });
    setNewPubUser('');
    setNewPubPass('');
    onShowToast('Publisher login created in this browser.');
  };

  const handleCopyCredentials = () => {
    if (!createdCredentials) return;
    const details = `Publisher login details\nUsername: ${createdCredentials.username}\nTemporary password: ${createdCredentials.password}`;
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard
        .writeText(details)
        .then(() => onShowToast('Login details copied.'))
        .catch(() => onShowToast(details));
    } else {
      onShowToast(details);
    }
  };

  const handleReviewArticle = (id: number, status: ArticleStatus) => {
    if (!session || session.role !== 'admin') {
      onShowToast('Only an administrator can review submissions.');
      return;
    }
    const note = (reviewNotes[id] || '').trim();
    if (status === 'changes_requested' && !note) {
      onShowToast('Add a short note explaining the changes required.');
      return;
    }

    const next = customArticles.map((item) =>
      item.id === id
        ? {
            ...item,
            status,
            reviewNote: note,
            reviewedBy: session.username,
            reviewedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
        : item
    );
    onSaveCustomArticles(next);
    onShowToast(
      status === 'published'
        ? 'Article approved and published in this browser.'
        : 'Changes requested. The publisher can edit and resubmit.'
    );
  };

  const handleCreateSmsDraft = (e: React.FormEvent) => {
    e.preventDefault();
    if (!session || session.role !== 'admin') {
      onShowToast('Only the administrator can prepare government SMS alerts.');
      return;
    }
    const msg = smsMessage.trim();
    if (!msg) {
      onShowToast('Enter the alert message first.');
      return;
    }

    const draft: AdminSmsDraft = {
      district: smsDistrict,
      topic: smsTopic,
      message: msg,
      createdBy: session.username,
      createdAt: new Date().toISOString(),
    };
    const next = [...smsDrafts, draft];
    localStorage.setItem(ADMIN_SMS_KEY, JSON.stringify(next));
    setSmsDrafts(next);
    setSmsDistrict('All districts');
    setSmsTopic('Public Notices');
    setSmsMessage('');
    setSmsResult(
      `Alert draft saved for ${draft.district}. No SMS has been sent. Connect an approved SMS provider to deliver this alert.`
    );
    onShowToast('SMS alert draft saved. No message was sent.');
  };

  const handleSavePublisherArticle = (status: 'draft' | 'pending_review') => {
    if (!session || session.role !== 'publisher') {
      onShowToast('Please sign in with a publisher account first.');
      return;
    }

    const trimmedTitle = title.trim();
    const trimmedBody = body.trim();
    if (status !== 'draft') {
      if (editorRef.current && !editorRef.current.reportValidity()) return;
      if (!confirmed) {
        onShowToast('Confirm that the article has been checked before submitting it.');
        return;
      }
    }
    if (status === 'draft' && !trimmedTitle && !trimmedBody) {
      onShowToast('Enter a title or some article text before saving a draft.');
      return;
    }

    const symbolMap: Record<ArticleCategory, string> = {
      'Public Notices': '⚑',
      Health: '✚',
      Education: '▣',
      Development: '⌂',
    };
    const visualMap: Record<ArticleCategory, ArticleVisual> = {
      'Public Notices': 'notice',
      Health: 'health',
      Education: 'education',
      Development: 'development',
    };

    const deptMedia = DEPARTMENT_IMAGES[category];
    const existing = editingId
      ? customArticles.find((item) => item.id === editingId && item.author === session.username)
      : undefined;

    if (editingId && !existing) {
      onShowToast('This article cannot be edited from the current account.');
      return;
    }

    const nextItem: Article = {
      ...(existing || {}),
      id: editingId || Date.now(),
      title: trimmedTitle,
      category,
      ministry: ministry.trim(),
      date: date || new Date().toISOString().slice(0, 10),
      sourceUrl: sourceUrl.trim(),
      symbol: symbolMap[category] || '▤',
      visual: visualMap[category] || 'public',
      image: existing?.image || deptMedia.image,
      imageAlt: existing?.imageAlt || deptMedia.alt,
      summary: summary.trim(),
      body: trimmedBody,
      titleSt: titleSt.trim(),
      summarySt: summarySt.trim(),
      bodySt: bodySt.trim(),
      author: session.username,
      status,
      isCustom: true,
      createdAt: existing?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      reviewNote: status === 'pending_review' ? '' : existing?.reviewNote || '',
    };

    const nextList = existing
      ? customArticles.map((item) => (item.id === editingId ? nextItem : item))
      : [nextItem, ...customArticles];

    onSaveCustomArticles(nextList);
    resetEditor();
    onShowToast(
      status === 'draft'
        ? 'Draft saved. You can edit it later.'
        : 'Article submitted for administrator review. It is not public yet.'
    );
  };

  const loadForEdit = (item: Article) => {
    setEditingId(item.id);
    setTitle(item.title || '');
    setCategory(item.category || 'Public Notices');
    setDate(item.date || new Date().toISOString().slice(0, 10));
    setMinistry(item.ministry || '');
    setSourceUrl(item.sourceUrl || '');
    setSummary(item.summary || '');
    setBody(item.body || '');
    setTitleSt(item.titleSt || '');
    setSummarySt(item.summarySt || '');
    setBodySt(item.bodySt || '');
    setConfirmed(false);
    editorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const deleteDraft = (id: number) => {
    onSaveCustomArticles(customArticles.filter((item) => item.id !== id));
    setConfirmDeleteId(null);
    onShowToast('Draft deleted.');
  };

  const pendingReviews = customArticles.filter((item) => item.status === 'pending_review').slice().reverse();
  const myArticles = session?.role === 'publisher'
    ? customArticles
        .filter((item) => item.author === session.username)
        .slice()
        .sort((a, b) => (b.updatedAt || b.createdAt || '').localeCompare(a.updatedAt || a.createdAt || ''))
    : [];
  const countByStatus = (st: ArticleStatus) =>
    myArticles.filter((item) => (item.status || 'published') === st).length;

  return (
    <section className="publish-section" id="publish">
      <div className="container publish-inner">
        <div className="publish-intro">
          <div className="eyebrow">CONTENT MANAGEMENT DEMO</div>
          <h2>Publisher dashboard</h2>
          <p>
            Add a sample article to see how an authorised publishing workflow could work. This demo
            saves entries only in this browser and is not secure enough for real government
            publishing.
          </p>
          <div className="dashboard-note">
            <strong>Important:</strong> For a live service, user accounts, server-side validation,
            approvals and a database must be implemented before publishing official information.
          </div>
        </div>

        <div className="publisher-controls">
          <div className="publisher-auth-wrap" id="publisherAuthWrap">
            {!session && (
              <form className="publisher-form auth-form" id="loginForm" onSubmit={handleLogin}>
                <div className="form-heading">
                  <span className="dashboard-icon">🔐</span>
                  <div>
                    <strong>Publisher portal login</strong>
                    <small>Sign in with details supplied by the administrator</small>
                  </div>
                </div>
                <label htmlFor="loginUsername">Username *</label>
                <input
                  id="loginUsername"
                  autoComplete="username"
                  required
                  placeholder="Enter your username"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                />
                <label htmlFor="loginPassword">Password *</label>
                <input
                  id="loginPassword"
                  type="password"
                  autoComplete="current-password"
                  required
                  placeholder="Enter your password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                />
                <button type="submit" className="button button-primary">
                  Sign in
                </button>
                <p className="form-help">
                  Demo administrator account: <strong>admin</strong> / <strong>Admin123!</strong>.
                  Change this in a real system; this browser-only demo is not secure.
                </p>
                {loginMessage && (
                  <p className="auth-message" id="loginMessage" aria-live="polite">
                    {loginMessage}
                  </p>
                )}
              </form>
            )}

            {session?.role === 'admin' && (
              <div className="publisher-form admin-panel" id="adminPanel">
                <div className="form-heading">
                  <span className="dashboard-icon">♙</span>
                  <div>
                    <strong>Administrator dashboard</strong>
                    <small>Create a publisher account</small>
                  </div>
                </div>
                <p className="form-help">
                  Create a username and temporary password, then give these details to the
                  publisher securely.
                </p>
                <form id="createPublisherForm" onSubmit={handleCreatePublisher}>
                  <label htmlFor="newPublisherUsername">Publisher username *</label>
                  <input
                    id="newPublisherUsername"
                    required
                    minLength={3}
                    maxLength={40}
                    autoComplete="off"
                    placeholder="e.g. news.publisher"
                    value={newPubUser}
                    onChange={(e) => setNewPubUser(e.target.value)}
                  />
                  <label htmlFor="newPublisherPassword">Temporary password *</label>
                  <input
                    id="newPublisherPassword"
                    type="password"
                    required
                    minLength={8}
                    autoComplete="new-password"
                    placeholder="At least 8 characters"
                    value={newPubPass}
                    onChange={(e) => setNewPubPass(e.target.value)}
                  />
                  <button type="submit" className="button button-primary">
                    Create publisher login
                  </button>
                </form>

                {createdCredentials && (
                  <div className="credentials-result" id="credentialsResult" aria-live="polite">
                    <strong>Publisher account created</strong>
                    <p>
                      Username: <code>{createdCredentials.username}</code>
                    </p>
                    <p>
                      Temporary password: <code>{createdCredentials.password}</code>
                    </p>
                    <p>
                      Give these details directly to the publisher. Do not post them publicly.
                    </p>
                    <button
                      type="button"
                      className="button button-outline"
                      id="copyCredentials"
                      onClick={handleCopyCredentials}
                    >
                      Copy login details
                    </button>
                  </div>
                )}

                <div className="admin-review-manager">
                  <div className="form-heading">
                    <span className="dashboard-icon">✓</span>
                    <div>
                      <strong>Review publisher submissions</strong>
                      <small>Approve stories before they appear publicly</small>
                    </div>
                  </div>
                  <p className="form-help">
                    Review each submitted story and approve it for the public news page or request
                    changes from the publisher.
                  </p>
                  <div className="submission-list" id="adminReviewList">
                    {pendingReviews.length === 0 ? (
                      <p className="form-help">No submissions are waiting for review.</p>
                    ) : (
                      pendingReviews.map((item) => (
                        <article className="submission-card" key={item.id}>
                          <strong>{item.title || 'Untitled article'}</strong>
                          <p className="submission-meta">
                            {item.category} · Submitted by {item.author || 'publisher'} ·{' '}
                            {item.ministry || 'Source not provided'}
                          </p>
                          <p>{item.summary || 'No summary entered.'}</p>
                          <p className="submission-meta">
                            {item.sourceUrl
                              ? `Source: ${item.sourceUrl}`
                              : 'No official source URL supplied.'}
                          </p>
                          <label>
                            Review note (optional)
                            <textarea
                              rows={2}
                              maxLength={300}
                              placeholder="Explain any changes needed"
                              value={reviewNotes[item.id] || ''}
                              onChange={(e) =>
                                setReviewNotes((prev) => ({ ...prev, [item.id]: e.target.value }))
                              }
                            />
                          </label>
                          <div className="submission-actions">
                            <button
                              type="button"
                              className="button button-primary"
                              onClick={() => handleReviewArticle(item.id, 'published')}
                            >
                              Approve and publish
                            </button>
                            <button
                              type="button"
                              className="button button-outline"
                              onClick={() => handleReviewArticle(item.id, 'changes_requested')}
                            >
                              Request changes
                            </button>
                          </div>
                        </article>
                      ))
                    )}
                  </div>
                </div>

                <div className="admin-sms-manager">
                  <div className="form-heading">
                    <span className="dashboard-icon">✉</span>
                    <div>
                      <strong>Manage government SMS alerts</strong>
                      <small>Administrator only · demonstration mode</small>
                    </div>
                  </div>
                  <p className="form-help">
                    Prepare an official alert for a selected district or all districts. This demo
                    saves a draft; it does not send a text message.
                  </p>
                  <form id="adminSmsForm" onSubmit={handleCreateSmsDraft}>
                    <label htmlFor="adminSmsDistrict">Target audience *</label>
                    <select
                      id="adminSmsDistrict"
                      required
                      value={smsDistrict}
                      onChange={(e) => setSmsDistrict(e.target.value)}
                    >
                      <option value="All districts">All districts</option>
                      {DISTRICTS.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                    <label htmlFor="adminSmsTopic">Alert category *</label>
                    <select
                      id="adminSmsTopic"
                      required
                      value={smsTopic}
                      onChange={(e) => setSmsTopic(e.target.value)}
                    >
                      <option>Public Notices</option>
                      <option>Health</option>
                      <option>Education</option>
                      <option>Development</option>
                      <option>Emergency</option>
                    </select>
                    <label htmlFor="adminSmsMessage">SMS message *</label>
                    <textarea
                      id="adminSmsMessage"
                      required
                      maxLength={320}
                      rows={4}
                      placeholder="Write a short, verified public announcement"
                      value={smsMessage}
                      onChange={(e) => setSmsMessage(e.target.value)}
                    />
                    <div className="sms-character-count">
                      <span id="adminSmsCharCount">{smsMessage.length}</span>/320 characters
                    </div>
                    <button type="submit" className="button button-primary">
                      Prepare SMS alert draft
                    </button>
                  </form>

                  {smsResult && (
                    <div className="admin-sms-result" id="adminSmsResult" aria-live="polite">
                      {smsResult}
                    </div>
                  )}

                  <div className="admin-sms-history" id="adminSmsHistory">
                    <strong>Prepared alert drafts ({smsDrafts.length})</strong>
                    {smsDrafts.length === 0 ? (
                      <p className="form-help">No alert drafts have been prepared in this browser.</p>
                    ) : (
                      smsDrafts
                        .slice()
                        .reverse()
                        .map((draft, idx) => (
                          <div className="admin-sms-draft" key={`${draft.createdAt}-${idx}`}>
                            <strong>
                              {draft.topic} · {draft.district}
                            </strong>
                            <p>{draft.message}</p>
                            <small>
                              Prepared by {draft.createdBy} ·{' '}
                              {new Date(draft.createdAt).toLocaleString()}
                            </small>
                          </div>
                        ))
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  className="button button-outline auth-logout"
                  onClick={handleLogout}
                >
                  Log out
                </button>
              </div>
            )}
          </div>

          {session?.role === 'publisher' && (
            <>
              <div className="publisher-form publisher-workspace" id="publisherWorkspace">
                <div className="form-heading">
                  <span className="dashboard-icon">✓</span>
                  <div>
                    <strong>Publisher workspace</strong>
                    <small id="publisherWelcome">Signed in as {session.username}</small>
                  </div>
                </div>
                <p className="form-help">
                  Prepare stories, save unfinished work as a draft, and submit completed articles
                  for administrator review. Only approved articles appear in public news.
                </p>

                <div className="publisher-stats" id="publisherStats" aria-live="polite">
                  <div className="publisher-stat">
                    <strong>{myArticles.length}</strong>
                    <span>Total articles</span>
                  </div>
                  <div className="publisher-stat">
                    <strong>{countByStatus('draft')}</strong>
                    <span>Drafts</span>
                  </div>
                  <div className="publisher-stat">
                    <strong>{countByStatus('pending_review')}</strong>
                    <span>Pending review</span>
                  </div>
                  <div className="publisher-stat">
                    <strong>{countByStatus('published')}</strong>
                    <span>Published</span>
                  </div>
                </div>

                <div className="publisher-my-articles">
                  <div className="form-heading">
                    <span className="dashboard-icon">▤</span>
                    <div>
                      <strong>My articles</strong>
                      <small>Track drafts, review status and published stories</small>
                    </div>
                  </div>
                  <div className="submission-list" id="publisherArticleList">
                    {myArticles.length === 0 ? (
                      <p className="form-help">
                        You have not created any articles yet. Use the form below to start a story.
                      </p>
                    ) : (
                      myArticles.map((item) => {
                        const st = item.status || 'published';
                        const canEdit = ['draft', 'changes_requested', 'rejected'].includes(st);
                        return (
                          <article className="submission-card" key={item.id}>
                            <div className="submission-card-head">
                              <strong>{item.title || 'Untitled draft'}</strong>
                              <span className={`submission-status status-${st}`}>
                                {statusLabel(item.status)}
                              </span>
                            </div>
                            <p className="submission-meta">
                              {item.category || 'No category'} · Updated{' '}
                              {new Date(item.updatedAt || item.createdAt || Date.now()).toLocaleDateString()}
                            </p>
                            {item.reviewNote && (
                              <p className="review-note">Administrator note: {item.reviewNote}</p>
                            )}
                            <div className="submission-actions">
                              {canEdit && (
                                <>
                                  <button
                                    type="button"
                                    className="button button-outline"
                                    onClick={() => loadForEdit(item)}
                                  >
                                    Edit
                                  </button>
                                  {confirmDeleteId === item.id ? (
                                    <>
                                      <button
                                        type="button"
                                        className="button button-outline danger-button"
                                        onClick={() => deleteDraft(item.id)}
                                      >
                                        Confirm delete
                                      </button>
                                      <button
                                        type="button"
                                        className="button button-outline"
                                        onClick={() => setConfirmDeleteId(null)}
                                      >
                                        Cancel
                                      </button>
                                    </>
                                  ) : (
                                    <button
                                      type="button"
                                      className="button button-outline danger-button"
                                      onClick={() => setConfirmDeleteId(item.id)}
                                    >
                                      Delete draft
                                    </button>
                                  )}
                                </>
                              )}
                              {st === 'published' && (
                                <button
                                  type="button"
                                  className="button button-outline"
                                  onClick={() => {
                                    document
                                      .getElementById('latest')
                                      ?.scrollIntoView({ behavior: 'smooth' });
                                    onOpenArticle(item);
                                  }}
                                >
                                  View public article
                                </button>
                              )}
                            </div>
                          </article>
                        );
                      })
                    )}
                  </div>
                </div>

                <div className="admin-sms-manager publisher-sms-view">
                  <div className="form-heading">
                    <span className="dashboard-icon">✉</span>
                    <div>
                      <strong>Government SMS alerts</strong>
                      <small>Publisher dashboard · view only</small>
                    </div>
                  </div>
                  <p className="form-help">
                    View alert drafts prepared by the administrator. Only the administrator can
                    create or manage official SMS alert drafts.
                  </p>
                  <div className="admin-sms-history" id="publisherSmsHistory">
                    <strong>Prepared alert drafts ({smsDrafts.length})</strong>
                    {smsDrafts.length === 0 ? (
                      <p className="form-help">No alert drafts have been prepared in this browser.</p>
                    ) : (
                      smsDrafts
                        .slice()
                        .reverse()
                        .map((draft, idx) => (
                          <div className="admin-sms-draft" key={`${draft.createdAt}-${idx}`}>
                            <strong>
                              {draft.topic} · {draft.district}
                            </strong>
                            <p>{draft.message}</p>
                            <small>
                              Prepared by {draft.createdBy} ·{' '}
                              {new Date(draft.createdAt).toLocaleString()}
                            </small>
                          </div>
                        ))
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  className="button button-outline auth-logout"
                  onClick={handleLogout}
                >
                  Log out
                </button>
              </div>

              <form
                ref={editorRef}
                className="publisher-form"
                id="publisherForm"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSavePublisherArticle('pending_review');
                }}
              >
                <div className="form-heading">
                  <span className="dashboard-icon">＋</span>
                  <div>
                    <strong id="publisherFormHeading">
                      {editingId ? 'Edit news story' : 'Create a news story'}
                    </strong>
                    <small>Save as a draft or submit for administrator review</small>
                  </div>
                </div>

                <label htmlFor="publisherTitle">Article title *</label>
                <input
                  id="publisherTitle"
                  required
                  maxLength={140}
                  placeholder="Enter a clear article title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />

                <div className="archive-form-row">
                  <div>
                    <label htmlFor="publisherCategory">Category *</label>
                    <select
                      id="publisherCategory"
                      required
                      value={category}
                      onChange={(e) => setCategory(e.target.value as ArticleCategory)}
                    >
                      <option value="Public Notices">Public Notices</option>
                      <option value="Health">Health</option>
                      <option value="Education">Education</option>
                      <option value="Development">Development</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="publisherDate">Publication date *</label>
                    <input
                      id="publisherDate"
                      type="date"
                      required
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                    />
                  </div>
                </div>

                <label htmlFor="publisherMinistry">Ministry / source *</label>
                <input
                  id="publisherMinistry"
                  list="lesothoMinistriesList"
                  required
                  maxLength={100}
                  placeholder="Name of responsible ministry"
                  value={ministry}
                  onChange={(e) => setMinistry(e.target.value)}
                />
                <datalist id="lesothoMinistriesList">
                  {LESOTHO_MINISTRIES.map((m) => (
                    <option key={m.id} value={m.name} />
                  ))}
                  <option value="Government Information Desk" />
                </datalist>

                <label htmlFor="publisherSource">Official source URL (optional)</label>
                <input
                  id="publisherSource"
                  type="url"
                  placeholder="https://www.gov.ls/..."
                  value={sourceUrl}
                  onChange={(e) => setSourceUrl(e.target.value)}
                />

                <label htmlFor="publisherSummary">Short summary *</label>
                <textarea
                  id="publisherSummary"
                  required
                  maxLength={280}
                  rows={3}
                  placeholder="Summarise the story in plain language"
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                />

                <label htmlFor="publisherBody">Article content (English) *</label>
                <textarea
                  id="publisherBody"
                  required
                  rows={5}
                  placeholder="Enter the article text"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                />

                <details className="translation-fields">
                  <summary>Optional: add a Sesotho version</summary>
                  <label htmlFor="publisherTitleSt">Article title in Sesotho</label>
                  <input
                    id="publisherTitleSt"
                    maxLength={140}
                    placeholder="Sehlooho sa litaba ka Sesotho"
                    value={titleSt}
                    onChange={(e) => setTitleSt(e.target.value)}
                  />
                  <label htmlFor="publisherSummarySt">Summary in Sesotho</label>
                  <textarea
                    id="publisherSummarySt"
                    maxLength={280}
                    rows={3}
                    placeholder="Kakaretso ea litaba ka Sesotho"
                    value={summarySt}
                    onChange={(e) => setSummarySt(e.target.value)}
                  />
                  <label htmlFor="publisherBodySt">Article content in Sesotho</label>
                  <textarea
                    id="publisherBodySt"
                    rows={5}
                    placeholder="Litaba ka Sesotho"
                    value={bodySt}
                    onChange={(e) => setBodySt(e.target.value)}
                  />
                  <p className="form-help">
                    Enter a human-reviewed Sesotho translation. The website does not translate
                    articles automatically.
                  </p>
                </details>

                <label className="publisher-check">
                  <input
                    id="publisherConfirmed"
                    type="checkbox"
                    required
                    checked={confirmed}
                    onChange={(e) => setConfirmed(e.target.checked)}
                  />
                  I confirm this article has been checked and is ready for administrator review.
                </label>

                <div className="publisher-form-actions">
                  <button
                    type="button"
                    className="button button-outline"
                    id="saveDraftButton"
                    onClick={() => handleSavePublisherArticle('draft')}
                  >
                    Save as draft
                  </button>
                  <button type="submit" className="button button-primary" id="submitReviewButton">
                    {editingId ? 'Resubmit for review' : 'Submit for review'}
                  </button>
                  {editingId && (
                    <button
                      type="button"
                      className="button button-outline"
                      id="cancelEditButton"
                      onClick={resetEditor}
                    >
                      Cancel editing
                    </button>
                  )}
                </div>

                <p className="form-help">
                  Stories and account data are stored in this browser only. This is a prototype,
                  not a secure publishing system.
                </p>
              </form>
            </>
          )}
        </div>
      </div>
    </section>
  );
};
