import { Article, ArticleCategory, LanguageCode } from '../types';

const COAT_OF_ARMS_LESOTHO =
  'https://www.gov.ls/wp-content/uploads/2017/08/cropped-cropped-1162px-Coat_of_arms_of_Lesotho.svg_-1-300x264.png';

export const HERO_BACKGROUND_IMAGE =
  'https://www.thereporter.co.ls/wp-content/uploads/2021/12/katsevillage.jpg';
export const HEALTH_LOGO_IMAGE = COAT_OF_ARMS_LESOTHO;

export const DEPARTMENT_IMAGES: Record<
  ArticleCategory,
  { image: string; alt: string; logo: string; logoAlt: string }
> = {
  Health: {
    image: 'https://www.thereporter.co.ls/wp-content/uploads/2021/06/queenmamohato.jpg',
    alt: "Queen 'Mamohato Memorial Hospital in Maseru, Lesotho",
    logo: COAT_OF_ARMS_LESOTHO,
    logoAlt: 'Kingdom of Lesotho Coat of Arms',
  },
  Education: {
    image:
      'https://www.gov.ls/wp-content/uploads/2024/03/Grade-12-students-in-class-at-Patlong-High-school-Qachas-Nek-scaled-1-1024x683-1.jpg',
    alt: "Grade 12 students in class at Patlong High School in Qacha's Nek, Lesotho",
    logo: COAT_OF_ARMS_LESOTHO,
    logoAlt: 'Kingdom of Lesotho Coat of Arms',
  },
  Development: {
    image: 'https://www.gov.ls/wp-content/uploads/2026/03/senqu-bridge.jpg',
    alt: 'Senqu River Bridge infrastructure in the highlands of Lesotho',
    logo: COAT_OF_ARMS_LESOTHO,
    logoAlt: 'Kingdom of Lesotho Coat of Arms',
  },
  'Public Notices': {
    image:
      'https://www.gov.ls/wp-content/uploads/2024/03/Maseru_from_Parliament_Hill-scaled.jpg',
    alt: 'Maseru central government district seen from Parliament Hill, Lesotho',
    logo: COAT_OF_ARMS_LESOTHO,
    logoAlt: 'Kingdom of Lesotho Coat of Arms',
  },
};

