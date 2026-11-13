import type { Article, DistrictInfo, Language } from "../types";

export const INITIAL_ARTICLES: Article[] = [
  // Official records & announcements referenced from gov.ls/documents/
  {
    id: 101,
    title: "GRM Escalation Mechanism Addendum from Lesotho Public Sector Foundations",
    category: "Official Documents",
    ministry: "Public Sector Modernization Desk",
    date: "2026-11-06",
    visual: "document",
    isOfficialDoc: true,
    fileType: "PDF",
    fileSize: "233.46 KB",
    downloads: 4,
    district: "Maseru",
    sourceUrl:
      "https://www.gov.ls/download/grm-escalation-mechanism-addendum-from-lesotho-public-sector-foundations-06-11-2026/",
    summary:
      "Official addendum outlining grievance redress escalation channels under the Lesotho Public Sector Foundations programme (dated 06/11/2026).",
    body:
      "Published on the Government of Lesotho Documents Repository, this addendum details the Grievance Redress Mechanism (GRM) escalation procedures for public-sector service delivery and programme feedback. Citizens and stakeholders seeking to submit or escalate formal public-sector grievances can download the full 233.46 KB PDF from the official gov.ls document page.",
    titleSt: "Sehlomathiso sa Mokhoa oa ho Fetisa Litletlebo (GRM) — Lesotho Public Sector Foundations",
    summarySt:
      "Tokomane ea semmuso e hlalosang mekhoa ea ho fetisa litletlebo tšebeletsong ea sechaba (06/11/2026).",
    bodySt:
      "E phatlalalitsoe polokelong ea litokomane tsa 'Muso oa Lesotho, sehlomathiso sena se hlalosa mehato ea ho rarolla le ho fetisa litletlebo tsa sechaba. Baahi ba ka khoasolla tokomane e feletseng ea PDF webosaeteng ea semmuso ea gov.ls.",
  },
  {
    id: 102,
    title: "EOI: Evaluation and Assessment of Lesotho National Broadcasting",
    category: "Official Documents",
    ministry: "Ministry of Information, Communications, Science, Technology and Innovation",
    date: "2026-10-28",
    visual: "document",
    isOfficialDoc: true,
    fileType: "ZIP",
    fileSize: "284.15 KB",
    downloads: 110,
    district: "Maseru",
    sourceUrl:
      "https://www.gov.ls/download/eoi-evaluation-and-assessment-of-lesotho-national-broadcasting/",
    summary:
      "Expression of Interest package (284.15 KB ZIP) inviting qualified consultants and firms to evaluate national broadcasting services.",
    body:
      "The Government of Lesotho has published an Expression of Interest (EOI) document package for the evaluation and assessment of Lesotho National Broadcasting. Interested service providers can access the full terms of reference and submission requirements via the official gov.ls download portal.",
    titleSt: "Boipiletso ba Thahasello (EOI): Tekolo ea Phatlalatso ea Sechaba ea Lesotho",
    summarySt:
      "Tokomane ea semmuso e memelang bahlahlobi ho etsa tekolo ea litšebeletso tsa phatlalatso ea sechaba.",
    bodySt:
      "'Muso oa Lesotho o phatlalalitse tokomane ea boipiletso ba thahasello bakeng sa tekolo ea phatlalatso ea sechaba. Lintlha tse qaqileng li fumaneha ho gov.ls.",
  },
  {
    id: 103,
    title: "Government Statement on the Abduction and Assault of a Newspaper Editor",
    category: "Public Notices",
    ministry: "Government Spokesperson & Prime Minister's Office",
    date: "2026-09-18",
    visual: "notice",
    isOfficialDoc: true,
    fileType: "PDF",
    fileSize: "383.52 KB",
    downloads: 91,
    district: "Maseru",
    sourceUrl:
      "https://www.gov.ls/download/lesotho-government-statement-on-the-abduction-and-assault-of-a-newspaper-editor/",
    summary:
      "Official Lesotho Government statement addressing the abduction and assault of a newspaper editor and affirming media safety commitments.",
    body:
      "This official PDF press statement from the Government of Lesotho records the executive response to the reported abduction and assault of a newspaper editor, reaffirming constitutional protections for press freedom and law enforcement follow-up. Read the full 383.52 KB official PDF on gov.ls.",
    titleSt: "Phatlalatso ea 'Muso ka Ketsahalo ea ho Koeteloa le ho Hlaseloa ha Mohlophisi oa Koranta",
    summarySt:
      "Polelo ea semmuso ea 'Muso oa Lesotho mabapi le polokeho ea boralitaba le tokoloho ea boralitaba.",
    bodySt:
      "Phatlalatso ena ea semmuso e bontša maemo a 'Muso mabapi le tšireletso ea boralitaba le lipatlisiso tsa molao. Tokomane e fumaneha ka botlalo ho gov.ls.",
  },
  {
    id: 104,
    title: "Notice: Basotho Interested in Providing Vehicles on Short-Term Hire Basis",
    category: "Public Notices",
    ministry: "Ministry of Finance & Development Planning",
    date: "2026-08-30",
    visual: "notice",
    isOfficialDoc: true,
    fileType: "PDF",
    fileSize: "209.87 KB",
    downloads: 80,
    district: "All districts",
    sourceUrl:
      "https://www.gov.ls/download/notice-basotho-interested-in-providing-vehicles-on-short-term-hire-basis-30-08-2026/",
    summary:
      "Public procurement notice inviting Basotho vehicle owners interested in providing short-term vehicle hire services (dated 30/08/2026).",
    body:
      "This public notice sets out eligibility criteria, registration procedures, and documentation required for Basotho citizens interested in supplying vehicles on a short-term hire basis to government ministries and agencies. Download the 209.87 KB PDF notice directly from gov.ls.",
    titleSt: "Tsebiso: Basotho ba nang le Thahasello ea ho Hirisetsa 'Muso Likoloi ka Nako e Khutšoanyane",
    summarySt:
      "Tsebiso ea sechaba bakeng sa Basotho ba lakatsang ho fana ka litšebeletso tsa ho hirisa likoloi.",
    bodySt:
      "Tsebiso ena e hlalosa litlhoko le mekhoa ea boingoliso bakeng sa baahi ba Lesotho ba nang le likoloi tse ka hiroang ke makala a 'muso.",
  },
  {
    id: 105,
    title: "Data Management Policy Lesotho — Final Official Policy Document",
    category: "Development",
    ministry: "Ministry of Information, Communications, Science, Technology and Innovation",
    date: "2026-08-17",
    visual: "development",
    isOfficialDoc: true,
    fileType: "PDF",
    fileSize: "1.23 MB",
    downloads: 293,
    district: "All districts",
    sourceUrl:
      "https://www.gov.ls/download/data-management-policy-lesotho-final-17-08-2026/",
    summary:
      "National framework establishing standards for public data governance, interoperability, privacy, and digital transformation across Lesotho.",
    body:
      "Published on 17 August 2026, the Final Lesotho Data Management Policy establishes national standards for how public institutions collect, store, protect, and share civic data securely, supporting Lesotho's broader GovTech and digital connectivity mandate.",
    titleSt: "Leano la Sechaba la Tsamaiso ea Lintlha (Data Management Policy Lesotho)",
    summarySt:
      "Leano la sechaba le laolang polokeho, tšireletso le tšebeliso e ntle ea lintlha tsa sechaba.",
    bodySt:
      "Leano lena le phatlalalitsoeng ka la 17 Phato 2026 le beha melaoana ea tšireletso le tsamaiso ea litaba tsa dijithale makaleng a 'muso.",
  },
  {
    id: 106,
    title: "Government Mandate on Inter-District Roads & Job Creation",
    category: "Development",
    ministry: "Ministry of Public Works and Transport",
    date: "2026-11-02",
    visual: "development",
    isOfficialDoc: true,
    fileType: "Web Release",
    district: "Thaba-Tseka",
    sourceUrl:
      "https://www.gov.ls/transport/the-government-stands-firm-on-its-mandate-to-build-roads-linking-districts-easing-movement-and-unlocking-job-opportunities/",
    summary:
      "The Government stands firm on its mandate to construct roads linking districts, easing citizen movement and unlocking local job opportunities.",
    body:
      "Featured on the official Government of Lesotho portal, this national development update highlights ongoing road infrastructure priorities connecting highland and lowland districts to lower transport times and stimulate regional employment.",
    titleSt: "Boitlamo ba 'Muso ba ho Haha Litsela tse Hokahanyang Litereke",
    summarySt:
      "'Muso o tiisa boitlamo ba ho haha litsela tse nolofatsang maeto le ho theha menyetla ea mesebetsi.",
    bodySt:
      "Phatlalatso ena e totobatsa merero ea kaho ea litsela tse hokahanyang litereke tsa Lesotho ho ntlafatsa moruo le phihlello ea litšebeletso.",
  },
  {
    id: 107,
    title: "Prime Minister Sam Matekane Launches Third Education Charity Golf Day",
    category: "Education",
    ministry: "Office of the Prime Minister",
    date: "2026-10-30",
    visual: "education",
    isOfficialDoc: true,
    fileType: "Web Release",
    district: "Maseru",
    sourceUrl:
      "https://www.gov.ls/education/the-right-honourable-the-prime-minister-sam-matekane-officially-launched-third-education-charity-golf-day/",
    summary:
      "The Right Honourable Prime Minister Sam Matekane officially launched the Third Education Charity Golf Day supporting vulnerable learners.",
    body:
      "The Office of the Prime Minister announced the launch of the Third Education Charity Golf Day, mobilizing public-private partnerships to fund school resources and scholarships for students across Lesotho.",
    titleSt: "Tonakholo Sam Matekane o Thakhotse Letsatsi la Boraro la Lipapali tsa Kolofo bakeng sa Thuto",
    summarySt:
      "Tonakholo o thakhotse letšolo la ho bokella lithuso tsa thuto bakeng sa baithuti ba hlokang.",
    bodySt:
      "Ofisi ea Tonakholo e phatlalalitse letšolo la boraro la ho tšehetsa thuto le ho fana ka menyetla ea ho ithuta ho bana ba Lesotho.",
  },
  // Illustrative prototype sample stories (from original prototype)
  {
    id: 1,
    title: "Public notice: community consultation meetings",
    category: "Public Notices",
    ministry: "Ministry of Local Government",
    date: "2026-10-24",
    visual: "notice",
    district: "Maseru",
    isOfficialDoc: false,
    summary:
      "A sample notice showing how residents could find details about upcoming community consultation meetings.",
    body:
      "This sample article demonstrates how a public notice could be presented as an individual story. A real notice should include confirmed dates, venues, eligibility details and a link to the responsible department's official publication.",
    titleSt: "Tsebiso ea sechaba: liboka tsa lipuisano metseng",
    summarySt:
      "Tsebiso ea mohlala e bontšang kamoo baahi ba ka fumanang lintlha ka liboka tsa lipuisano tsa sechaba.",
    bodySt:
      "Sengoloa sena ke mohlala oa kamoo tsebiso ea sechaba e ka hlahisoang kateng. Tsebiso ea sebele e lokela ho ba le matsatsi, libaka le lintlha tse netefalitsoeng hammoho le sehokelo sa phatlalatso ea semmuso.",
  },
  {
    id: 2,
    title: "Health services: information for local communities",
    category: "Health",
    ministry: "Ministry of Health",
    date: "2026-10-21",
    visual: "health",
    district: "Leribe",
    isOfficialDoc: false,
    summary:
      "A sample public information story illustrating how health-related updates could be organised and shared.",
    body:
      "This demonstration article represents the kind of public health information readers may want to locate quickly. In a live service, the content would be supplied and approved by the responsible ministry, with links to official guidance.",
    titleSt: "Litšebeletso tsa bophelo: lintlha bakeng sa sechaba",
    summarySt:
      "Sengoloa sa mohlala se bontšang kamoo litaba tsa bophelo bo botle li ka hlophisoang le ho arolelanoa kateng.",
    bodySt:
      "Sengoloa sena sa pontšo se bontša mofuta oa litaba tsa bophelo bo botle tseo batho ba ka batlang ho li fumana kapele. Webosaeteng ea sebele, litaba li lokela ho fanoa le ho amoheloa ke lekala le ikarabellang.",
  },
  {
    id: 3,
    title: "Education and skills development programme update",
    category: "Education",
    ministry: "Ministry of Education and Training",
    date: "2026-10-18",
    visual: "education",
    district: "Berea",
    isOfficialDoc: false,
    summary:
      "A sample update about education and skills, designed to be easier to discover than a full newspaper PDF.",
    body:
      "This sample shows how an education update could have its own page, publication date, ministry label and sharing link. The prototype does not represent a confirmed government programme.",
    titleSt: "Ntlafatso ea lenaneo la thuto le litsebo",
    summarySt:
      "Tsebiso ea mohlala mabapi le thuto le litsebo, e etselitsoeng ho fumaneha habonolo.",
    bodySt:
      "Mohlala ona o bontša kamoo litaba tsa thuto li ka bang le sehlooho, letsatsi la phatlalatso le lebitso la lekala. Litaba tsena ha se lenaneo la 'muso le netefalitsoeng.",
  },
  {
    id: 4,
    title: "Community development project information",
    category: "Development",
    ministry: "Ministry of Development Planning",
    date: "2026-10-12",
    visual: "development",
    district: "Mafeteng",
    isOfficialDoc: false,
    summary:
      "A demonstration story about community development and access to public information.",
    body:
      "A live article could include the project location, responsible department, milestones and related public documents. This sample content is illustrative only and has not been verified as an official announcement.",
    titleSt: "Lintlha ka morero oa ntlafatso ea sechaba",
    summarySt:
      "Sengoloa sa mohlala mabapi le ntlafatso ea sechaba le phihlello ea litaba tsa sechaba.",
    bodySt:
      "Sengoloa sa sebele se ka kenyelletsa sebaka sa morero, lefapha le ikarabellang le mehato ea mosebetsi. Litaba tsena ke tsa mohlala feela 'me ha lia netefatsoa e le phatlalatso ea semmuso.",
  },
  {
    id: 5,
    title: "Reminder: check official deadlines and announcements",
    category: "Public Notices",
    ministry: "Government Information Desk",
    date: "2026-10-08",
    visual: "public",
    district: "Mohale's Hoek",
    isOfficialDoc: false,
    summary:
      "A sample reminder showing how readers could quickly locate time-sensitive public notices.",
    body:
      "This example illustrates a time-sensitive announcement format. Real publication dates and deadlines must be confirmed by the responsible authority before this information is shared with the public.",
    titleSt: "Khopotso: hlahloba linako le liphatlalatso tsa semmuso",
    summarySt:
      "Khopotso ea mohlala e bontšang kamoo batho ba ka fumanang litsebiso tsa bohlokoa kapele.",
    bodySt:
      "Mohlala ona o bontša mokhoa oa ho hlahisa tsebiso e nang le nako e behiloeng. Matsatsi le linako tsa sebele li lokela ho netefatsoa ke ba boholong pele litaba li arolelanoa.",
  },
  {
    id: 6,
    title: "Public services information for residents",
    category: "Development",
    ministry: "Government Information Desk",
    date: "2026-09-29",
    visual: "development",
    district: "Mokhotlong",
    isOfficialDoc: false,
    summary:
      "A sample information story for residents looking for government services and public updates.",
    body:
      "This illustrative article demonstrates a simple reading layout for public-service information. A production system should provide verified details, contact information and a link to the official source.",
    titleSt: "Lintlha tsa litšebeletso tsa sechaba bakeng sa baahi",
    summarySt:
      "Sengoloa sa mohlala bakeng sa baahi ba batlang litšebeletso tsa 'muso le litaba tsa sechaba.",
    bodySt:
      "Sengoloa sena se bontša mokhoa o bonolo oa ho bala litaba tsa litšebeletso tsa sechaba. Sistimi ea sebele e lokela ho fana ka lintlha tse netefalitsoeng le sehokelo sa mohloli oa semmuso.",
  },
];

