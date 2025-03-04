import { google } from 'googleapis';

const FOLDER_IDS = {
  1: 'FOLDER_ID_FOR_QUESTION_1', // יש להחליף ב-ID האמיתי
  2: 'FOLDER_ID_FOR_QUESTION_2',
  3: 'FOLDER_ID_FOR_QUESTION_3'
};

export async function uploadToGoogleDrive(file: File, questionId: number, fileName: string) {
  try {
    // יצירת FormData עם הקובץ
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folderId', FOLDER_IDS[questionId as keyof typeof FOLDER_IDS]);
    formData.append('fileName', fileName);

    // שליחה לשרת
    const response = await fetch('/api/upload-to-drive', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error('Failed to upload to Google Drive');
    }

    const data = await response.json();
    return data.fileUrl;
  } catch (error) {
    console.error('Error uploading to Google Drive:', error);
    throw error;
  }
}
