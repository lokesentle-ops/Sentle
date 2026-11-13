const articles = [
  {id:1,title:"Public notice: community consultation meetings",category:"Public Notices",ministry:"Ministry of Local Government",date:"2026-10-24",symbol:"⚑",visual:"notice",summary:"A sample notice showing how residents could find details about upcoming community consultation meetings.",body:"This sample article demonstrates how a public notice could be presented as an individual story. A real notice should include confirmed dates, venues, eligibility details and a link to the responsible department's official publication."},
  {id:2,title:"Health services: information for local communities",category:"Health",ministry:"Ministry of Health",date:"2026-10-21",symbol:"✚",visual:"health",summary:"A sample public information story illustrating how health-related updates could be organised and shared.",body:"This demonstration article represents the kind of public health information readers may want to locate quickly. In a live service, the content would be supplied and approved by the responsible ministry, with links to official guidance."},
  {id:3,title:"Education and skills development programme update",category:"Education",ministry:"Ministry of Education and Training",date:"2026-10-18",symbol:"▣",visual:"education",summary:"A sample update about education and skills, designed to be easier to discover than a full newspaper PDF.",body:"This sample shows how an education update could have its own page, publication date, ministry label and sharing link. The prototype does not represent a confirmed government programme."},
  {id:4,title:"Community development project information",category:"Development",ministry:"Ministry of Development Planning",date:"2026-10-12",symbol:"⌂",visual:"development",summary:"A demonstration story about community development and access to public information.",body:"A live article could include the project location, responsible department, milestones and related public documents. This sample content is illustrative only and has not been verified as an official announcement."},
  {id:5,title:"Reminder: check official deadlines and announcements",category:"Public Notices",ministry:"Government Information Desk",date:"2026-10-08",symbol:"◷",visual:"public",summary:"A sample reminder showing how readers could quickly locate time-sensitive public notices.",body:"This example illustrates a time-sensitive announcement format. Real publication dates and deadlines must be confirmed by the responsible authority before this information is shared with the public."},
  {id:6,title:"Public services information for residents",category:"Development",ministry:"Government Information Desk",date:"2026-09-29",symbol:"⌂",visual:"development",summary:"A sample information story for residents looking for government services and public updates.",body:"This illustrative article demonstrates a simple reading layout for public-service information. A production system should provide verified details, contact information and a link to the official source."}
 ];
const sampleSesotho = {
  1: { titleSt: "Tsebiso ea sechaba: liboka tsa lipuisano metseng", summarySt: "Tsebiso ea mohlala e bontšang kamoo baahi ba ka fumanang lintlha ka liboka tsa lipuisano tsa sechaba.", bodySt: "Sengoloa sena ke mohlala oa kamoo tsebiso ea sechaba e ka hlahisoang kateng. Tsebiso ea sebele e lokela ho ba le matsatsi, libaka le lintlha tse netefalitsoeng hammoho le sehokelo sa phatlalatso ea semmuso." },
  2: { titleSt: "Litšebeletso tsa bophelo: lintlha bakeng sa sechaba", summarySt: "Sengoloa sa mohlala se bontšang kamoo litaba tsa bophelo bo botle li ka hlophisoang le ho arolelanoa kateng.", bodySt: "Sengoloa sena sa pontšo se bontša mofuta oa litaba tsa bophelo bo botle tseo batho ba ka batlang ho li fumana kapele. Webosaeteng ea sebele, litaba li lokela ho fanoa le ho amoheloa ke lekala le ikarabellang." },
  3: { titleSt: "Ntlafatso ea lenaneo la thuto le litsebo", summarySt: "Tsebiso ea mohlala mabapi le thuto le litsebo, e etselitsoeng ho fumaneha habonolo.", bodySt: "Mohlala ona o bontša kamoo litaba tsa thuto li ka bang le sehlooho, letsatsi la phatlalatso le lebitso la lekala. Litaba tsena ha se lenaneo la 'muso le netefalitsoeng." },
  4: { titleSt: "Lintlha ka morero oa ntlafatso ea sechaba", summarySt: "Sengoloa sa mohlala mabapi le ntlafatso ea sechaba le phihlello ea litaba tsa sechaba.", bodySt: "Sengoloa sa sebele se ka kenyelletsa sebaka sa morero, lefapha le ikarabellang le mehato ea mosebetsi. Litaba tsena ke tsa mohlala feela 'me ha lia netefatsoa e le phatlalatso ea semmuso." },
  5: { titleSt: "Khopotso: hlahloba linako le liphatlalatso tsa semmuso", summarySt: "Khopotso ea mohlala e bontšang kamoo batho ba ka fumanang litsebiso tsa bohlokoa kapele.", bodySt: "Mohlala ona o bontša mokhoa oa ho hlahisa tsebiso e nang le nako e behiloeng. Matsatsi le linako tsa sebele li lokela ho netefatsoa ke ba boholong pele litaba li arolelanoa." },
  6: { titleSt: "Lintlha tsa litšebeletso tsa sechaba bakeng sa baahi", summarySt: "Sengoloa sa mohlala bakeng sa baahi ba batlang litšebeletso tsa 'muso le litaba tsa sechaba.", bodySt: "Sengoloa sena se bontša mokhoa o bonolo oa ho bala litaba tsa litšebeletso tsa sechaba. Sistimi ea sebele e lokela ho fana ka lintlha tse netefalitsoeng le sehokelo sa mohloli oa semmuso." }
};
let currentArticleId = null;
function localizedArticle(article) {
  const sesotho = document.getElementById("languageSelect")?.value === "st";
  if (!sesotho) return article;
  const translated = { ...(sampleSesotho[article.id] || {}), ...article };
  // Publisher-entered Sesotho fields take precedence over sample translations.
  const fallback = sampleSesotho[article.id] || {};
  return {
    ...article,
    title: article.titleSt || fallback.titleSt || article.title,
    summary: article.summarySt || fallback.summarySt || article.summary,
    body: article.bodySt || fallback.bodySt || article.body,
    translationMissing: !(article.titleSt && article.summarySt && article.bodySt) && !(fallback.titleSt && fallback.summarySt && fallback.bodySt)
  };
}
let selectedCategory = "All";
let currentQuery = "";
let archiveAfter = "";
const CUSTOM_KEY = "governmentNewsCustomArticles";
const newsGrid = document.getElementById("newsGrid");
const resultsNote = document.getElementById("resultsNote");
const emptyState = document.getElementById("emptyState");
const toast = document.getElementById("toast");
let toastTimer;

