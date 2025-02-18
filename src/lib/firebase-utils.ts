import { collection, doc, getDoc, getDocs, query, where, addDoc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { db } from './firebase';
import { Project, Contact, ContactVideo, VideoQuestion } from '../types/firebase';

// Projects
export const getProject = async (projectId: string): Promise<Project | null> => {
  const docRef = doc(db, 'projects', projectId);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as Project : null;
};

export const getProjectsByManager = async (managerId: string): Promise<Project[]> => {
  const q = query(collection(db, 'projects'), where('managerId', '==', managerId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Project);
};

// Contacts
export const getProjectContacts = async (projectId: string): Promise<Contact[]> => {
  const q = query(collection(db, 'contacts'), where('projectId', '==', projectId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Contact);
};

export const updateContact = async (contactId: string, data: Partial<Contact>): Promise<void> => {
  const docRef = doc(db, 'contacts', contactId);
  await updateDoc(docRef, data);
};

// Videos
export const getContactVideos = async (contactId: string): Promise<ContactVideo[]> => {
  const q = query(collection(db, 'videos'), where('contactId', '==', contactId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as ContactVideo);
};

export const addVideo = async (contactId: string, data: Omit<ContactVideo, 'id'>): Promise<string> => {
  const docRef = await addDoc(collection(db, 'videos'), {
    ...data,
    contactId,
    uploadedAt: Timestamp.now()
  });
  return docRef.id;
};

// Questions
export const getVideoQuestions = async (projectId: string): Promise<VideoQuestion[]> => {
  const q = query(collection(db, 'questions'), where('projectId', '==', projectId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs
    .map(doc => ({ id: doc.id, ...doc.data() }) as VideoQuestion)
    .sort((a, b) => a.order - b.order);
};