export const LESOTHO_MINISTRIES = [
  {
    id: 'pm-office',
    name: "Prime Minister's Office",
    portfolio: 'Cabinet coordination, defence & national security',
    category: 'Public Notices' as ArticleCategory,
    image: 'https://newsdayonline.co.ls/wp-content/uploads/2026/10/STATE-HOUSE_37-scaled.jpg',
    imageAlt: "State House and Prime Minister's executive complex in Maseru, Lesotho",
    logo: COAT_OF_ARMS_LESOTHO,
    logoAlt: 'Kingdom of Lesotho Coat of Arms',
  },
  {
    id: 'dpm-office',
    name: "Deputy Prime Minister's Office",
    portfolio: 'Parliamentary affairs & intergovernmental coordination',
    category: 'Public Notices' as ArticleCategory,
    image: 'https://parliament.ls/wp-content/uploads/2021/01/LesothoParliament-scaled.jpg',
    imageAlt: 'Parliament of Lesotho complex on Mpilo Hill in Maseru',
    logo: COAT_OF_ARMS_LESOTHO,
    logoAlt: 'Kingdom of Lesotho Coat of Arms',
  },
  {
    id: 'health',
    name: 'Ministry of Health',
    portfolio: 'Public hospitals, clinics, immunisation & disease prevention',
    category: 'Health' as ArticleCategory,
    image: 'https://www.thereporter.co.ls/wp-content/uploads/2021/06/queenmamohato.jpg',
    imageAlt: "Queen 'Mamohato Memorial Hospital serving Maseru and Lesotho",
    logo: COAT_OF_ARMS_LESOTHO,
    logoAlt: 'Kingdom of Lesotho Coat of Arms',
  },
  {
    id: 'education',
    name: 'Ministry of Education and Training',
    portfolio: 'Primary, secondary, tertiary education & technical skills',
    category: 'Education' as ArticleCategory,
    image:
      'https://www.gov.ls/wp-content/uploads/2024/03/Grade-12-students-in-class-at-Patlong-High-school-Qachas-Nek-scaled-1-1024x683-1.jpg',
    imageAlt: "Students in a classroom at Patlong High School in Qacha's Nek, Lesotho",
    logo: COAT_OF_ARMS_LESOTHO,
    logoAlt: 'Kingdom of Lesotho Coat of Arms',
  },
  {
    id: 'finance-dev',
    name: 'Ministry of Finance and Development Planning',
    portfolio: 'National budget, economic planning & community development',
    category: 'Development' as ArticleCategory,
    image:
      'https://www.thereporter.co.ls/wp-content/uploads/2024/06/Business1_Central-bank-of-Lesotho.jpg',
    imageAlt: 'Central Bank of Lesotho headquarters building in Maseru',
    logo: COAT_OF_ARMS_LESOTHO,
    logoAlt: 'Kingdom of Lesotho Coat of Arms',
  },
  {
    id: 'agriculture',
    name: 'Ministry of Agriculture, Food Security and Nutrition',
    portfolio: 'Highland farming, livestock, food security & rural livelihoods',
    category: 'Development' as ArticleCategory,
    image:
      'https://www.thereporter.co.ls/wp-content/uploads/2026/10/Feature_Community-embrace-climate-smart-agriculture-for-resilience-2.jpg',
    imageAlt: 'Climate-smart community agriculture and farming fields in Lesotho',
    logo: COAT_OF_ARMS_LESOTHO,
    logoAlt: 'Kingdom of Lesotho Coat of Arms',
  },
  {
    id: 'communications',
    name: 'Ministry of Communications, Science, Technology and Innovation',
    portfolio: 'Digital public services, telecommunications & research',
    category: 'Education' as ArticleCategory,
    image: 'https://www.gov.ls/wp-content/uploads/2026/10/Communications-.jpg',
    imageAlt:
      'Ministry of Information, Communications, Science, Technology and Innovation initiative in Lesotho',
    logo: COAT_OF_ARMS_LESOTHO,
    logoAlt: 'Kingdom of Lesotho Coat of Arms',
  },
  {
    id: 'energy',
    name: 'Ministry of Energy',
    portfolio: 'Electricity access, hydropower & renewable energy',
    category: 'Development' as ArticleCategory,
    image: 'https://www.gov.ls/wp-content/uploads/2023/06/solar-energy1.jpg',
    imageAlt: 'Ha Ramarothole utility-scale solar photovoltaic power plant in Mafeteng, Lesotho',
    logo: COAT_OF_ARMS_LESOTHO,
    logoAlt: 'Kingdom of Lesotho Coat of Arms',
  },
  {
    id: 'environment',
    name: 'Ministry of Environment and Forestry',
    portfolio: 'Rangelands, soil conservation, biodiversity & climate resilience',
    category: 'Development' as ArticleCategory,
    image: 'https://www.thereporter.co.ls/wp-content/uploads/2022/09/News-Forestry.jpg',
    imageAlt: 'Lesotho forestry plantations and mountain rangeland conservation',
    logo: COAT_OF_ARMS_LESOTHO,
    logoAlt: 'Kingdom of Lesotho Coat of Arms',
  },
  {
    id: 'foreign-affairs',
    name: 'Ministry of Foreign Affairs and International Relations',
    portfolio: 'Embassies, diaspora support & international treaties',
    category: 'Public Notices' as ArticleCategory,
    image: 'https://www.gov.ls/wp-content/uploads/2026/09/His-Majesty-New-York.jpeg',
    imageAlt: 'Kingdom of Lesotho international diplomatic delegation at the United Nations',
    logo: COAT_OF_ARMS_LESOTHO,
    logoAlt: 'Kingdom of Lesotho Coat of Arms',
  },
  {
    id: 'gender-youth',
    name: 'Ministry of Gender, Youth and Social Development',
    portfolio: 'Social protection, youth empowerment & community welfare',
    category: 'Health' as ArticleCategory,
    image: 'https://www.gov.ls/wp-content/uploads/2026/09/Youth-centres.jpg',
    imageAlt: 'Basotho youth development and community empowerment centre programme',
    logo: COAT_OF_ARMS_LESOTHO,
    logoAlt: 'Kingdom of Lesotho Coat of Arms',
  },
  {
    id: 'home-affairs',
    name: 'Ministry of Home Affairs and Police',
    portfolio: 'National identity cards, passports, civil registry & policing',
    category: 'Public Notices' as ArticleCategory,
    image: 'https://lmps.org.ls/wp-content/uploads/2026/11/Police-Head-Quarters-1024x683.webp',
    imageAlt: 'Lesotho Mounted Police Service (LMPS) Headquarters on Parliament Road in Maseru',
    logo: COAT_OF_ARMS_LESOTHO,
    logoAlt: 'Kingdom of Lesotho Coat of Arms',
  },
  {
    id: 'labour',
    name: 'Ministry of Labour and Employment',
    portfolio: 'Workplace standards, employment services & labour relations',
    category: 'Development' as ArticleCategory,
    image:
      'https://newsdayonline.co.ls/wp-content/uploads/2026/10/Lesotho-targets-70000-textile-jobs-in-industry-turnaround-plan.jpeg',
    imageAlt: 'Basotho garment and textile manufacturing workers in Lesotho',
    logo: COAT_OF_ARMS_LESOTHO,
    logoAlt: 'Kingdom of Lesotho Coat of Arms',
  },
  {
    id: 'law-justice',
    name: 'Ministry of Law and Justice',
    portfolio: 'Legislation, Government Gazette, courts & legal aid',
    category: 'Public Notices' as ArticleCategory,
    image: 'https://www.gov.ls/wp-content/uploads/2024/05/highcourt-1.jpg',
    imageAlt: 'High Court of Lesotho judicial building in Maseru',
    logo: COAT_OF_ARMS_LESOTHO,
    logoAlt: 'Kingdom of Lesotho Coat of Arms',
  },
  {
    id: 'local-govt',
    name: 'Ministry of Local Government and Chieftainship',
    portfolio: 'District councils, traditional leadership & community consultations',
    category: 'Public Notices' as ArticleCategory,
    image: 'https://www.gov.ls/wp-content/uploads/2025/05/District-Admins.jpg',
    imageAlt: 'Lesotho District Administrators and local government leadership forum',
    logo: COAT_OF_ARMS_LESOTHO,
    logoAlt: 'Kingdom of Lesotho Coat of Arms',
  },
  {
    id: 'natural-resources',
    name: 'Ministry of Natural Resources',
    portfolio: 'Highlands water projects, wetlands & mineral governance',
    category: 'Development' as ArticleCategory,
    image: 'https://www.thereporter.co.ls/wp-content/uploads/2021/11/katse.jpg',
    imageAlt: 'Katse Dam reservoir in the Lesotho Highlands Water Project',
    logo: COAT_OF_ARMS_LESOTHO,
    logoAlt: 'Kingdom of Lesotho Coat of Arms',
  },
  {
    id: 'public-service',
    name: 'Ministry of Public Service',
    portfolio: 'Civil service administration, standards & public sector training',
    category: 'Public Notices' as ArticleCategory,
    image:
      'https://www.gov.ls/wp-content/uploads/2024/03/Maseru_from_Parliament_Hill-scaled.jpg',
    imageAlt: 'Maseru central government administration precinct viewed from Parliament Hill',
    logo: COAT_OF_ARMS_LESOTHO,
    logoAlt: 'Kingdom of Lesotho Coat of Arms',
  },
  {
    id: 'public-works',
    name: 'Ministry of Public Works and Transport',
    portfolio: 'National highways, bridges, public buildings & transport safety',
    category: 'Development' as ArticleCategory,
    image: 'https://www.gov.ls/wp-content/uploads/2026/03/senqu-bridge.jpg',
    imageAlt: 'Senqu River Bridge highland transport infrastructure in Mokhotlong, Lesotho',
    logo: COAT_OF_ARMS_LESOTHO,
    logoAlt: 'Kingdom of Lesotho Coat of Arms',
  },
  {
    id: 'tourism-culture',
    name: 'Ministry of Tourism, Sports, Arts and Culture',
    portfolio: 'Cultural heritage, national parks, tourism & sports development',
    category: 'Education' as ArticleCategory,
    image: 'https://www.gov.ls/wp-content/uploads/2021/12/Maletsunyane-Falls.jpg',
    imageAlt: 'Maletsunyane Falls natural heritage landmark in Semonkong, Lesotho',
    logo: COAT_OF_ARMS_LESOTHO,
    logoAlt: 'Kingdom of Lesotho Coat of Arms',
  },
  {
    id: 'trade-industry',
    name: 'Ministry of Trade, Industry and Business Development',
    portfolio: 'SMMEs, business licensing, manufacturing & export trade',
    category: 'Development' as ArticleCategory,
    image: 'https://www.gov.ls/wp-content/uploads/2025/05/LNDC-Building.jpeg',
    imageAlt: 'Lesotho National Development Corporation (LNDC) headquarters in Maseru',
    logo: COAT_OF_ARMS_LESOTHO,
    logoAlt: 'Kingdom of Lesotho Coat of Arms',
  },
  {
    id: 'minister-in-pm-office',
    name: "Ministry in the Prime Minister's Office",
    portfolio: 'Special portfolios, disaster management & national coordination',
    category: 'Public Notices' as ArticleCategory,
    image:
      'https://www.thereporter.co.ls/wp-content/uploads/2023/05/News_Govt-partners-prepare-for-natural-disasters.jpg',
    imageAlt: 'Lesotho disaster management preparedness and community resilience briefing',
    logo: COAT_OF_ARMS_LESOTHO,
    logoAlt: 'Kingdom of Lesotho Coat of Arms',
  },
];

