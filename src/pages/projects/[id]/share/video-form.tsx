import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import VideoTrimmer from '../../../../components/VideoTrimmer';

interface ContactInfo {
  fullName: string;
  email: string;
  phone: string;
  relation: string;
}

const relationOptions = [
  { id: 'parent', label: 'הורה' },
  { id: 'sibling', label: 'אח/ות' },
  { id: 'uncle', label: 'דוד/ה' },
  { id: 'cousin', label: 'בן/בת דוד/ה' },
  { id: 'relative', label: 'קרוב משפחה' },
  { id: 'coworker', label: 'חבר/ה מהעבודה' },
  { id: 'friend', label: 'חבר/ה' },
  { id: 'other', label: 'אחר' }
];

interface Question {
  id: string;
  text: string;
  subtitle?: string;
  required: boolean;
}

const questions: Question[] = [
  {
    id: 'greeting',
    text: 'ברכה אישית',
    subtitle: 'הקליטו ברכה מרגשת ואישית',
    required: true
  },
  {
    id: 'memory',
    text: 'זיכרון משותף',
    subtitle: 'שתפו זיכרון משמעותי או סיפור משעשע',
    required: false
  },
  {
    id: 'wish',
    text: 'איחולים לעתיד',
    subtitle: 'מה אתם מאחלים לעתיד?',
    required: false
  }
];

