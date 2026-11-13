import React, { useEffect, useRef } from 'react';
import { Article, LanguageCode } from '../types';
import {
  DEPARTMENT_IMAGES,
  formatDate,
  getArticleImage,
  getLocalizedArticle,
} from '../data/articles';

interface ArticleModalProps {
  article: Article | null;
  language: LanguageCode;
  isPlaying: boolean;
  isSaved: boolean;
  onClose: () => void;
  onChangeLanguage: (lang: LanguageCode) => void;
  onListen: (article: Article) => void;
  onShare: (article: Article) => void;
  onSave: (articleId: number) => void;
}

export const ArticleModal: React.FC<ArticleModalProps> = ({
  article,
  language,
  isPlaying,
  isSaved,
  onClose,
  onChangeLanguage,
  onListen,
  onShare,
  onSave,
}) => {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (article) {
      if (!dialog.open && typeof dialog.showModal === 'function') {
        dialog.showModal();
      }
    } else if (dialog.open) {
      dialog.close();
    }
  }, [article]);

  if (!article) {
    return <dialog id="articleDialog" ref={dialogRef} className="article-dialog" />;
  }

  const localized = getLocalizedArticle(article, language);
  const { image, alt } = getArticleImage(article);
  const deptMedia = DEPARTMENT_IMAGES[article.category] || DEPARTMENT_IMAGES['Public Notices'];

  return (
    <dialog
      id="articleDialog"
      ref={dialogRef}
      className="article-dialog"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === dialogRef.current) {
          onClose();
        }
      }}
    >
      <button
        type="button"
        className="dialog-close"
        id="dialogClose"
        aria-label="Close article"
        onClick={onClose}
      >
        ×
      </button>
      <div id="articleContent">
        <div className="article-content">
          <div className="article-language-control">
            <label htmlFor="articleLanguageSelect">
              {language === 'st'
                ? 'Puo ea sengoloa / Fetola puo:'
                : 'Reading language / Switch language:'}
            </label>
            <select
              id="articleLanguageSelect"
              aria-label="Choose article reading language"
              value={language}
              onChange={(e) => onChangeLanguage(e.target.value as LanguageCode)}
            >
              <option value="en">English</option>
              <option value="st">Sesotho</option>
            </select>
            <small>
              {language === 'st'
                ? 'Mamela ho mamela sengoloa ka puo e khethiloeng. Liphetolelo li fumaneha feela bakeng sa litaba tse fetoletsoeng.'
                : 'Choose a language before reading or listening. Sesotho is shown where a translation is available.'}
            </small>
          </div>

          <div className="article-hero-image-wrap">
            <img
              src={image}
              alt={alt}
              className="article-hero-image"
              referrerPolicy="no-referrer"
            />
          </div>

          <div className="article-category-row">
            <img
              src={deptMedia.logo}
              alt={deptMedia.logoAlt}
              className="article-ministry-inline-logo"
              referrerPolicy="no-referrer"
            />
            <div className="article-category">{article.category.toUpperCase()}</div>
          </div>

          <h2>{localized.title}</h2>
          <div className="article-meta">
            {formatDate(article.date)} · {article.ministry} · Prototype content
          </div>

          {localized.translationMissing && (
            <p className="translation-note">
              Sesotho version is not available for this article yet. The English text is shown.
            </p>
          )}

          <p>{localized.summary}</p>
          <p>{localized.body}</p>
          <p>
            {language === 'st'
              ? 'Netefatsa litaba le lekala le ikarabellang pele u li sebelisa kapa u li arolelana.'
              : 'Readers should check the responsible ministry and original publication before relying on or sharing official information.'}
          </p>

          <p>
            {article.sourceUrl ? (
              <a
                className="source-link"
                href={article.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Open the supplied source ↗
              </a>
            ) : (
              <a
                className="source-link"
                href="https://www.gov.ls/news/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Visit the Government of Lesotho news page ↗
              </a>
            )}
          </p>

          <div className="article-warning">
            <strong>{language === 'st' ? 'Tsebiso:' : 'Prototype notice:'}</strong>{' '}
            {language === 'st'
              ? "Sengoloa sena ke sa mohlala, ha se phatlalatso ea 'muso e netefalitsoeng."
              : 'This is sample content created to demonstrate the website. It is not a verified government announcement. Do not rely on it as official information.'}
          </div>

          <div className="article-actions">
            <button
              type="button"
              className="button button-primary"
              onClick={() => onListen(article)}
            >
              {isPlaying
                ? language === 'st'
                  ? 'Ⅱ Emisa'
                  : 'Ⅱ Stop'
                : language === 'st'
                ? '▶ Mamela'
                : '▶ Listen to article'}
            </button>
            <button
              type="button"
              className="button button-outline"
              onClick={() => onShare(article)}
            >
              ↗ {language === 'st' ? 'Arolelana' : 'Share this article'}
            </button>
            <button
              type="button"
              className="button button-outline"
              onClick={() => onSave(article.id)}
            >
              {isSaved
                ? '✓ Saved in this browser'
                : `☆ ${language === 'st' ? 'Boloka sengoloa' : 'Save article'}`}
            </button>
          </div>
        </div>
      </div>
    </dialog>
  );
};