function formatDate(dateString) {
  return new Date(dateString + "T12:00:00").toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"});
}
function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
}
function allArticles() {
  let custom = [];
  try { custom = JSON.parse(localStorage.getItem(CUSTOM_KEY) || "[]"); } catch (e) {}
  return [...articles, ...custom];
}
function getVisibleArticles() {
  const sort = document.getElementById("sortSelect").value;
  return allArticles().filter(a => {
    const text = `${a.title} ${a.category} ${a.ministry} ${a.summary} ${a.body}`.toLowerCase();
    return (a.status === "published" || !a.status) &&
      (selectedCategory === "All" || a.category === selectedCategory) &&
      (!currentQuery || text.includes(currentQuery.toLowerCase())) &&
      (!archiveAfter || a.date >= archiveAfter);
  }).sort((a,b) => sort === "oldest" ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date));
}
function renderArticles() {
  const visible = getVisibleArticles();
  newsGrid.innerHTML = visible.map(original => {
    const a = localizedArticle(original);
    return `
    <article class="news-card">
      <div class="card-visual visual-${a.visual}">
        <span class="category-pill">${a.category}</span>
        <span class="visual-symbol" aria-hidden="true">${a.symbol}</span>
      </div>
      <div class="card-body">
        <div class="card-meta"><span>${formatDate(a.date)}</span><span>·</span><span class="source-check">✓ Sample source label</span></div>
        <h3>${a.title}</h3>
        <p>${a.summary}</p>
        <div class="card-bottom">
          <button class="read-link" data-read="${a.id}">${document.getElementById("languageSelect").value === "st" ? "Bala litaba →" : "Read article →"}</button>
          <button class="listen-card-button" data-listen="${a.id}">▶ ${document.getElementById("languageSelect").value === "st" ? "Mamela" : "Listen"}</button>
          <button class="share-button" data-share="${a.id}" aria-label="Share ${a.title}">↗ ${document.getElementById("languageSelect").value === "st" ? "Arolelana" : "Share"}</button>
        </div>
      </div>
    </article>`;
  }).join("");
  resultsNote.textContent = `${visible.length} sample ${visible.length === 1 ? "story" : "stories"} found${currentQuery ? ` for “${currentQuery}”` : ""}${selectedCategory !== "All" ? ` in ${selectedCategory}` : ""}${archiveAfter ? ` after ${formatDate(archiveAfter)}` : ""}.`;
  emptyState.classList.toggle("hidden", visible.length !== 0);
  newsGrid.classList.toggle("hidden", visible.length === 0);
}
function setCategory(category) {
  selectedCategory = category;
  document.querySelectorAll(".filter-tab").forEach(btn => btn.classList.toggle("selected", btn.dataset.category === category));
  renderArticles();
}
function openArticle(id) {
  const original = allArticles().find(item => item.id === Number(id));
  if (!original) return;
  currentArticleId = original.id;
  const a = localizedArticle(original);
  const language = document.getElementById("languageSelect").value;
  document.getElementById("articleContent").innerHTML = `
    <div class="article-content">
      <div class="article-language-control">
        <label for="articleLanguageSelect">${language === "st" ? "Puo ea sengoloa / Fetola puo:" : "Reading language / Switch language:"}</label>
        <select id="articleLanguageSelect" aria-label="Choose article reading language">
          <option value="en" ${language === "en" ? "selected" : ""}>English</option>
          <option value="st" ${language === "st" ? "selected" : ""}>Sesotho</option>
        </select>
        <small>${language === "st" ? "Mamela ho mamela sengoloa ka puo e khethiloeng. Liphetolelo li fumaneha feela bakeng sa litaba tse fetoletsoeng." : "Choose a language before reading or listening. Sesotho is shown where a translation is available."}</small>
      </div>
      <div class="article-category">${original.category.toUpperCase()}</div>
      <h2>${a.title}</h2>
      <div class="article-meta">${formatDate(original.date)} · ${original.ministry} · Prototype content</div>
      ${a.translationMissing ? `<p class="translation-note">Sesotho version is not available for this article yet. The English text is shown.</p>` : ""}
      <p>${a.summary}</p><p>${a.body}</p>
      <p>${language === "st" ? "Netefatsa litaba le lekala le ikarabellang pele u li sebelisa kapa u li arolelana." : "Readers should check the responsible ministry and original publication before relying on or sharing official information."}</p>
      ${original.sourceUrl ? `<p><a class="source-link" href="${original.sourceUrl}" target="_blank" rel="noopener noreferrer">Open the supplied source ↗</a></p>` : `<p><a class="source-link" href="https://www.gov.ls/news/" target="_blank" rel="noopener noreferrer">Visit the Government of Lesotho news page ↗</a></p>`}
      <div class="article-warning"><strong>${language === "st" ? "Tsebiso:" : "Prototype notice:"}</strong> ${language === "st" ? "Sengoloa sena ke sa mohlala, ha se phatlalatso ea 'muso e netefalitsoeng." : "This is sample content created to demonstrate the website. It is not a verified government announcement. Do not rely on it as official information."}</div>
      <div class="article-actions"><button class="button button-primary" data-listen="${original.id}">▶ ${language === "st" ? "Mamela" : "Listen to article"}</button><button class="button button-outline" data-share="${original.id}">↗ ${language === "st" ? "Arolelana" : "Share this article"}</button><button class="button button-outline" data-save="${original.id}">☆ ${language === "st" ? "Boloka sengoloa" : "Save article"}</button></div>
    </div>`;
  const dialog = document.getElementById("articleDialog");
  if (typeof dialog.showModal === "function" && !dialog.open) dialog.showModal();
  else showToast("Your browser does not support the article pop-up.");
}
async function shareArticle(id) {
  const a = allArticles().find(item => item.id === Number(id));
  if (!a) return;
  const shareData = {title:a.title,text:`${a.title} — sample government news prototype`};
  if (navigator.share) {
    try { await navigator.share(shareData); } catch (e) { /* user cancelled sharing */ }
  } else if (navigator.clipboard && window.isSecureContext) {
    try { await navigator.clipboard.writeText(`${a.title}\n${a.summary}`); showToast("Article title and summary copied to clipboard."); }
    catch (e) { showToast("Sharing is not available in this browser."); }
  } else {
    showToast("Sharing demo: " + a.title);
  }
}
function runSearch(query) {
  currentQuery = query.trim();
  archiveAfter = "";
  document.getElementById("archiveDate").value = "";
  document.getElementById("archiveKeyword").value = "";
  document.getElementById("searchInput").value = query;
  setCategory("All");
  document.getElementById("latest").scrollIntoView({behavior:"smooth"});
}