export default function VideoForm() {
  const router = useRouter();
  const { id } = router.query;
  
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    fullName: '',
    email: '',
    phone: '',
    relation: ''
  });
  
  const [customRelation, setCustomRelation] = useState('');
  const [videos, setVideos] = useState<{[key: string]: { url?: string, file?: File }}>({});
  const [showTrimmer, setShowTrimmer] = useState(false);
  const [currentVideo, setCurrentVideo] = useState<{ file: File, questionId: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleContactInfoChange = (field: keyof ContactInfo, value: string) => {
    setContactInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleVideoUpload = (questionId: string, file: File) => {
    setCurrentVideo({
      file,
      questionId
    });
    setShowTrimmer(true);
  };

  const handleTrimComplete = async (trimmedVideo: Blob) => {
    if (!currentVideo) return;
    
    try {
      // יצירת FormData לשליחת הוידאו
      const formData = new FormData();
      formData.append('video', trimmedVideo);
      formData.append('questionId', currentVideo.questionId);
      
      const response = await fetch(`/api/projects/${id}/share/videos`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to upload video');
      }

      const { url } = await response.json();

      setVideos(prev => ({
        ...prev,
        [currentVideo.questionId]: { url }
      }));

      setShowTrimmer(false);
      setCurrentVideo(null);
    } catch (error: unknown) {
      console.error('Failed to handle video:', error);
      setError('Failed to upload video. Please try again.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // וידוא שיש וידאו לשאלות החובה
      const requiredQuestions = questions.filter(q => q.required);
      const missingVideos = requiredQuestions.filter(q => !videos[q.id]?.url);
      
      if (missingVideos.length > 0) {
        throw new Error(`Please upload videos for the following questions: ${missingVideos.map(q => q.text).join(', ')}`);
      }

      // שליחת הטופס
      const formData = {
        contactInfo: {
          ...contactInfo,
          relation: contactInfo.relation === 'other' ? customRelation : contactInfo.relation
        },
        videos: Object.entries(videos).map(([questionId, video]) => ({
          questionId,
          url: video.url
        }))
      };

      const response = await fetch(`/api/projects/${id}/share/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Failed to submit form');
      }

      // מעבר לדף תודה
      router.push(`/projects/${id}/share/thank-you`);
    } catch (error: unknown) {
      console.error('Failed to submit form:', error);
      setError(error instanceof Error ? error.message : 'Failed to submit form. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            הקלטת ברכה
          </h1>
          <p className="text-xl text-gray-600">
            תודה שאתם משתתפים! הברכה שלכם תשמח ותרגש.
          </p>
        </div>

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Contact Info Section */}
          <div className="bg-white shadow rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              פרטים אישיים
            </h2>
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                  שם מלא
                </label>
                <input
                  type="text"
                  id="fullName"
                  required
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  value={contactInfo.fullName}
                  onChange={(e) => handleContactInfoChange('fullName', e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  אימייל
                </label>
                <input
                  type="email"
                  id="email"
                  required
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  value={contactInfo.email}
                  onChange={(e) => handleContactInfoChange('email', e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  טלפון
                </label>
                <input
                  type="tel"
                  id="phone"
                  required
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  value={contactInfo.phone}
                  onChange={(e) => handleContactInfoChange('phone', e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="relation" className="block text-sm font-medium text-gray-700">
                  קרבה משפחתית/חברתית
                </label>
                <select
                  id="relation"
                  required
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  value={contactInfo.relation}
                  onChange={(e) => handleContactInfoChange('relation', e.target.value)}
                >
                  <option value="">בחר/י...</option>
                  {relationOptions.map(option => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {contactInfo.relation === 'other' && (
                <div>
                  <label htmlFor="customRelation" className="block text-sm font-medium text-gray-700">
                    פרט/י
                  </label>
                  <input
                    type="text"
                    id="customRelation"
                    required
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    value={customRelation}
                    onChange={(e) => setCustomRelation(e.target.value)}
                  />
                </div>
              )}
            </div>
          </div>

          {/* טיפים לצילום */}
          <div className="bg-white shadow rounded-lg p-6 mb-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              טיפים לצילום מוצלח 📸
            </h2>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-start">
                <svg className="w-5 h-5 text-green-500 mt-1 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                צלמו במקום שקט עם תאורה טובה
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-green-500 mt-1 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                החזיקו את הטלפון בצורה אופקית (Landscape)
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-green-500 mt-1 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                דברו ברור וטבעי, כאילו אתם משוחחים עם חבר
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-green-500 mt-1 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                אורך מומלץ לכל תשובה: 30 שניות עד 2 דקות
              </li>
            </ul>
          </div>

          {/* Video Questions */}
          <div className="space-y-6">
            {questions.map((question) => (
              <div key={question.id} className="bg-white shadow rounded-lg overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-1">
                        {question.text}
                      </h3>
                      {question.subtitle && (
                        <p className="text-gray-600 text-sm">
                          {question.subtitle}
                        </p>
                      )}
                    </div>
                    {question.required && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        חובה
                      </span>
                    )}
                  </div>

                  <div className="mt-6">
                    {!videos[question.id]?.url ? (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-blue-500 transition-colors">
                        <input
                          type="file"
                          accept="video/*"
                          className="hidden"
                          id={`video-${question.id}`}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleVideoUpload(question.id, file);
                          }}
                        />
                        <label
                          htmlFor={`video-${question.id}`}
                          className="cursor-pointer inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                        >
                          <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          העלאת סרטון
                        </label>
                        <p className="mt-2 text-sm text-gray-500">
                          או גררו קובץ לכאן
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="aspect-video bg-black rounded-lg overflow-hidden">
                          <video
                            controls
                            className="w-full h-full"
                            src={videos[question.id].url}
                          />
                        </div>
                        <div className="flex justify-end space-x-4">
                          <button
                            type="button"
                            onClick={() => {
                              setVideos(prev => {
                                const newVideos = { ...prev };
                                delete newVideos[question.id];
                                return newVideos;
                              });
                            }}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200"
                          >
                            מחיקה
                          </button>
                          <label
                            htmlFor={`video-${question.id}-replace`}
                            className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                          >
                            <input
                              type="file"
                              accept="video/*"
                              className="hidden"
                              id={`video-${question.id}-replace`}
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleVideoUpload(question.id, file);
                              }}
                            />
                            החלפה
                          </label>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="mr-3">
                  <h3 className="text-sm font-medium text-red-800">
                    {error}
                  </h3>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isSubmitting ? 'שולח...' : 'שליחת הברכה'}
            </button>
          </div>
        </form>
      </div>

      {/* Video Trimmer Modal */}
      {showTrimmer && currentVideo && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div>
                <div className="mt-3 text-center sm:mt-5">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    עריכת סרטון
                  </h3>
                  <div className="mt-2">
                    <VideoTrimmer
                      file={currentVideo.file}
                      onComplete={handleTrimComplete}
                    />
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-6">
                <button
                  type="button"
                  className="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm"
                  onClick={() => setShowTrimmer(false)}
                >
                  ביטול
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
