import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Article,
  ArticleCategory,
  LanguageCode,
  LesothoMinistry,
} from './types';
import {
  DEPARTMENT_IMAGES,
  DISTRICTS,
  formatDate,
  getArticleImage,
  getLocalizedArticle,
  HERO_BACKGROUND_IMAGE,
  INITIAL_ARTICLES,
  LESOTHO_MINISTRIES,
} from './data/articles';
import { ArticleModal } from './components/ArticleModal';
import { PublisherDashboard } from './components/PublisherDashboard';

const LesothoFlagLogo: React.FC = () => (
  <svg
    viewBox="0 0 60 40"
    className="lesotho-flag-svg"
    role="img"
    aria-label="Flag of the Kingdom of Lesotho"
  >
    <rect width="60" height="12" y="0" fill="#00209F" />
    <rect width="60" height="16" y="12" fill="#FFFFFF" />
    <rect width="60" height="12" y="28" fill="#009543" />
    {/* Traditional Basotho Mokorotlo emblem */}
    <g fill="#000000">
      <circle cx="30" cy="14.6" r="1.2" />
      <path d="M28.9 15.6h2.2l1.1 3.4h-4.4z" />
      <path d="M24.5 23.2c1.8-2.9 3.6-4.4 5.5-4.4s3.7 1.5 5.5 4.4c-1.9 1.6-3.7 2.4-5.5 2.4s-3.6-.8-5.5-2.4z" />
      <rect x="24" y="23.4" width="12" height="1.5" rx="0.7" />
    </g>
  </svg>
);

const CUSTOM_KEY = 'governmentNewsCustomArticles';
const SAVED_KEY = 'savedGovernmentNews';

function readCustomArticles(): Article[] {
  try {
    return JSON.parse(localStorage.getItem(CUSTOM_KEY) || '[]');
  } catch {
    return [];
  }
}

function readSavedIds(): string[] {
  try {
    return JSON.parse(localStorage.getItem(SAVED_KEY) || '[]');
  } catch {
    return [];
  }
}

const LABELS = {
  en: {
    navArchive: 'News archive',
    navAbout: 'About',
    heroText:
      'Discover announcements, public notices and national updates in one simple place. Search individual stories without downloading an entire newspaper.',
    latestTitle: 'Latest government news',
    searchButton: 'Search news',
  },
  st: {
    navArchive: 'Litaba tsa khale',
    navAbout: 'Ka rona',
    heroText: 'Fumana liphatlalatso le litaba tsa bohlokoa sebakeng se le seng.',
    latestTitle: 'Litaba tsa morao-rao',
    searchButton: 'Batla litaba',
  },
} as const;