document.getElementById("searchForm").addEventListener("submit", e => {
  e.preventDefault();
  runSearch(document.getElementById("searchInput").value);
});
document.querySelectorAll(".hint").forEach(btn => btn.addEventListener("click", () => runSearch(btn.dataset.search)));
document.getElementById("categoryTabs").addEventListener("click", e => {
  const btn = e.target.closest("[data-category]");
  if (btn) { currentQuery = ""; archiveAfter = ""; document.getElementById("searchInput").value = ""; setCategory(btn.dataset.category); }
});
document.getElementById("sortSelect").addEventListener("change", renderArticles);
document.querySelectorAll(".topic-card").forEach(btn => btn.addEventListener("click", () => {
  currentQuery = ""; document.getElementById("searchInput").value = "";
  setCategory(btn.dataset.topic);
  document.getElementById("latest").scrollIntoView({behavior:"smooth"});
}));
document.getElementById("archiveForm").addEventListener("submit", e => {
  e.preventDefault();
  currentQuery = document.getElementById("archiveKeyword").value.trim();
  selectedCategory = document.getElementById("archiveTopic").value;
  archiveAfter = document.getElementById("archiveDate").value;
  document.getElementById("searchInput").value = currentQuery;
  document.querySelectorAll(".filter-tab").forEach(btn => btn.classList.toggle("selected", btn.dataset.category === selectedCategory));
  renderArticles();
  document.getElementById("latest").scrollIntoView({behavior:"smooth"});
});
document.getElementById("clearFilters").addEventListener("click", () => {
  currentQuery = ""; archiveAfter = ""; selectedCategory = "All";
  document.getElementById("searchInput").value = "";
  document.getElementById("archiveKeyword").value = "";
  document.getElementById("archiveDate").value = "";
  document.getElementById("archiveTopic").value = "All";
  document.getElementById("sortSelect").value = "newest";
  setCategory("All");
});
newsGrid.addEventListener("click", e => {
  const read = e.target.closest("[data-read]");
  const share = e.target.closest("[data-share]");
  const listen = e.target.closest(".listen-card-button");
  if (read) openArticle(read.dataset.read);
  if (share) shareArticle(share.dataset.share);
  if (listen) speakArticle(listen.dataset.listen, listen);
});
document.getElementById("articleContent").addEventListener("change", e => {
  if (e.target.id === "articleLanguageSelect") {
    const selectedLanguage = e.target.value;
    window.speechSynthesis?.cancel();
    document.getElementById("languageSelect").value = selectedLanguage;
    setInterfaceLanguage(selectedLanguage);
    renderArticles();
    if (currentArticleId !== null) openArticle(currentArticleId);
    showToast(selectedLanguage === "st" ? "Puo ea ho bala e fetotsoe ho Sesotho." : "Article reading language changed to English.");
  }
});
document.getElementById("articleContent").addEventListener("click", e => {
  const listen = e.target.closest("[data-listen]");
  const share = e.target.closest("[data-share]");
  const save = e.target.closest("[data-save]");
  if (listen) speakArticle(listen.dataset.listen, listen);
  if (share) shareArticle(share.dataset.share);
  if (save) {
    const id = save.dataset.save;
    let saved = [];
    try { saved = JSON.parse(localStorage.getItem("savedGovernmentNews") || "[]"); } catch(e) {}
    if (!saved.includes(id)) saved.push(id);
    localStorage.setItem("savedGovernmentNews", JSON.stringify(saved));
    save.textContent = "✓ Saved in this browser";
    showToast("Article saved in this browser.");
  }
});
function speakArticle(id, button) {
  if (!("speechSynthesis" in window) || !("SpeechSynthesisUtterance" in window)) {
    showToast("Text-to-speech is not supported in this browser."); return;
  }
  if (button?.dataset.playing === "true") {
    window.speechSynthesis.cancel(); button.dataset.playing = "false";
    button.textContent = document.getElementById("languageSelect").value === "st" ? "▶ Mamela" : "▶ Listen"; return;
  }
  const original = allArticles().find(item => item.id === Number(id));
  if (!original) return;
  const article = localizedArticle(original);
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(`${article.title}. ${article.summary}. ${article.body}`);
  utterance.lang = document.getElementById("languageSelect").value === "st" ? "st-LS" : "en-GB";
  utterance.onend = () => { if (button) { button.dataset.playing = "false"; button.textContent = document.getElementById("languageSelect").value === "st" ? "▶ Mamela" : "▶ Listen"; } };
  utterance.onerror = () => { if (button) button.dataset.playing = "false"; showToast("Playback failed. Your device may not have a suitable voice for this language."); };
  window.speechSynthesis.speak(utterance);
  if (button) { button.dataset.playing = "true"; button.textContent = document.getElementById("languageSelect").value === "st" ? "Ⅱ Emisa" : "Ⅱ Stop"; }
}
document.getElementById("contrastToggle").addEventListener("click", () => {
  document.body.classList.toggle("high-contrast");
  showToast(document.body.classList.contains("high-contrast") ? "High contrast enabled." : "High contrast disabled.");
});
document.getElementById("menuToggle").addEventListener("click", () => {
  const nav = document.getElementById("mainNav");
  const open = nav.classList.toggle("open");
  document.getElementById("menuToggle").setAttribute("aria-expanded", String(open));
});
document.querySelectorAll(".main-nav a").forEach(a => a.addEventListener("click", () => {
  document.getElementById("mainNav").classList.remove("open");
  document.getElementById("menuToggle").setAttribute("aria-expanded","false");
}));

