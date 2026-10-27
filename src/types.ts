// Grouped by what people want to do (reorganized 2026-10-28; old names map over in lib/categories.ts).
export type Category =
  | '전체'
  | 'AI 챗봇'
  | '검색·리서치'
  | '문서·발표'
  | '이미지 생성'
  | '디자인·3D'
  | '영상 제작'
  | 'AI 음성'
  | '음악 생성'
  | '번역·외국어'
  | '교육·튜터'
  | '개발·코딩'
  | '앱·웹 만들기'
  | '업무·생산성'
  | '마케팅'
  | '에이전트·자동화'
  | '금융·투자'
  | '법률';

export type PriceType = '무료' | '유료' | '무료/유료';

export type ToolStatus = 'active' | 'inactive' | 'discontinued' | 'renamed' | 'merged' | 'temporarily_unavailable';

export interface AITool {
  id: number;
  name: string;
  category: string;
  description: string;
  descriptionEn?: string;
  url: string;
  price: PriceType | string;
  tags?: string[];
  icon?: string;
  iconUrl?: string;
  logoUrl?: string;
  logoSource?: 'official' | 'domain_favicon' | 'fallback';
  isCustom?: boolean;
  status?: ToolStatus;
  statusReason?: string;
  statusCheckedAt?: string;
  sourceUrl?: string;
  keyFeatures?: string[];
  recommendedFor?: string;
  useCases?: string;
  proTips?: string;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type BadgeType = 'hot' | 'pick' | 'kr';

export interface BadgeInfo {
  type: BadgeType;
  label: string;
}

export interface NoticeItem {
  id: string;
  title: string;
  category: 'IMPORTANT' | 'UPDATE' | 'NOTICE';
  content: string;
  createdAt: string;
  updatedAt?: string;
  author: string;
  status?: 'PUBLISHED' | 'DRAFT';
  isPinned?: boolean;
  lang?: 'ko' | 'en' | 'all';
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  nickname?: string;
  bio?: string;
  photoURL?: string;
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
  isAdmin?: boolean;
  status?: 'ACTIVE' | 'SUSPENDED';
  joinedAt?: string;
  lastActiveAt?: string;
  loginCount?: number;
}

export interface AdminUser {
  uid: string;
  email: string;
  displayName: string;
  nickname?: string;
  bio?: string;
  photoURL?: string;
  role: 'ADMIN' | 'USER';
  isAdmin?: boolean;
  status: 'ACTIVE' | 'SUSPENDED';
  joinedAt: string;
  lastActiveAt: string;
  loginCount?: number;
  adminNotes?: string;
  isProtected?: boolean;
}

export interface ActivityLogItem {
  id: string;
  userEmail?: string;
  userName?: string;
  action: string;
  details?: string;
  timestamp: string;
  type: 'AUTH' | 'TOOL' | 'NOTICE' | 'USER_MGMT' | 'SYSTEM';
}

export interface AdminAuditLog {
  id: string;
  adminEmail: string;
  action: string;
  target: string;
  details?: string;
  status: 'SUCCESS' | 'FAILURE' | 'WARNING';
  timestamp: string;
}

export interface SystemHealthStatus {
  application: 'Online' | 'Warning' | 'Offline';
  authentication: 'Online' | 'Warning' | 'Offline';
  aiApi: 'Online' | 'Warning' | 'Offline';
  database: 'Online' | 'Warning' | 'Offline';
  chatbot: 'Online' | 'Warning' | 'Offline';
  tts: 'Online' | 'Warning' | 'Offline';
  lastChecked: string;
  httpRttMs?: number;
  averageResponseTimeMs?: number;
  recentErrorsCount: number;
  activeToolsCount: number;
  totalUsersCount: number;
}

export type AdminConsoleTab =
  | 'dashboard'
  | 'users'
  | 'tools'
  | 'announcements'
  | 'chatbot'
  | 'system'
  | 'developer'
  | 'settings';

