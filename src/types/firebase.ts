import { Timestamp } from 'firebase/firestore';

export interface Project {
  id: string;
  celebrantName: string;
  celebrantGender: 'male' | 'female' | 'other';
  eventType: 'birthday' | 'retirement' | 'wedding' | 'other';
  deadline: Timestamp;
  managerName: string;
  managerId: string; // Google User ID
  driveRootFolderId: string;
  imagesFolderId: string;
  videosFolderId: string;
  createdAt: Timestamp;
  status: 'active' | 'completed' | 'archived';
}

export interface Contact {
  id: string;
  name: string;
  phone: string;
  relation: string;
  status: 'pending' | 'sent' | 'uploaded';
  lastReminder: Timestamp | null;
  videos: ContactVideo[];
}

export interface ContactVideo {
  id: string;
  questionId: string;
  driveFileId: string;
  uploadedAt: Timestamp;
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