const sesothoLabels = {
  navArchive: "Litaba tsa khale",
  navAbout: "Ka rona",
  heroTitle: "Litaba tsa 'muso, li fumaneha habonolo.",
  heroText: "Fumana liphatlalatso le litaba tsa bohlokoa sebakeng se le seng.",
  latestTitle: "Litaba tsa morao-rao",
  searchButton: "Batla litaba"
};
const englishLabels = {
  navArchive: "News archive",
  navAbout: "About",
  heroTitle: "Government news, made easier to find.",
  heroText: "Discover announcements, public notices and national updates in one simple place. Search individual stories without downloading an entire newspaper.",
  latestTitle: "Latest government news",
  searchButton: "Search news"
};
function setInterfaceLanguage(language) {
  const dict = language === "st" ? sesothoLabels : englishLabels;
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.dataset.i18n;
    if (dict[key]) el.textContent = dict[key];
  });
  const title = document.querySelector(".hero h1");
  if (title) {
    if (language === "st") title.textContent = dict.heroTitle;
    else title.innerHTML = 'Government news, <em>made easier to find.</em>';
  }
  const heroText = document.querySelector(".hero-copy > p");
  if (heroText) heroText.textContent = dict.heroText;
  const latestTitle = document.querySelector("#latest .section-heading h2");
  if (latestTitle) latestTitle.textContent = dict.latestTitle;
  const searchButton = document.querySelector("#searchForm button");
  if (searchButton) searchButton.textContent = dict.searchButton;
}
document.getElementById("publisherDate").value = new Date().toISOString().slice(0,10);
const publisherForm = document.getElementById("publisherForm");
const publisherArticleList = document.getElementById("publisherArticleList");
const adminReviewList = document.getElementById("adminReviewList");
const publisherStats = document.getElementById("publisherStats");
function readCustomArticles() { try { return JSON.parse(localStorage.getItem(CUSTOM_KEY) || "[]"); } catch (e) { return []; } }
function writeCustomArticles(items) { localStorage.setItem(CUSTOM_KEY, JSON.stringify(items)); }
function statusLabel(status) {
  return ({ draft: "Draft", pending_review: "Pending review", changes_requested: "Changes requested", published: "Published", rejected: "Not approved" })[status || "published"] || "Draft";
}
function createStatusBadge(status) {
  const badge = document.createElement("span"); badge.className = `submission-status status-${status || "published"}`; badge.textContent = statusLabel(status); return badge;
}
function renderPublisherArticles() {
  const session = getDemoSession();
  if (!session || session.role !== "publisher") return;
  const mine = readCustomArticles().filter(item => item.author === session.username);
  const count = status => mine.filter(item => (item.status || "published") === status).length;
  publisherStats.replaceChildren();
  [["Total articles", mine.length], ["Drafts", count("draft")], ["Pending review", count("pending_review")], ["Published", count("published")]].forEach(([label, value]) => {
    const card = document.createElement("div"); card.className = "publisher-stat";
    const number = document.createElement("strong"); number.textContent = value;
    const caption = document.createElement("span"); caption.textContent = label;
    card.append(number, caption); publisherStats.appendChild(card);
  });
  publisherArticleList.replaceChildren();
  if (!mine.length) { const empty = document.createElement("p"); empty.className = "form-help"; empty.textContent = "You have not created any articles yet. Use the form below to start a story."; publisherArticleList.appendChild(empty); return; }
  mine.slice().sort((a,b) => (b.updatedAt || b.createdAt || "").localeCompare(a.updatedAt || a.createdAt || "")).forEach(item => {
    const card = document.createElement("article"); card.className = "submission-card";
    const head = document.createElement("div"); head.className = "submission-card-head";
    const title = document.createElement("strong"); title.textContent = item.title || "Untitled draft";
    head.append(title, createStatusBadge(item.status));
    const meta = document.createElement("p"); meta.className = "submission-meta"; meta.textContent = `${item.category || "No category"} · Updated ${new Date(item.updatedAt || item.createdAt || Date.now()).toLocaleDateString()}`;
    card.append(head, meta);
    if (item.reviewNote) { const note = document.createElement("p"); note.className = "review-note"; note.textContent = `Administrator note: ${item.reviewNote}`; card.appendChild(note); }
    const actions = document.createElement("div"); actions.className = "submission-actions";
    if (["draft", "changes_requested", "rejected"].includes(item.status || "published")) {
      const edit = document.createElement("button"); edit.type = "button"; edit.className = "button button-outline"; edit.textContent = "Edit"; edit.addEventListener("click", () => loadArticleForEditing(item.id)); actions.appendChild(edit);
      const remove = document.createElement("button"); remove.type = "button"; remove.className = "button button-outline danger-button"; remove.textContent = "Delete draft"; remove.addEventListener("click", () => deletePublisherArticle(item.id)); actions.appendChild(remove);
    }
    if ((item.status || "published") === "published") {
      const view = document.createElement("button"); view.type = "button"; view.className = "button button-outline"; view.textContent = "View public article"; view.addEventListener("click", () => { document.getElementById("latest").scrollIntoView({behavior:"smooth"}); openArticle(item.id); }); actions.appendChild(view);
    }
    card.appendChild(actions); publisherArticleList.appendChild(card);
  });
}
function renderAdminReviewQueue() {
  if (!adminReviewList) return;
  adminReviewList.replaceChildren();
  const pending = readCustomArticles().filter(item => item.status === "pending_review");
  if (!pending.length) { const empty = document.createElement("p"); empty.className = "form-help"; empty.textContent = "No submissions are waiting for review."; adminReviewList.appendChild(empty); return; }
  pending.slice().reverse().forEach(item => {
    const card = document.createElement("article"); card.className = "submission-card";
    const title = document.createElement("strong"); title.textContent = item.title || "Untitled article";
    const meta = document.createElement("p"); meta.className = "submission-meta"; meta.textContent = `${item.category} · Submitted by ${item.author || "publisher"} · ${item.ministry || "Source not provided"}`;
    const summary = document.createElement("p"); summary.textContent = item.summary || "No summary entered.";
    const source = document.createElement("p"); source.className = "submission-meta"; source.textContent = item.sourceUrl ? `Source: ${item.sourceUrl}` : "No official source URL supplied.";
    const noteLabel = document.createElement("label"); noteLabel.textContent = "Review note (optional)";
    const note = document.createElement("textarea"); note.rows = 2; note.maxLength = 300; note.placeholder = "Explain any changes needed"; noteLabel.appendChild(note);
    const actions = document.createElement("div"); actions.className = "submission-actions";
    const approve = document.createElement("button"); approve.type = "button"; approve.className = "button button-primary"; approve.textContent = "Approve and publish"; approve.addEventListener("click", () => reviewArticle(item.id, "published", note.value.trim()));
    const request = document.createElement("button"); request.type = "button"; request.className = "button button-outline"; request.textContent = "Request changes"; request.addEventListener("click", () => { if (!note.value.trim()) { showToast("Add a short note explaining the changes required."); note.focus(); return; } reviewArticle(item.id, "changes_requested", note.value.trim()); });
    actions.append(approve, request); card.append(title, meta, summary, source, noteLabel, actions); adminReviewList.appendChild(card);
  });
}
function reviewArticle(id, status, note) {
  const session = getDemoSession(); if (!session || session.role !== "admin") { showToast("Only an administrator can review submissions."); return; }
  const items = readCustomArticles(); const index = items.findIndex(item => item.id === Number(id)); if (index < 0) return;
  items[index].status = status; items[index].reviewNote = note; items[index].reviewedBy = session.username; items[index].reviewedAt = new Date().toISOString(); items[index].updatedAt = new Date().toISOString();
  writeCustomArticles(items); renderAdminReviewQueue(); renderPublisherArticles(); renderArticles();
  showToast(status === "published" ? "Article approved and published in this browser." : "Changes requested. The publisher can edit and resubmit.");
}
function loadArticleForEditing(id) {
  const session = getDemoSession(); const item = readCustomArticles().find(article => article.id === Number(id));
  if (!session || session.role !== "publisher" || !item || item.author !== session.username) { showToast("You can only edit your own saved drafts."); return; }
  document.getElementById("publisherEditingId").value = String(item.id);
  document.getElementById("publisherTitle").value = item.title || ""; document.getElementById("publisherCategory").value = item.category || "Public Notices";
  document.getElementById("publisherDate").value = item.date || new Date().toISOString().slice(0,10); document.getElementById("publisherMinistry").value = item.ministry || "";
  document.getElementById("publisherSource").value = item.sourceUrl || ""; document.getElementById("publisherSummary").value = item.summary || ""; document.getElementById("publisherBody").value = item.body || "";
  document.getElementById("publisherTitleSt").value = item.titleSt || ""; document.getElementById("publisherSummarySt").value = item.summarySt || ""; document.getElementById("publisherBodySt").value = item.bodySt || "";
  document.getElementById("publisherConfirmed").checked = false; document.getElementById("publisherFormHeading").textContent = "Edit news story"; document.getElementById("submitReviewButton").textContent = "Resubmit for review"; document.getElementById("cancelEditButton").classList.remove("hidden");
  publisherForm.scrollIntoView({behavior:"smooth", block:"start"});
}
function resetPublisherEditor() { publisherForm.reset(); document.getElementById("publisherEditingId").value = ""; document.getElementById("publisherDate").value = new Date().toISOString().slice(0,10); document.getElementById("publisherFormHeading").textContent = "Create a news story"; document.getElementById("submitReviewButton").textContent = "Submit for review"; document.getElementById("cancelEditButton").classList.add("hidden"); }
function savePublisherArticle(status) {
  const session = getDemoSession(); if (!session || session.role !== "publisher") { showToast("Please sign in with a publisher account first."); return; }
  const title = document.getElementById("publisherTitle").value.trim();
  if (status !== "draft") {
    if (!publisherForm.reportValidity()) return;
    if (!document.getElementById("publisherConfirmed").checked) { showToast("Confirm that the article has been checked before submitting it."); return; }
  }
  if (status === "draft" && !title && !document.getElementById("publisherBody").value.trim()) { showToast("Enter a title or some article text before saving a draft."); return; }
  const category = document.getElementById("publisherCategory").value;
  const editingId = Number(document.getElementById("publisherEditingId").value || 0);
  const items = readCustomArticles();
  const oldIndex = editingId ? items.findIndex(item => item.id === editingId && item.author === session.username) : -1;
  if (editingId && oldIndex < 0) { showToast("This article cannot be edited from the current account."); return; }
  const old = oldIndex >= 0 ? items[oldIndex] : {};
  const item = { ...old, id: editingId || Date.now(), title, category, ministry: document.getElementById("publisherMinistry").value.trim(), date: document.getElementById("publisherDate").value || new Date().toISOString().slice(0,10), sourceUrl: document.getElementById("publisherSource").value.trim(), symbol: ({"Public Notices":"⚑",Health:"✚",Education:"▣",Development:"⌂"})[category] || "▤", visual: ({"Public Notices":"notice",Health:"health",Education:"education",Development:"development"})[category] || "public", summary: document.getElementById("publisherSummary").value.trim(), body: document.getElementById("publisherBody").value.trim(), titleSt: document.getElementById("publisherTitleSt").value.trim(), summarySt: document.getElementById("publisherSummarySt").value.trim(), bodySt: document.getElementById("publisherBodySt").value.trim(), author: session.username, status, isCustom: true, createdAt: old.createdAt || new Date().toISOString(), updatedAt: new Date().toISOString(), reviewNote: status === "pending_review" ? "" : (old.reviewNote || "") };
  if (oldIndex >= 0) items[oldIndex] = item; else items.unshift(item);
  writeCustomArticles(items); resetPublisherEditor(); renderPublisherArticles(); renderAdminReviewQueue(); renderArticles();
  showToast(status === "draft" ? "Draft saved. You can edit it later." : "Article submitted for administrator review. It is not public yet.");
}
function deletePublisherArticle(id) {
  const session = getDemoSession(); const items = readCustomArticles(); const item = items.find(article => article.id === Number(id));
  if (!session || session.role !== "publisher" || !item || item.author !== session.username || !["draft", "changes_requested", "rejected"].includes(item.status)) { showToast("Only your own drafts or returned articles can be deleted."); return; }
  if (!confirm("Delete this draft? This cannot be undone.")) return;
  writeCustomArticles(items.filter(article => article.id !== Number(id))); renderPublisherArticles(); showToast("Draft deleted.");
}
document.getElementById("saveDraftButton").addEventListener("click", () => savePublisherArticle("draft"));
document.getElementById("cancelEditButton").addEventListener("click", resetPublisherEditor);
publisherForm.addEventListener("submit", e => { e.preventDefault(); savePublisherArticle("pending_review"); });

