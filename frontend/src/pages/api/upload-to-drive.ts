import { NextApiRequest, NextApiResponse } from 'next';
import { google } from 'googleapis';
import { IncomingForm, File as FormidableFile } from 'formidable';
import fs from 'fs';

// הגדרת formidable לא לשמור קבצים בדיסק
export const config = {
  api: {
    bodyParser: false,
  },
};

const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  scopes: SCOPES,
});

interface FormFields {
  folderId: string;
  fileName: string;
}

interface FormFiles {
  file: FormidableFile;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const form = new IncomingForm();
    const { fields, files } = await new Promise<{ fields: FormFields; files: FormFiles }>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve({
          fields: fields as unknown as FormFields,
          files: files as unknown as FormFiles
        });
      });
    });

    const file = files.file;
    const folderId = fields.folderId;
    const fileName = fields.fileName;

    const drive = google.drive({ version: 'v3', auth });

    const response = await drive.files.create({
      requestBody: {
        name: fileName,
        parents: [folderId],
        mimeType: 'video/mp4',
      },
      media: {
        mimeType: 'video/mp4',
        body: fs.createReadStream(file.filepath),
      },
    });

    if (!response.data.id) {
      throw new Error('Failed to get file ID from Google Drive');
    }

    // הגדרת הרשאות צפייה
    await drive.permissions.create({
      fileId: response.data.id,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    });

    // קבלת URL לצפייה
    const fileData = await drive.files.get({
      fileId: response.data.id,
      fields: 'webViewLink',
    });

    return res.status(200).json({
      message: 'File uploaded successfully',
      fileUrl: fileData.data.webViewLink,
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return res.status(500).json({ message: 'Error uploading file' });
  }
}
