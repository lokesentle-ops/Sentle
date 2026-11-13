export type Language = "en" | "st";

export type Category =
  | "Public Notices"
  | "Health"
  | "Education"
  | "Development"
  | "Official Documents";

export type ArticleStatus =
  | "draft"
  | "pending_review"
  | "changes_requested"
  | "published"
  | "rejected";

export type VisualTone = "notice" | "health" | "education" | "development" | "public" | "document";

export interface Article {
  id: number;
  title: string;
  category: Category;
  ministry: string;
  date: string;
  visual: VisualTone;
  summary: string;
  body: string;
  titleSt?: string;
  summarySt?: string;
  bodySt?: string;
  sourceUrl?: string;
  district?: string;
  isOfficialDoc?: boolean;
  fileType?: "PDF" | "ZIP" | "Web Release";
  fileSize?: string;
  downloads?: number;
  author?: string;
  status?: ArticleStatus;
  isCustom?: boolean;
  createdAt?: string;
  updatedAt?: string;
  reviewNote?: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

export interface DemoUser {
  username: string;
  password: string;
  role: "publisher";
  createdAt: string;
}

export interface UserSession {
  username: string;
  role: "admin" | "publisher";
}

export interface SmsDraft {
  id: string;
  district: string;
  topic: string;
  message: string;
  createdBy: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "model";
  text: string;
  modelUsed?: string;
  timestamp: string;
}

export interface DistrictInfo {
  name: string;
  zone: "Lowlands" | "Foothills" | "Highlands" | "Senqu River Valley";
  town: string;
  focusSummary: string;
  sesothoSummary: string;
}