// Demonstration login and administrator-created publisher accounts.
const DEMO_USERS_KEY = "governmentNewsDemoUsers";
const DEMO_SESSION_KEY = "governmentNewsDemoSession";
function readDemoUsers() { try { return JSON.parse(localStorage.getItem(DEMO_USERS_KEY) || "[]"); } catch (e) { return []; } }
function getDemoSession() { try { return JSON.parse(sessionStorage.getItem(DEMO_SESSION_KEY) || "null"); } catch (e) { return null; } }
function setAuthView(user) {
  const login = document.getElementById("loginForm");
  const adminPanel = document.getElementById("adminPanel");
  const workspace = document.getElementById("publisherWorkspace");
  const publisherForm = document.getElementById("publisherForm");
  login.classList.toggle("hidden", !!user);
  adminPanel.classList.toggle("hidden", !user || user.role !== "admin");
  workspace.classList.toggle("hidden", !user || user.role !== "publisher");
  publisherForm.classList.toggle("hidden", !user || user.role !== "publisher");
  document.getElementById("publisherAuthWrap").classList.remove("hidden");
  if (user?.role === "publisher") document.getElementById("publisherWelcome").textContent = `Signed in as ${user.username}`;
  if (user?.role === "publisher") renderPublisherArticles();
  if (user?.role === "admin") renderAdminReviewQueue();
}
document.getElementById("loginForm").addEventListener("submit", e => {
  e.preventDefault();
  const username = document.getElementById("loginUsername").value.trim();
  const password = document.getElementById("loginPassword").value;
  let user = null;
  if (username === "admin" && password === "Admin123!") user = { username: "admin", role: "admin" };
  else user = readDemoUsers().find(item => item.username === username && item.password === password) || null;
  if (!user) { document.getElementById("loginMessage").textContent = "Login failed. Check your username and password."; return; }
  sessionStorage.setItem(DEMO_SESSION_KEY, JSON.stringify({ username: user.username, role: user.role }));
  document.getElementById("loginMessage").textContent = "";
  e.target.reset(); setAuthView(user); showToast(user.role === "admin" ? "Administrator signed in." : "Publisher signed in.");
});
document.getElementById("createPublisherForm").addEventListener("submit", e => {
  e.preventDefault();
  const session = getDemoSession();
  if (!session || session.role !== "admin") { showToast("Only the administrator can create publisher accounts."); return; }
  const username = document.getElementById("newPublisherUsername").value.trim();
  const password = document.getElementById("newPublisherPassword").value;
  if (username.toLowerCase() === "admin" || readDemoUsers().some(item => item.username.toLowerCase() === username.toLowerCase())) {
    showToast("That username is already in use. Choose another username."); return;
  }
  const users = readDemoUsers();
  users.push({ username, password, role: "publisher", createdAt: new Date().toISOString() });
  localStorage.setItem(DEMO_USERS_KEY, JSON.stringify(users));
  const result = document.getElementById("credentialsResult");
  result.innerHTML = `<strong>Publisher account created</strong><p>Username: <code></code></p><p>Temporary password: <code></code></p><p>Give these details directly to the publisher. Do not post them publicly.</p><button type="button" class="button button-outline" id="copyCredentials">Copy login details</button>`;
  result.querySelectorAll("code")[0].textContent = username;
  result.querySelectorAll("code")[1].textContent = password;
  result.classList.remove("hidden");
  document.getElementById("copyCredentials").addEventListener("click", () => {
    const details = `Publisher login details\nUsername: ${username}\nTemporary password: ${password}`;
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(details).then(() => showToast("Login details copied.")).catch(() => showToast(details));
    else showToast(details);
  });
  e.target.reset(); showToast("Publisher login created in this browser.");
});
document.querySelectorAll("[data-logout]").forEach(button => button.addEventListener("click", () => {
  sessionStorage.removeItem(DEMO_SESSION_KEY); setAuthView(null); document.getElementById("credentialsResult").classList.add("hidden"); resetPublisherEditor(); showToast("You have logged out.");
}));