export const LESOTHO_DISTRICTS: DistrictInfo[] = [
  {
    name: "Butha-Buthe",
    zone: "Lowlands",
    town: "Butha-Buthe Camp",
    focusSummary: "Northern border trade notices, highland water catchment updates, and district council schedules.",
    sesothoSummary: "Litsebiso tsa khoebo moeling oa leboea le merero ea lekhotla la setereke.",
  },
  {
    name: "Leribe",
    zone: "Lowlands",
    town: "Hlotse",
    focusSummary: "Agricultural extension updates, Motebang regional health notices, and community consultations.",
    sesothoSummary: "Litaba tsa temo, bophelo bo botle ba Motebang le lipuisano tsa sechaba.",
  },
  {
    name: "Berea",
    zone: "Lowlands",
    town: "Teyateyaneng",
    focusSummary: "Skills and vocational education announcements, municipal planning, and SME support.",
    sesothoSummary: "Litsebiso tsa thuto ea litsebo le ntlafatso ea likhoebo tse nyane.",
  },
  {
    name: "Maseru",
    zone: "Lowlands",
    town: "Maseru (Capital)",
    focusSummary: "Central ministry publications, national procurement tenders, parliamentary briefs, and Cabinet releases.",
    sesothoSummary: "Liphatlalatso tsa makala a 'muso, lithendara tsa sechaba le likhatiso tsa paramente.",
  },
  {
    name: "Mafeteng",
    zone: "Lowlands",
    town: "Mafeteng",
    focusSummary: "Rural development grants, water and climate resilience notices, and public service outreach.",
    sesothoSummary: "Merero ea ntlafatso ea mahaeng le litšebeletso tsa sechaba.",
  },
  {
    name: "Mohale's Hoek",
    zone: "Senqu River Valley",
    town: "Mohale's Hoek",
    focusSummary: "Southern district public works, border post notices, and community council hearings.",
    sesothoSummary: "Merero ea mesebetsi ea sechaba boroa le litsebiso tsa lekhotla.",
  },
  {
    name: "Quthing",
    zone: "Senqu River Valley",
    town: "Moyeni",
    focusSummary: "Southern valley transport access updates, health clinic outreach, and heritage conservation.",
    sesothoSummary: "Litaba tsa lipalangoang le litšebeletso tsa bophelo seterekeng sa Quthing.",
  },
  {
    name: "Qacha's Nek",
    zone: "Highlands",
    town: "Qacha's Nek",
    focusSummary: "Highland connectivity updates, cross-border community notices, and winter preparedness.",
    sesothoSummary: "Litsebiso tsa marang-rang maloting le boitokisetso ba mariha.",
  },
  {
    name: "Thaba-Tseka",
    zone: "Highlands",
    town: "Thaba-Tseka",
    focusSummary: "Inter-district road construction mandates, mountain clinic schedules, and livestock notices.",
    sesothoSummary: "Merero ea kaho ea litsela tse hokahanyang litereke le bophelo maloting.",
  },
  {
    name: "Mokhotlong",
    zone: "Highlands",
    town: "Mokhotlong",
    focusSummary: "Highland energy and road corridor updates, winter weather advisories, and local public services.",
    sesothoSummary: "Litaba tsa motlakase, litsela le litšebeletso tsa sechaba maloting.",
  },
];