export const INITIAL_ARTICLES: Article[] = [
  {
    id: 1,
    title: 'Public notice: community consultation meetings',
    category: 'Public Notices',
    ministry: 'Ministry of Local Government',
    date: '2026-10-24',
    symbol: '⚑',
    visual: 'notice',
    image: 'https://www.gov.ls/wp-content/uploads/2025/05/District-Admins.jpg',
    imageAlt: 'Lesotho district leadership and local community consultation meeting',
    summary:
      'A sample notice showing how residents could find details about upcoming community consultation meetings.',
    body: "This sample article demonstrates how a public notice could be presented as an individual story. A real notice should include confirmed dates, venues, eligibility details and a link to the responsible department's official publication.",
  },
  {
    id: 2,
    title: 'Health services: information for local communities',
    category: 'Health',
    ministry: 'Ministry of Health',
    date: '2026-10-21',
    symbol: '✚',
    visual: 'health',
    image: 'https://www.gov.ls/wp-content/uploads/2021/02/MASERU-HOSPITAL.jpg',
    imageAlt: 'Public hospital building serving Maseru and local communities in Lesotho',
    summary:
      'A sample public information story illustrating how health-related updates could be organised and shared.',
    body: 'This demonstration article represents the kind of public health information readers may want to locate quickly. In a live service, the content would be supplied and approved by the responsible ministry, with links to official guidance.',
  },
  {
    id: 3,
    title: 'Education and skills development programme update',
    category: 'Education',
    ministry: 'Ministry of Education and Training',
    date: '2026-10-18',
    symbol: '▣',
    visual: 'education',
    image:
      'https://www.gov.ls/wp-content/uploads/2024/03/Grade-12-students-in-class-at-Patlong-High-school-Qachas-Nek-scaled-1-1024x683-1.jpg',
    imageAlt: "Students in class at Patlong High School in Qacha's Nek, Lesotho",
    summary:
      'A sample update about education and skills, designed to be easier to discover than a full newspaper PDF.',
    body: 'This sample shows how an education update could have its own page, publication date, ministry label and sharing link. The prototype does not represent a confirmed government programme.',
  },
  {
    id: 4,
    title: 'Community development project information',
    category: 'Development',
    ministry: 'Ministry of Development Planning',
    date: '2026-10-12',
    symbol: '⌂',
    visual: 'development',
    image: 'https://www.gov.ls/wp-content/uploads/2026/08/Solar-Mafeteng.jpg',
    imageAlt: 'Solar energy development project in Mafeteng District, Lesotho',
    summary: 'A demonstration story about community development and access to public information.',
    body: 'A live article could include the project location, responsible department, milestones and related public documents. This sample content is illustrative only and has not been verified as an official announcement.',
  },
  {
    id: 5,
    title: 'Reminder: check official deadlines and announcements',
    category: 'Public Notices',
    ministry: 'Government Information Desk',
    date: '2026-10-08',
    symbol: '◷',
    visual: 'public',
    image: 'https://www.gov.ls/wp-content/uploads/2026/04/LESOTHO-PARLIAMENT.jpg',
    imageAlt: 'Parliament of Lesotho building in Maseru',
    summary: 'A sample reminder showing how readers could quickly locate time-sensitive public notices.',
    body: 'This example illustrates a time-sensitive announcement format. Real publication dates and deadlines must be confirmed by the responsible authority before this information is shared with the public.',
  },
  {
    id: 6,
    title: 'Public services information for residents',
    category: 'Development',
    ministry: 'Government Information Desk',
    date: '2026-09-29',
    symbol: '⌂',
    visual: 'development',
    image: 'https://www.gov.ls/wp-content/uploads/2026/06/PUBLIC-SERVICE.jpg',
    imageAlt: 'Public service information and administration briefing in Lesotho',
    summary: 'A sample information story for residents looking for government services and public updates.',
    body: 'This illustrative article demonstrates a simple reading layout for public-service information. A production system should provide verified details, contact information and a link to the official source.',
  },
];

