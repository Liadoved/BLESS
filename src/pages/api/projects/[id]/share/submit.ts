import { NextApiRequest, NextApiResponse } from 'next';
import { getFirestore } from 'firebase-admin/firestore';

interface ContactInfo {
  fullName: string;
  email: string;
  phone: string;
  relation: string;
}

interface VideoSubmission {
  questionId: string;
  url: string;
}

interface FormSubmission {
  contactInfo: ContactInfo;
  videos: VideoSubmission[];
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;
  const formData: FormSubmission = req.body;

  try {
    // Get project to verify it exists
    const projectDoc = await getFirestore()
      .collection('projects')
      .doc(id as string)
      .get();

    if (!projectDoc.exists) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Add the submission to Firestore
    const submissionRef = await getFirestore()
      .collection('projects')
      .doc(id as string)
      .collection('submissions')
      .add({
        ...formData,
        submittedAt: new Date().toISOString(),
        status: 'pending'
      });

    return res.status(200).json({ 
      success: true,
      submissionId: submissionRef.id
    });
  } catch (error: any) {
    console.error('Error submitting form:', error);
    return res.status(500).json({ 
      error: 'Failed to submit form',
      details: error.message 
    });
  }
}
