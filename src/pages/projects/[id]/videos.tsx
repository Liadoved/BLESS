import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { VideoQuestion, Contact, ContactVideo } from '../../../types';
import VideoTrimmer from '../../../components/VideoTrimmer';

export default function ProjectVideos() {
  const router = useRouter();
  const { id } = router.query;
  const [contact, setContact] = useState<Contact | null>(null);
  const [questions, setQuestions] = useState<VideoQuestion[]>([]);
  const [videos, setVideos] = useState<ContactVideo[]>([]);
  const [showTrimmer, setShowTrimmer] = useState(false);
  const [currentVideo, setCurrentVideo] = useState<{ file: File, questionId: string } | null>(null);

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  const fetchData = async () => {
    try {
      const [questionsRes, contactRes] = await Promise.all([
        fetch(`/api/projects/${id}/questions`),
        fetch(`/api/projects/${id}/contact`)
      ]);

      const [questionsData, contactData] = await Promise.all([
        questionsRes.json(),
        contactRes.json()
      ]);

      setQuestions(questionsData);
      setContact(contactData);
      if (contactData) {
        setVideos(contactData.videos || []);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  const handleVideoUpload = async (questionId: string, file: File) => {
    setCurrentVideo({ file, questionId });
    setShowTrimmer(true);
  };

  const handleTrimComplete = async (trimmedFile: File) => {
    if (!currentVideo) return;

    const formData = new FormData();
    formData.append('video', trimmedFile);
    formData.append('questionId', currentVideo.questionId);

    try {
      const response = await fetch(`/api/projects/${id}/videos/upload`, {
        method: 'POST',
        body: formData
      });

      const video = await response.json();
      setVideos([...videos, video]);
      setShowTrimmer(false);
      setCurrentVideo(null);
    } catch (error) {
      console.error('Failed to upload video:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            הקלטת ברכה
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            הקליטו ברכה מרגשת ואישית. תוכלו לערוך את הסרטון לפני השליחה.
          </p>
        </div>

        {/* הנחיות צילום */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            טיפים לצילום מוצלח 📸
          </h2>
          <ul className="space-y-3 text-gray-600">
            <li className="flex items-start">
              <svg className="w-5 h-5 text-green-500 mt-1 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              צלמו במקום שקט עם תאורה טובה
            </li>
            <li className="flex items-start">
              <svg className="w-5 h-5 text-green-500 mt-1 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              החזיקו את הטלפון בצורה אופקית (Landscape)
            </li>
            <li className="flex items-start">
              <svg className="w-5 h-5 text-green-500 mt-1 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              דברו ברור וטבעי, כאילו אתם משוחחים עם חבר
            </li>
            <li className="flex items-start">
              <svg className="w-5 h-5 text-green-500 mt-1 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              אורך מומלץ לכל תשובה: 30 שניות עד 2 דקות
            </li>
          </ul>
        </div>

        {/* שאלות וסרטונים */}
        <div className="space-y-6">
          {questions.map((question) => {
            const video = videos.find(v => v.questionId === question.id);
            
            return (
              <div key={question.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
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
                    {!video ? (
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
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                            poster={video.thumbnailUrl}
                          >
                            <source src={`/api/videos/${video.driveFileId}`} type="video/mp4" />
                          </video>
                        </div>
                        <div className="flex justify-end space-x-4">
                          <button
                            onClick={() => {
                              // מחיקת הסרטון
                            }}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200"
                          >
                            מחיקה
                          </button>
                          <button
                            onClick={() => {
                              // החלפת הסרטון
                            }}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                          >
                            החלפה
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* כפתור שליחה */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={async () => {
              try {
                await fetch(`/api/projects/${id}/videos/complete`, {
                  method: 'POST'
                });
                router.push(`/projects/${id}/thank-you`);
              } catch (error) {
                console.error('Failed to complete videos:', error);
              }
            }}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            סיום והגשה
          </button>
        </div>
      </div>

      {/* עורך וידאו */}
      {showTrimmer && currentVideo && (
        <VideoTrimmer
          file={currentVideo.file}
          onClose={() => setShowTrimmer(false)}
          onSave={handleTrimComplete}
        />
      )}
    </div>
  );
}
