import { google } from 'googleapis';

export interface FormResponse {
  videoFile: File;
  startTime: number;
  endTime: number;
  email: string;
}

export class GoogleFormsAPI {
  private formId: string;
  private auth: any;

  constructor(formId: string, credentials: any) {
    this.formId = formId;
    this.auth = new google.auth.JWT({
      email: credentials.client_email,
      key: credentials.private_key,
      scopes: ['https://www.googleapis.com/auth/forms.responses.readonly']
    });
  }

  async initialize() {
    await this.auth.authorize();
  }

  async createForm() {
    const forms = google.forms({ version: 'v1', auth: this.auth });
    
    const form = {
      info: {
        title: 'עריכת וידאו',
        documentTitle: 'טופס עריכת וידאו'
      },
      items: [
        {
          title: 'העלאת וידאו',
          questionItem: {
            question: {
              required: true,
              fileUploadQuestion: {
                types: ['video/mp4'],
                maxFiles: 1,
                maxFileSize: '104857600' // 100MB in string format
              }
            }
          }
        },
        {
          title: 'נקודת התחלה (בשניות)',
          questionItem: {
            question: {
              required: true,
              textQuestion: {
                type: 'NUMBER'
              }
            }
          }
        },
        {
          title: 'נקודת סיום (בשניות)',
          questionItem: {
            question: {
              required: true,
              textQuestion: {
                type: 'NUMBER'
              }
            }
          }
        },
        {
          title: 'כתובת אימייל',
          questionItem: {
            question: {
              required: true,
              textQuestion: {
                type: 'EMAIL'
              }
            }
          }
        }
      ]
    };

    const response = await forms.forms.create({
      requestBody: form
    });

    return response.data;
  }

  async getResponses(): Promise<FormResponse[]> {
    const forms = google.forms({ version: 'v1', auth: this.auth });
    
    const response = await forms.forms.responses.list({
      formId: this.formId
    });

    return (response.data.responses || []).map(resp => {
      const answers = resp.answers || {};
      return {
        videoFile: answers['0'].fileUploadAnswer?.fileId || '',
        startTime: Number(answers['1'].textAnswer?.value || '0'),
        endTime: Number(answers['2'].textAnswer?.value || '0'),
        email: answers['3'].textAnswer?.value || ''
      };
    });
  }

  async watchResponses(callback: (response: FormResponse) => void) {
    // בדיקה כל 5 דקות לתשובות חדשות
    let lastCheckTime = new Date().toISOString();

    setInterval(async () => {
      const forms = google.forms({ version: 'v1', auth: this.auth });
      
      const response = await forms.forms.responses.list({
        formId: this.formId,
        filter: `timestamp > '${lastCheckTime}'`
      });

      if (response.data.responses) {
        for (const resp of response.data.responses) {
          const answers = resp.answers || {};
          callback({
            videoFile: answers['0'].fileUploadAnswer?.fileId || '',
            startTime: Number(answers['1'].textAnswer?.value || '0'),
            endTime: Number(answers['2'].textAnswer?.value || '0'),
            email: answers['3'].textAnswer?.value || ''
          });
        }
      }

      lastCheckTime = new Date().toISOString();
    }, 5 * 60 * 1000); // 5 דקות
  }
}
