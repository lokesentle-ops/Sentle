export type ArticleCategory = 'Public Notices' | 'Health' | 'Education' | 'Development';

export type ArticleVisual = 'notice' | 'health' | 'education' | 'development' | 'public';

export type ArticleStatus = 'draft' | 'pending_review' | 'changes_requested' | 'published' | 'rejected';

export type LanguageCode = 'en' | 'st';

export interface Article {
  id: number;
  title: string;
  category: ArticleCategory;
  ministry: string;
  date: string;
  symbol: string;
  visual: ArticleVisual;
  summary: string;
  body: string;
  image?: string;
  imageAlt?: string;
  titleSt?: string;
  summarySt?: string;
  bodySt?: string;
  sourceUrl?: string;
  status?: ArticleStatus;
  author?: string;
  isCustom?: boolean;
  createdAt?: string;
  updatedAt?: string;
  reviewNote?: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

export interface DemoUser {
  username: string;
  password?: string;
  role: 'admin' | 'publisher';
  createdAt?: string;
}

export interface DemoSession {
  username: string;
  role: 'admin' | 'publisher';
}

export interface AdminSmsDraft {
  district: string;
  topic: string;
  message: string;
  createdBy: string;
  createdAt: string;
}

export interface LesothoMinistry {
  id: string;
  name: string;
  portfolio: string;
  category: ArticleCategory;
  image: string;
  imageAlt: string;
  logo: string;
  logoAlt: string;
}
