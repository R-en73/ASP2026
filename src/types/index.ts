export type Authority = 'admin' | 'student' | 'guest' | 'event';
export type UserRole = Authority;

export interface User {
  id: string;
  uid?: string;
  loginId?: string;
  pass?: string;
  name: string;
  authority: Authority;
  role?: string;
  grade?: string;
  courseId?: string;
  boothId?: string;
  roomId?: string;
  email?: string;
  studentId?: string;
  deviceId?: string;
  likedBoothIds?: string[];
}

export type CategoryType = 'it' | 'game' | 'cg' | 'design';

export interface CategoryInfo {
  id: CategoryType;
  name: string;
  shortName: string;
  description: string;
  color: string;
  bgLight: string;
  borderLight: string;
  textColor: string;
  iconName: string;
}

export interface Room {
  id: string;
  name: string;
  floor: string;
}

export interface Course {
  id: string;
  name: string;
}

export interface SystemSettings {
  mainTitle: string;
  mainVisualUrl: string;
  comment: string;
  isVotingEnabled: boolean;
}

export interface BoothDetail {
  id: string;
  title: string;
  catchphrase: string;
  description: string;
  authorName?: string;
  courseName?: string;
  courseId?: string;
  grade?: string;
  floor?: string;
  roomId?: string;
  roomName?: string;
  thumbnailUrl?: string;
  thumbnail?: string;
  images?: string[];
  youtubes?: string[];
  externalLinks?: string[];
  pdfs?: ({ name?: string; url: string } | string)[];
  tags?: string[];
  userId?: string;
  userLoginId?: string;
  likes?: number;
  featured?: boolean;
  award?: string;
  createdAt?: any;
}

export type BoothItem = BoothDetail;

export interface BoothComment {
  id?: string;
  boothId: string;
  userId?: string;
  userName?: string;
  text?: string;
  authorName?: string;
  authorRole?: UserRole;
  content?: string;
  createdAt?: any;
}

export interface Vote {
  id?: string;
  boothId: string;
  userId: string;
  createdAt?: any;
}

export type VoteRecord = Vote;

export type NewsCategory = 'important' | 'event' | 'exhibitor' | 'general' | 'award';

export interface NewsItem {
  id: string;
  title: string;
  date?: string;
  category: NewsCategory;
  categoryLabel?: string;
  summary?: string;
  content: string;
  isNew?: boolean;
  author?: string;
  externalUrl?: string;
  publishedAt?: string;
  isPinned?: boolean;
  updatedAt?: any;
}

export interface ScheduleEvent {
  id?: string;
  time: string;
  title?: string;
  label?: string;
  type?: string;
  day?: 'day1' | 'day2';
  location?: string;
  stageName?: string;
  speaker?: string;
  category?: 'stage' | 'presentation' | 'vote' | 'ceremony' | string;
  color?: string;
  badgeBg?: string;
  description?: string;
  isLive?: boolean;
}
