// Project Types
export interface Project {
  id: string;
  celebrantName: string;
  celebrantGender: 'male' | 'female' | 'other';
  eventType: 'birthday' | 'retirement' | 'wedding' | 'other';
  deadline: Date;
  managerName: string;
  managerId: string; // Google User ID
  driveRootFolderId: string;
  imagesFolderId: string;
  videosFolderId: string;
  createdAt: Date;
  status: 'active' | 'completed' | 'archived';
}

// Image Categories
export type ImageCategory = 
  | 'childhood'
  | 'youth'
  | 'army'
  | 'wedding'
  | 'family'
  | 'adulthood'
  | 'work_friends';

export interface ProjectImage {
  id: string;
  url: string;
  category: ImageCategory;
  order: number;
  driveFileId: string;
  uploadedBy: string;
  uploadedAt: Date;
}

// Contact & Video Types
export interface Contact {
  id: string;
  name: string;
  phone: string;
  relation: string;
  status: 'pending' | 'sent' | 'uploaded';
  lastReminder: Date | null;
  videos: ContactVideo[];
}

export interface ContactVideo {
  id: string;
  questionId: string;
  driveFileId: string;
  uploadedAt: Date;
  duration: number;
  thumbnailUrl: string;
}

export interface VideoQuestion {
  id: string;
  text: string;
  subtitle: string;
  required: boolean;
  order: number;
}

// Project Statistics
export interface ProjectStats {
  totalContacts: number;
  totalResponses: number;
  lastUpdated: string;
  // שמירה על שדות אופציונליים שאולי ישמשו בעתיד
  totalImages?: number;
  totalVideos?: number;
  pendingContacts?: number;
  completedContacts?: number;
  daysUntilDeadline?: number;
}

// User Session
export interface UserSession {
  id: string;
  name: string;
  email: string;
  picture: string;
  accessToken: string;
  projects: Project[];
}