export const UI_COPY: Record<
  Language,
  {
    heroEyebrow: string;
    heroTitleLead: string;
    heroTitleEm: string;
    heroSubtitle: string;
    searchPlaceholder: string;
    searchButton: string;
    latestEyebrow: string;
    latestTitle: string;
    latestSubtitle: string;
    readArticle: string;
    listen: string;
    stop: string;
    share: string;
    navLatest: string;
    navDistricts: string;
    navArchive: string;
    navPublish: string;
    navAbout: string;
  }
> = {
  en: {
    heroEyebrow: "Kingdom of Lesotho · Public Information Portal",
    heroTitleLead: "Government news, ",
    heroTitleEm: "made easier to find.",
    heroSubtitle:
      "Discover official documents, public notices, and national updates in one accessible portal. Search individual stories, listen in audio, or ask the civic assistant without downloading entire newspapers.",
    searchPlaceholder: "Search news, ministries, tenders, or use voice...",
    searchButton: "Search news",
    latestEyebrow: "Stay Informed",
    latestTitle: "Latest government news & official records",
    latestSubtitle:
      "Browse individual stories and verified gov.ls documents, listen with AI voice narration, or filter by category.",
    readArticle: "Read article",
    listen: "Listen",
    stop: "Stop",
    share: "Share",
    navLatest: "Latest news",
    navDistricts: "Districts",
    navArchive: "News archive",
    navPublish: "Publish",
    navAbout: "About",
  },
  st: {
    heroEyebrow: "Muso oa Lesotho · Sebaka sa Litaba tsa Sechaba",
    heroTitleLead: "Litaba tsa 'muso, ",
    heroTitleEm: "li fumaneha habonolo.",
    heroSubtitle:
      "Fumana liphatlalatso tsa semmuso, litokomane le litaba tsa bohlokoa sebakeng se le seng. Batla litaba ka mongolo kapa ka lentsoe, u mamele ka molumo.",
    searchPlaceholder: "Batla litaba, makala, kapa sebelisa lentsoe...",
    searchButton: "Batla litaba",
    latestEyebrow: "Lula u Tsebisoa",
    latestTitle: "Litaba tsa morao-rao le litokomane tsa semmuso",
    latestSubtitle:
      "Sheba litaba ka bonngoe le litokomane tsa gov.ls, mamela ka molumo, kapa u arolelane le ba bang.",
    readArticle: "Bala litaba",
    listen: "Mamela",
    stop: "Emisa",
    share: "Arolelana",
    navLatest: "Litaba tsa morao-rao",
    navDistricts: "Litereke",
    navArchive: "Litaba tsa khale",
    navPublish: "Phatlalatsa",
    navAbout: "Ka rona",
  },
};

export function getLocalizedArticle(article: Article, lang: Language) {
  if (lang === "en") {
    return {
      title: article.title,
      summary: article.summary,
      body: article.body,
      translationMissing: false,
    };
  }
  const hasAllSt = Boolean(article.titleSt && article.summarySt && article.bodySt);
  return {
    title: article.titleSt || article.title,
    summary: article.summarySt || article.summary,
    body: article.bodySt || article.body,
    translationMissing: !hasAllSt,
  };
}