export const SAMPLE_SESOTHO: Record<number, { titleSt: string; summarySt: string; bodySt: string }> = {
  1: {
    titleSt: 'Tsebiso ea sechaba: liboka tsa lipuisano metseng',
    summarySt:
      'Tsebiso ea mohlala e bontšang kamoo baahi ba ka fumanang lintlha ka liboka tsa lipuisano tsa sechaba.',
    bodySt:
      'Sengoloa sena ke mohlala oa kamoo tsebiso ea sechaba e ka hlahisoang kateng. Tsebiso ea sebele e lokela ho ba le matsatsi, libaka le lintlha tse netefalitsoeng hammoho le sehokelo sa phatlalatso ea semmuso.',
  },
  2: {
    titleSt: 'Litšebeletso tsa bophelo: lintlha bakeng sa sechaba',
    summarySt:
      'Sengoloa sa mohlala se bontšang kamoo litaba tsa bophelo bo botle li ka hlophisoang le ho arolelanoa kateng.',
    bodySt:
      'Sengoloa sena sa pontšo se bontša mofuta oa litaba tsa bophelo bo botle tseo batho ba ka batlang ho li fumana kapele. Webosaeteng ea sebele, litaba li lokela ho fanoa le ho amoheloa ke lekala le ikarabellang.',
  },
  3: {
    titleSt: 'Ntlafatso ea lenaneo la thuto le litsebo',
    summarySt: 'Tsebiso ea mohlala mabapi le thuto le litsebo, e etselitsoeng ho fumaneha habonolo.',
    bodySt:
      "Mohlala ona o bontša kamoo litaba tsa thuto li ka bang le sehlooho, letsatsi la phatlalatso le lebitso la lekala. Litaba tsena ha se lenaneo la 'muso le netefalitsoeng.",
  },
  4: {
    titleSt: 'Lintlha ka morero oa ntlafatso ea sechaba',
    summarySt: 'Sengoloa sa mohlala mabapi le ntlafatso ea sechaba le phihlello ea litaba tsa sechaba.',
    bodySt:
      "Sengoloa sa sebele se ka kenyelletsa sebaka sa morero, lefapha le ikarabellang le mehato ea mosebetsi. Litaba tsena ke tsa mohlala feela 'me ha lia netefatsoa e le phatlalatso ea semmuso.",
  },
  5: {
    titleSt: 'Khopotso: hlahloba linako le liphatlalatso tsa semmuso',
    summarySt: 'Khopotso ea mohlala e bontšang kamoo batho ba ka fumanang litsebiso tsa bohlokoa kapele.',
    bodySt:
      'Mohlala ona o bontša mokhoa oa ho hlahisa tsebiso e nang le nako e behiloeng. Matsatsi le linako tsa sebele li lokela ho netefatsoa ke ba boholong pele litaba li arolelanoa.',
  },
  6: {
    titleSt: 'Lintlha tsa litšebeletso tsa sechaba bakeng sa baahi',
    summarySt:
      "Sengoloa sa mohlala bakeng sa baahi ba batlang litšebeletso tsa 'muso le litaba tsa sechaba.",
    bodySt:
      'Sengoloa sena se bontša mokhoa o bonolo oa ho bala litaba tsa litšebeletso tsa sechaba. Sistimi ea sebele e lokela ho fana ka lintlha tse netefalitsoeng le sehokelo sa mohloli oa semmuso.',
  },
};

