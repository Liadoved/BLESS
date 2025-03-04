import { NextApiRequest, NextApiResponse } from 'next';
import { GoogleFormsAPI } from '../../lib/googleForms';

// קובץ הרשאות מ-Google Cloud Console
const credentials = {
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "your-private-key-id",
  "private_key": "your-private-key",
  "client_email": "your-service-account-email",
  "client_id": "your-client-id",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "your-cert-url"
};

const FORM_ID = 'your-form-id';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const formsApi = new GoogleFormsAPI(FORM_ID, credentials);
    await formsApi.initialize();

    // קבלת התשובות האחרונות מהטופס
    const responses = await formsApi.getResponses();
    
    // עיבוד התשובה האחרונה
    if (responses.length > 0) {
      const lastResponse = responses[responses.length - 1];
      
      // כאן נוכל להשתמש ברכיב עריכת הוידאו שלנו
      // לעיבוד הוידאו לפי הפרמטרים שהתקבלו
      
      return res.status(200).json({
        message: 'Video processing started',
        response: lastResponse
      });
    }

    return res.status(404).json({ message: 'No responses found' });
  } catch (error) {
    console.error('Error processing form response:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