// Administrator-managed SMS alert drafts. Actual SMS delivery needs a backend and provider.
const ADMIN_SMS_KEY = "governmentNewsAdminSmsDrafts";
const adminSmsMessage = document.getElementById("adminSmsMessage");
const adminSmsCharCount = document.getElementById("adminSmsCharCount");
adminSmsMessage.addEventListener("input", () => { adminSmsCharCount.textContent = String(adminSmsMessage.value.length); });
function renderAdminSmsHistory() {
  const histories = [document.getElementById("adminSmsHistory"), document.getElementById("publisherSmsHistory")].filter(Boolean);
  let drafts = [];
  try { drafts = JSON.parse(localStorage.getItem(ADMIN_SMS_KEY) || "[]"); } catch (e) {}
  histories.forEach(history => {
    history.replaceChildren();
    const heading = document.createElement("strong"); heading.textContent = `Prepared alert drafts (${drafts.length})`; history.appendChild(heading);
    if (!drafts.length) { const empty = document.createElement("p"); empty.className = "form-help"; empty.textContent = "No alert drafts have been prepared in this browser."; history.appendChild(empty); return; }
    drafts.slice().reverse().forEach(draft => {
      const card = document.createElement("div"); card.className = "admin-sms-draft";
      const title = document.createElement("strong"); title.textContent = `${draft.topic} · ${draft.district}`;
      const message = document.createElement("p"); message.textContent = draft.message;
      const meta = document.createElement("small"); meta.textContent = `Prepared by ${draft.createdBy} · ${new Date(draft.createdAt).toLocaleString()}`;
      card.append(title, message, meta); history.appendChild(card);
    });
  });
}
document.getElementById("adminSmsForm").addEventListener("submit", e => {
  e.preventDefault();
  const session = getDemoSession();
  if (!session || session.role !== "admin") { showToast("Only the administrator can prepare government SMS alerts."); return; }
  const message = adminSmsMessage.value.trim();
  if (!message) { showToast("Enter the alert message first."); return; }
  let drafts = [];
  try { drafts = JSON.parse(localStorage.getItem(ADMIN_SMS_KEY) || "[]"); } catch (err) {}
  const draft = { district: document.getElementById("adminSmsDistrict").value, topic: document.getElementById("adminSmsTopic").value, message, createdBy: session.username, createdAt: new Date().toISOString() };
  drafts.push(draft); localStorage.setItem(ADMIN_SMS_KEY, JSON.stringify(drafts));
  const result = document.getElementById("adminSmsResult");
  result.textContent = `Alert draft saved for ${draft.district}. No SMS has been sent. Connect an approved SMS provider to deliver this alert.`;
  result.classList.remove("hidden"); e.target.reset(); adminSmsCharCount.textContent = "0"; renderAdminSmsHistory();
  showToast("SMS alert draft saved. No message was sent.");
});
renderAdminSmsHistory();
setAuthView(getDemoSession());