export const DISTRICTS = [
  'Butha-Buthe',
  'Leribe',
  'Berea',
  'Maseru',
  'Mafeteng',
  "Mohale's Hoek",
  'Quthing',
  "Qacha's Nek",
  'Thaba-Tseka',
  'Mokhotlong',
];

export function formatDate(dateString: string): string {
  return new Date(`${dateString}T12:00:00`).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function getArticleImage(article: Article): { image: string; alt: string } {
  if (article.image) {
    return {
      image: article.image,
      alt: article.imageAlt || `${article.category}: ${article.title}`,
    };
  }
  return DEPARTMENT_IMAGES[article.category] || DEPARTMENT_IMAGES['Public Notices'];
}

export function getLocalizedArticle(
  article: Article,
  language: LanguageCode
): Article & { translationMissing: boolean } {
  if (language !== 'st') {
    return { ...article, translationMissing: false };
  }
  const fallback = SAMPLE_SESOTHO[article.id];
  const hasPublisherSt = Boolean(article.titleSt && article.summarySt && article.bodySt);
  const hasFallbackSt = Boolean(fallback?.titleSt && fallback?.summarySt && fallback?.bodySt);
  return {
    ...article,
    title: article.titleSt || fallback?.titleSt || article.title,
    summary: article.summarySt || fallback?.summarySt || article.summary,
    body: article.bodySt || fallback?.bodySt || article.body,
    translationMissing: !hasPublisherSt && !hasFallbackSt,
  };
}