export function App() {
  const [language, setLanguage] = useState<LanguageCode>('en');
  const [highContrast, setHighContrast] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const [customArticles, setCustomArticles] = useState<Article[]>(() => readCustomArticles());
  const [savedIds, setSavedIds] = useState<string[]>(() => readSavedIds());

  // Filtering / search / archive state
  const [selectedCategory, setSelectedCategory] = useState<'All' | ArticleCategory>('All');
  const [selectedMinistry, setSelectedMinistry] = useState<LesothoMinistry | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const [currentQuery, setCurrentQuery] = useState('');
  const [archiveAfter, setArchiveAfter] = useState('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  // Archive form inputs
  const [archiveKeyword, setArchiveKeyword] = useState('');
  const [archiveTopic, setArchiveTopic] = useState<'All' | ArticleCategory>('All');
  const [archiveDate, setArchiveDate] = useState('');

  // Access tools state
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const [recommendTopic, setRecommendTopic] = useState<'All' | ArticleCategory>('All');
  const [recommendations, setRecommendations] = useState<Article[] | null>(null);

  // Modal & Audio state
  const [activeArticleId, setActiveArticleId] = useState<number | null>(null);
  const [playingArticleId, setPlayingArticleId] = useState<number | null>(null);

  // Toast state
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const toastTimerRef = useRef<number | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setToastVisible(true);
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(() => {
      setToastVisible(false);
    }, 2600);
  };

  useEffect(() => {
    document.body.classList.toggle('high-contrast', highContrast);
  }, [highContrast]);

  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (toastTimerRef.current) {
        window.clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const allArticles = useMemo(() => [...INITIAL_ARTICLES, ...customArticles], [customArticles]);

  const { visibleArticles, ministryMatchType } = useMemo(() => {
    const published = allArticles.filter((a) => {
      const text = `${a.title} ${a.category} ${a.ministry} ${a.summary} ${a.body}`.toLowerCase();
      const isPublished = a.status === 'published' || !a.status;
      const matchesCategory = selectedCategory === 'All' || a.category === selectedCategory;
      const matchesQuery = !currentQuery || text.includes(currentQuery.toLowerCase());
      const matchesArchiveDate = !archiveAfter || a.date >= archiveAfter;
      return isPublished && matchesCategory && matchesQuery && matchesArchiveDate;
    });

    if (selectedMinistry) {
      const exactMatches = published.filter((a) =>
        a.ministry.toLowerCase().includes(selectedMinistry.name.toLowerCase()) ||
        selectedMinistry.name.toLowerCase().includes(a.ministry.toLowerCase())
      );
      if (exactMatches.length > 0) {
        return {
          visibleArticles: exactMatches.sort((a, b) =>
            sortOrder === 'oldest' ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date)
          ),
          ministryMatchType: 'exact' as const,
        };
      }
      const categoryMatches = published.filter((a) => a.category === selectedMinistry.category);
      return {
        visibleArticles: categoryMatches.sort((a, b) =>
          sortOrder === 'oldest' ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date)
        ),
        ministryMatchType: 'category' as const,
      };
    }

    return {
      visibleArticles: published.sort((a, b) =>
        sortOrder === 'oldest' ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date)
      ),
      ministryMatchType: null,
    };
  }, [allArticles, selectedCategory, selectedMinistry, currentQuery, archiveAfter, sortOrder]);

  const activeArticle = useMemo(
    () => allArticles.find((item) => item.id === activeArticleId) || null,
    [allArticles, activeArticleId]
  );

  const handleSaveCustomArticles = (items: Article[]) => {
    localStorage.setItem(CUSTOM_KEY, JSON.stringify(items));
    setCustomArticles(items);
  };

  const runSearch = (query: string) => {
    setCurrentQuery(query.trim());
    setArchiveAfter('');
    setArchiveDate('');
    setArchiveKeyword('');
    setSearchInput(query);
    setSelectedMinistry(null);
    setSelectedCategory('All');
    document.getElementById('latest')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleTopicCardClick = (topic: ArticleCategory) => {
    setCurrentQuery('');
    setSearchInput('');
    setSelectedMinistry(null);
    setSelectedCategory(topic);
    document.getElementById('latest')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleMinistryCardClick = (ministry: LesothoMinistry) => {
    setCurrentQuery('');
    setSearchInput('');
    setArchiveAfter('');
    setSelectedCategory('All');
    setSelectedMinistry(ministry);
    document.getElementById('latest')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleArchiveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const kw = archiveKeyword.trim();
    setCurrentQuery(kw);
    setSelectedMinistry(null);
    setSelectedCategory(archiveTopic);
    setArchiveAfter(archiveDate);
    setSearchInput(kw);
    document.getElementById('latest')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleClearFilters = () => {
    setCurrentQuery('');
    setArchiveAfter('');
    setSelectedCategory('All');
    setSelectedMinistry(null);
    setSearchInput('');
    setArchiveKeyword('');
    setArchiveDate('');
    setArchiveTopic('All');
    setSortOrder('newest');
  };

  const handleListen = (article: Article) => {
    if (!('speechSynthesis' in window) || !('SpeechSynthesisUtterance' in window)) {
      showToast('Text-to-speech is not supported in this browser.');
      return;
    }

    if (playingArticleId === article.id) {
      window.speechSynthesis.cancel();
      setPlayingArticleId(null);
      return;
    }

    const localized = getLocalizedArticle(article, language);
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(
      `${localized.title}. ${localized.summary}. ${localized.body}`
    );
    utterance.lang = language === 'st' ? 'st-LS' : 'en-GB';
    utterance.onend = () => setPlayingArticleId(null);
    utterance.onerror = () => {
      setPlayingArticleId(null);
      showToast('Playback failed. Your device may not have a suitable voice for this language.');
    };
    setPlayingArticleId(article.id);
    window.speechSynthesis.speak(utterance);
  };

  const handleShare = async (article: Article) => {
    const shareData = {
      title: article.title,
      text: `${article.title} — sample government news prototype`,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // User cancelled sharing
      }
    } else if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(`${article.title}\n${article.summary}`);
        showToast('Article title and summary copied to clipboard.');
      } catch {
        showToast('Sharing is not available in this browser.');
      }
    } else {
      showToast(`Sharing demo: ${article.title}`);
    }
  };

  const handleSaveArticle = (articleId: number) => {
    const idStr = String(articleId);
    if (!savedIds.includes(idStr)) {
      const next = [...savedIds, idStr];
      localStorage.setItem(SAVED_KEY, JSON.stringify(next));
      setSavedIds(next);
    }
    showToast('Article saved in this browser.');
  };

  const handleLanguageChange = (nextLang: LanguageCode, fromModal = false) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setPlayingArticleId(null);
    setLanguage(nextLang);
    if (fromModal) {
      showToast(
        nextLang === 'st'
          ? 'Puo ea ho bala e fetotsoe ho Sesotho.'
          : 'Article reading language changed to English.'
      );
    }
  };

  const handleShowRecommendations = () => {
    const results = allArticles
      .filter(
        (article) =>
          (article.status === 'published' || !article.status) &&
          (recommendTopic === 'All' || article.category === recommendTopic)
      )
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 3);
    setRecommendations(results);
  };

  const t = LABELS[language];

  const topicCards: {
    topic: ArticleCategory;
    label: string;
    subtitle: string;
    icon: string;
  }[] = [
    {
      topic: 'Health',
      label: 'Health',
      subtitle: 'Public health and services',
      icon: '✚',
    },
    {
      topic: 'Education',
      label: 'Education',
      subtitle: 'Schools, learning and skills',
      icon: '▣',
    },
    {
      topic: 'Development',
      label: 'Development',
      subtitle: 'Projects and communities',
      icon: '⌂',
    },
    {
      topic: 'Public Notices',
      label: 'Public notices',
      subtitle: 'Deadlines and announcements',
      icon: '⚑',
    },
  ];

  return (
    <>
      <div className="topline">
        <div className="container top-inner">
          <span>Kingdom of Lesotho · Public information portal</span>
          <div className="top-actions">
            <button
              type="button"
              className="text-button"
              id="contrastToggle"
              aria-label="Toggle high contrast"
              onClick={() => {
                const next = !highContrast;
                setHighContrast(next);
                showToast(next ? 'High contrast enabled.' : 'High contrast disabled.');
              }}
            >
              High contrast
            </button>
            <label className="sr-only" htmlFor="languageSelect">
              Choose language
            </label>
            <select
              id="languageSelect"
              aria-label="Choose language"
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value as LanguageCode)}
            >
              <option value="en">English</option>
              <option value="st">Sesotho (basic interface)</option>
            </select>
          </div>
        </div>
      </div>

      <header className="site-header">
        <div className="container header-inner">
          <a className="brand" href="#home" aria-label="Government News home">
            <span className="brand-mark">
              <LesothoFlagLogo />
            </span>
            <span className="brand-copy">
              <strong>Government News</strong>
              <small>Public Access Portal</small>
            </span>
          </a>
          <button
            type="button"
            className="menu-toggle"
            id="menuToggle"
            aria-expanded={menuOpen}
            aria-controls="mainNav"
            onClick={() => setMenuOpen((prev) => !prev)}
          >
            ☰ <span>Menu</span>
          </button>
          <nav
            id="mainNav"
            className={`main-nav${menuOpen ? ' open' : ''}`}
            aria-label="Main navigation"
          >
            <a className="active" href="#home" onClick={() => setMenuOpen(false)}>
              Home
            </a>
            <a href="#latest" onClick={() => setMenuOpen(false)}>
              Latest news
            </a>
            <a href="#topics" onClick={() => setMenuOpen(false)}>
              Topics
            </a>
            <a href="#archive" onClick={() => setMenuOpen(false)}>
              {t.navArchive}
            </a>
            <a href="#access-tools" onClick={() => setMenuOpen(false)}>
              Access tools
            </a>
            <a href="#publish" id="publishNav" onClick={() => setMenuOpen(false)}>
              Publish
            </a>
            <a href="#about" onClick={() => setMenuOpen(false)}>
              {t.navAbout}
            </a>
          </nav>
        </div>
      </header>

      <main>
        <section className="hero" id="home">
          <img
            src={HERO_BACKGROUND_IMAGE}
            alt=""
            aria-hidden="true"
            className="hero-bg-image"
            referrerPolicy="no-referrer"
          />
          <div className="hero-bg-overlay" aria-hidden="true" />
          <div className="container hero-grid">
            <div className="hero-copy">
              <div className="eyebrow">
                <span className="live-dot" /> OFFICIAL PUBLIC INFORMATION
              </div>
              {language === 'st' ? (
                <h1>Litaba tsa &apos;muso, li fumaneha habonolo.</h1>
              ) : (
                <h1>
                  Government news, <em>made easier to find.</em>
                </h1>
              )}
              <p>{t.heroText}</p>
              <form
                className="search-form"
                id="searchForm"
                role="search"
                onSubmit={(e) => {
                  e.preventDefault();
                  runSearch(searchInput);
                }}
              >
                <label className="sr-only" htmlFor="searchInput">
                  Search government news
                </label>
                <span className="search-icon" aria-hidden="true">
                  ⌕
                </span>
                <input
                  id="searchInput"
                  type="search"
                  placeholder="Search news, topics or ministries..."
                  autoComplete="off"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
                <button type="submit">{t.searchButton}</button>
              </form>
            </div>
          </div>
        </section>

        <section className="quick-strip">
          <div className="container quick-grid">
            <a href="#latest">
              <span className="quick-icon">▤</span>
              <span>
                <strong>Latest updates</strong>
                <small>Recently published stories</small>
              </span>
              <b>→</b>
            </a>
            <a href="#archive">
              <span className="quick-icon">◷</span>
              <span>
                <strong>News archive</strong>
                <small>Find older information</small>
              </span>
              <b>→</b>
            </a>
            <a href="#topics">
              <span className="quick-icon">⌕</span>
              <span>
                <strong>Browse topics</strong>
                <small>Explore by subject</small>
              </span>
              <b>→</b>
            </a>
          </div>
        </section>

        <section className="section" id="latest">
          <div className="container">
            <div className="section-heading">
              <div>
                <div className="eyebrow">STAY INFORMED</div>
                <h2>{t.latestTitle}</h2>
                <p>Browse stories individually and share the information that matters to you.</p>
              </div>
              <a className="inline-link" href="#archive">
                Explore the archive <span>→</span>
              </a>
            </div>

            <div className="filter-row">
              <div className="filter-tabs" id="categoryTabs" aria-label="Filter news by category">
                {(
                  [
                    { value: 'All', label: 'All stories' },
                    { value: 'Public Notices', label: 'Public notices' },
                    { value: 'Health', label: 'Health' },
                    { value: 'Education', label: 'Education' },
                    { value: 'Development', label: 'Development' },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.value}
                    type="button"
                    className={`filter-tab${selectedCategory === tab.value ? ' selected' : ''}`}
                    onClick={() => {
                      setCurrentQuery('');
                      setArchiveAfter('');
                      setSearchInput('');
                      setSelectedMinistry(null);
                      setSelectedCategory(tab.value);
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              <label className="sort-control">
                Sort by
                <select
                  id="sortSelect"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')}
                >
                  <option value="newest">Newest first</option>
                  <option value="oldest">Oldest first</option>
                </select>
              </label>
            </div>

            <div className="results-note" id="resultsNote" aria-live="polite">
              {selectedMinistry ? (
                <>
                  {ministryMatchType === 'exact'
                    ? `${visibleArticles.length} sample ${visibleArticles.length === 1 ? 'story' : 'stories'} from ${selectedMinistry.name}.`
                    : `Showing ${selectedMinistry.category} stories related to ${selectedMinistry.name}.`}
                  <button
                    type="button"
                    className="ministry-filter-clear"
                    onClick={() => setSelectedMinistry(null)}
                  >
                    Show all ministries
                  </button>
                </>
              ) : (
                <>
                  {visibleArticles.length} sample{' '}
                  {visibleArticles.length === 1 ? 'story' : 'stories'} found
                  {currentQuery ? ` for “${currentQuery}”` : ''}
                  {selectedCategory !== 'All' ? ` in ${selectedCategory}` : ''}
                  {archiveAfter ? ` after ${formatDate(archiveAfter)}` : ''}.
                </>
              )}
            </div>

            {visibleArticles.length > 0 ? (
              <div className="news-grid" id="newsGrid">
                {visibleArticles.map((original) => {
                  const localized = getLocalizedArticle(original, language);
                  const { image, alt } = getArticleImage(original);
                  const deptMedia =
                    DEPARTMENT_IMAGES[original.category] || DEPARTMENT_IMAGES['Public Notices'];
                  const isPlaying = playingArticleId === original.id;
                  return (
                    <article className="news-card" key={original.id}>
                      <div className={`card-visual visual-${original.visual}`}>
                        <img
                          src={image}
                          alt={alt}
                          className="card-visual-img"
                          referrerPolicy="no-referrer"
                        />
                        <div className="card-visual-scrim" aria-hidden="true" />
                        <span className="category-pill">{original.category}</span>
                        <img
                          src={deptMedia.logo}
                          alt={deptMedia.logoAlt}
                          className="card-ministry-logo"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="card-body">
                        <div className="card-meta">
                          <span>{formatDate(original.date)}</span>
                          <span>·</span>
                          <span className="source-check">✓ Sample source label</span>
                        </div>
                        <h3>{localized.title}</h3>
                        <p>{localized.summary}</p>
                        <div className="card-bottom">
                          <button
                            type="button"
                            className="read-link"
                            onClick={() => setActiveArticleId(original.id)}
                          >
                            {language === 'st' ? 'Bala litaba →' : 'Read article →'}
                          </button>
                          <button
                            type="button"
                            className="listen-card-button"
                            onClick={() => handleListen(original)}
                          >
                            {isPlaying
                              ? language === 'st'
                                ? 'Ⅱ Emisa'
                                : 'Ⅱ Stop'
                              : `▶ ${language === 'st' ? 'Mamela' : 'Listen'}`}
                          </button>
                          <button
                            type="button"
                            className="share-button"
                            aria-label={`Share ${localized.title}`}
                            onClick={() => handleShare(original)}
                          >
                            ↗ {language === 'st' ? 'Arolelana' : 'Share'}
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="empty-state" id="emptyState">
                <div className="empty-icon">⌕</div>
                <h3>No stories found</h3>
                <p>Try a different keyword or choose another topic.</p>
                <button
                  type="button"
                  className="button button-outline"
                  id="clearFilters"
                  onClick={handleClearFilters}
                >
                  Clear search and filters
                </button>
              </div>
            )}
          </div>
        </section>

        <section className="section access-tools-section" id="access-tools">
          <div className="container">
            <div className="section-heading">
              <div>
                <div className="eyebrow">DISCOVER MORE</div>
                <h2>Find news that matters to you</h2>
                <p>
                  Browse local information and discover related stories. Listen to audio directly
                  from each news article.
                </p>
              </div>
            </div>

            <div className="feature-grid">
              <article className="feature-panel district-panel" id="districtMap">
                <div className="feature-icon">⌖</div>
                <div className="eyebrow">LOCAL INFORMATION</div>
                <h3>Browse by district</h3>
                <p>
                  Select a district to preview how locally relevant announcements could be
                  organised.
                </p>
                <div className="district-map" role="group" aria-label="Choose a district">
                  {DISTRICTS.map((district) => (
                    <button
                      key={district}
                      type="button"
                      className={selectedDistrict === district ? 'selected' : ''}
                      onClick={() => setSelectedDistrict(district)}
                    >
                      {district}
                    </button>
                  ))}
                </div>
                <div className="district-result" id="districtResult" aria-live="polite">
                  {selectedDistrict
                    ? `${selectedDistrict} selected. A live version could show verified notices, service updates and deadlines tagged to this district. Current sample articles do not contain verified district tags.`
                    : 'Choose a district to see the selected area. This schematic is not a geographic map.'}
                </div>
              </article>

              <article className="feature-panel recommendations-panel" id="recommendations">
                <div className="feature-icon">✧</div>
                <div className="eyebrow">PERSONALISED DISCOVERY</div>
                <h3>Recommended for you</h3>
                <p>
                  Get suggestions based on a topic you choose. A live service could use saved
                  preferences and reading activity with user consent.
                </p>
                <label htmlFor="recommendTopic">What interests you?</label>
                <select
                  id="recommendTopic"
                  value={recommendTopic}
                  onChange={(e) => setRecommendTopic(e.target.value as 'All' | ArticleCategory)}
                >
                  <option value="All">All topics</option>
                  <option value="Public Notices">Public Notices</option>
                  <option value="Health">Health</option>
                  <option value="Education">Education</option>
                  <option value="Development">Development</option>
                </select>
                <button
                  className="button button-primary"
                  id="recommendBtn"
                  type="button"
                  onClick={handleShowRecommendations}
                >
                  Show recommendations
                </button>
                <div className="recommend-list" id="recommendList" aria-live="polite">
                  {recommendations === null ? (
                    <p className="feature-help">Choose a topic to see sample recommendations.</p>
                  ) : recommendations.length === 0 ? (
                    <p className="feature-help">No sample stories match this topic yet.</p>
                  ) : (
                    recommendations.map((article) => (
                      <button
                        key={article.id}
                        type="button"
                        className="recommend-item"
                        onClick={() => setActiveArticleId(article.id)}
                      >
                        <strong>{article.title}</strong>
                        <small>
                          {article.category} · {formatDate(article.date)}
                        </small>
                      </button>
                    ))
                  )}
                </div>
                <p className="feature-help">
                  These are simple topic-based suggestions, not AI recommendations.
                </p>
              </article>
            </div>
          </div>
        </section>

        <section className="trust-band">
          <div className="container trust-inner">
            <div className="trust-symbol">✓</div>
            <div>
              <h2>Know where your news comes from</h2>
              <p>
                Each article in the full service should identify the responsible ministry,
                publication date and original official source.
              </p>
            </div>
            <a href="#about" className="button button-light">
              How verification works
            </a>
          </div>
        </section>

        <section className="section topics-section" id="topics">
          <div className="container">
            <div className="section-heading">
              <div>
                <div className="eyebrow">EXPLORE BY SUBJECT</div>
                <h2>Browse news topics</h2>
                <p>Go directly to the information you are looking for.</p>
              </div>
            </div>
            <div className="topic-grid">
              {topicCards.map((item) => {
                const deptMedia = DEPARTMENT_IMAGES[item.topic];
                return (
                  <button
                    key={item.topic}
                    type="button"
                    className="topic-card"
                    onClick={() => handleTopicCardClick(item.topic)}
                  >
                    <div className="topic-thumb">
                      <img
                        src={deptMedia.image}
                        alt={deptMedia.alt}
                        className="topic-thumb-img"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <span className="topic-arrow">↗</span>
                    <span className="topic-icon topic-icon-logo">
                      <img
                        src={deptMedia.logo}
                        alt={deptMedia.logoAlt}
                        className="topic-logo-img"
                        referrerPolicy="no-referrer"
                      />
                    </span>
                    <strong>{item.label}</strong>
                    <small>{item.subtitle}</small>
                  </button>
                );
              })}
            </div>

            <div className="ministries-directory" id="ministries">
              <div className="ministries-subhead">
                <div>
                  <div className="eyebrow">KINGDOM OF LESOTHO CABINET</div>
                  <h3>All Ministries of Lesotho ({LESOTHO_MINISTRIES.length})</h3>
                  <p>
                    Select any ministry to explore related government news and public notices.
                  </p>
                </div>
              </div>
              <div className="ministry-directory-grid">
                {LESOTHO_MINISTRIES.map((ministry) => (
                  <button
                    key={ministry.id}
                    type="button"
                    className={`ministry-card${
                      selectedMinistry?.id === ministry.id ? ' active' : ''
                    }`}
                    onClick={() => handleMinistryCardClick(ministry)}
                  >
                    <div className="ministry-thumb">
                      <img
                        src={ministry.image}
                        alt={ministry.imageAlt}
                        className="ministry-thumb-img"
                        referrerPolicy="no-referrer"
                      />
                      <span className="ministry-category-tag">{ministry.category}</span>
                      <img
                        src={ministry.logo}
                        alt={ministry.logoAlt}
                        className="ministry-logo-badge"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="ministry-card-body">
                      <strong>{ministry.name}</strong>
                      <small>{ministry.portfolio}</small>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="archive-section" id="archive">
          <div className="container archive-inner">
            <div>
              <div className="eyebrow">KEEP INFORMATION WITHIN REACH</div>
              <h2>Looking for an older story?</h2>
              <p>
                Search the sample archive by keyword, topic or publication date. In a live website,
                this section would contain verified past government articles and editions.
              </p>
            </div>
            <form className="archive-form" id="archiveForm" onSubmit={handleArchiveSubmit}>
              <label htmlFor="archiveKeyword">Keyword</label>
              <input
                id="archiveKeyword"
                type="search"
                placeholder="e.g. public notice"
                value={archiveKeyword}
                onChange={(e) => setArchiveKeyword(e.target.value)}
              />
              <div className="archive-form-row">
                <div>
                  <label htmlFor="archiveTopic">Topic</label>
                  <select
                    id="archiveTopic"
                    value={archiveTopic}
                    onChange={(e) => setArchiveTopic(e.target.value as 'All' | ArticleCategory)}
                  >
                    <option value="All">All topics</option>
                    <option value="Public Notices">Public Notices</option>
                    <option value="Health">Health</option>
                    <option value="Education">Education</option>
                    <option value="Development">Development</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="archiveDate">Published after</label>
                  <input
                    id="archiveDate"
                    type="date"
                    value={archiveDate}
                    onChange={(e) => setArchiveDate(e.target.value)}
                  />
                </div>
              </div>
              <button type="submit" className="button button-primary">
                Search archive →
              </button>
            </form>
          </div>
        </section>

        <PublisherDashboard
          customArticles={customArticles}
          onSaveCustomArticles={handleSaveCustomArticles}
          onOpenArticle={(article) => setActiveArticleId(article.id)}
          onShowToast={showToast}
        />

        <section className="section about-section" id="about">
          <div className="container about-grid">
            <div>
              <div className="eyebrow">ABOUT THIS PROJECT</div>
              <h2>Public information should be easy to access.</h2>
            </div>
            <div>
              <p>
                This student design-thinking prototype explores a more accessible way for citizens,
                businesses, journalists, researchers, civil-society organisations and Basotho
                living abroad to discover government news.
              </p>
              <p>
                <strong>Prototype notice:</strong> the articles shown here are sample content for
                demonstrating the interface. They are not confirmed government announcements. A
                production website would need approved content, verified source links, publishing
                controls and secure data storage.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="container footer-main">
          <a className="brand brand-footer" href="#home">
            <span className="brand-mark">
              <LesothoFlagLogo />
            </span>
            <span className="brand-copy">
              <strong>Government News</strong>
              <small>Public Access Portal · Prototype</small>
            </span>
          </a>
          <div className="footer-links">
            <a href="#home">Home</a>
            <a href="#latest">Latest news</a>
            <a href="#archive">Archive</a>
            <a href="#about">About</a>
          </div>
          <a href="#home" className="back-top">
            Back to top ↑
          </a>
        </div>
        <div className="container footer-bottom">
          <span>© 2026 Public Access to Government News — student prototype</span>
          <span>Designed for access · discovery · trust</span>
        </div>
      </footer>

      <ArticleModal
        article={activeArticle}
        language={language}
        isPlaying={activeArticle ? playingArticleId === activeArticle.id : false}
        isSaved={activeArticle ? savedIds.includes(String(activeArticle.id)) : false}
        onClose={() => setActiveArticleId(null)}
        onChangeLanguage={(lang) => handleLanguageChange(lang, true)}
        onListen={handleListen}
        onShare={handleShare}
        onSave={handleSaveArticle}
      />

      <div
        className={`toast${toastVisible ? ' show' : ''}`}
        id="toast"
        role="status"
        aria-live="polite"
      >
        {toastMessage}
      </div>
    </>
  );
}

export default App;