renderArticles();

document.querySelectorAll("[data-district]").forEach(button => button.addEventListener("click", () => {
  document.querySelectorAll("[data-district]").forEach(item => item.classList.toggle("selected", item === button));
  const district = button.dataset.district;
  document.getElementById("districtResult").textContent = `${district} selected. A live version could show verified notices, service updates and deadlines tagged to this district. Current sample articles do not contain verified district tags.`;
}));
document.getElementById("recommendBtn").addEventListener("click", () => {
  const topic = document.getElementById("recommendTopic").value;
  const results = allArticles().filter(article => (article.status === "published" || !article.status) && (topic === "All" || article.category === topic)).sort((a,b) => b.date.localeCompare(a.date)).slice(0,3);
  const list = document.getElementById("recommendList");
  list.replaceChildren();
  if (!results.length) {
    const empty = document.createElement("p"); empty.className = "feature-help"; empty.textContent = "No sample stories match this topic yet."; list.appendChild(empty); return;
  }
  results.forEach(article => {
    const button = document.createElement("button"); button.type = "button"; button.className = "recommend-item";
    const title = document.createElement("strong"); title.textContent = article.title;
    const meta = document.createElement("small"); meta.textContent = `${article.category} · ${formatDate(article.date)}`;
    button.append(title, meta);
    button.addEventListener("click", () => openArticle(article.id));
    list.appendChild(button);
  });
});
