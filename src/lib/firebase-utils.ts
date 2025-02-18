import { collection, doc, getDoc, getDocs, query, where, addDoc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { db } from './firebase';
import { Project, Contact, ContactVideo, VideoQuestion } from '../types/firebase';

// Helper function to ensure db is initialized
const getDB = () => {
  if (!db) {
    throw new Error('Firestore is not initialized');
  }
  return db;
};

// Projects
export const getProject = async (projectId: string): Promise<Project | null> => {
  const docRef = doc(getDB(), 'projects', projectId);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as Project : null;
};

export const getProjectsByManager = async (managerId: string): Promise<Project[]> => {
  const q = query(collection(getDB(), 'projects'), where('managerId', '==', managerId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Project);
};

// Contacts
export const getProjectContacts = async (projectId: string): Promise<Contact[]> => {
  const q = query(collection(getDB(), 'contacts'), where('projectId', '==', projectId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Contact);
};

export const updateContact = async (contactId: string, data: Partial<Contact>): Promise<void> => {
  const docRef = doc(getDB(), 'contacts', contactId);
  await updateDoc(docRef, data);
};

// Videos
export const getContactVideos = async (contactId: string): Promise<ContactVideo[]> => {
  const q = query(collection(getDB(), 'videos'), where('contactId', '==', contactId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as ContactVideo);
};

export const addVideo = async (contactId: string, data: Omit<ContactVideo, 'id'>): Promise<string> => {
  const docRef = await addDoc(collection(getDB(), 'videos'), {
    ...data,
    contactId,
    uploadedAt: Timestamp.now()
  });
  return docRef.id;
};

// Questions
export const getVideoQuestions = async (projectId: string): Promise<VideoQuestion[]> => {
  const q = query(collection(getDB(), 'questions'), where('projectId', '==', projectId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs
    .map(doc => ({ id: doc.id, ...doc.data() }) as VideoQuestion)
    .sort((a, b) => a.order - b.order);
};
