import { NextApiRequest, NextApiResponse } from 'next';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import formidable from 'formidable';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;

  try {
    // Get project to verify it exists
    const projectDoc = await getFirestore()
      .collection('projects')
      .doc(id as string)
      .get();

    if (!projectDoc.exists) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Parse form data
    const form = formidable();
    const [fields, files] = await form.parse(req);
    const videoFile = files.video?.[0];
    const questionId = fields.questionId?.[0];

    if (!videoFile || !questionId) {
      return res.status(400).json({ error: 'Video and questionId are required' });
    }

    // Upload to Firebase Storage
    const bucket = getStorage().bucket();
    const fileName = `projects/${id}/submissions/${Date.now()}_${videoFile.originalFilename}`;
    
    await bucket.upload(videoFile.filepath, {
      destination: fileName,
      metadata: {
        contentType: videoFile.mimetype || 'video/mp4'
      }
    });

    // Get public URL
    const [url] = await bucket.file(fileName).getSignedUrl({
      action: 'read',
      expires: '03-01-2500' // Very far in the future
    });

    // Clean up temp file
    fs.unlinkSync(videoFile.filepath);

    return res.status(200).json({ url });
  } catch (error: any) {
    console.error('Error uploading video:', error);
    return res.status(500).json({ 
      error: 'Failed to upload video',
      details: error.message 
    });
  }
}
