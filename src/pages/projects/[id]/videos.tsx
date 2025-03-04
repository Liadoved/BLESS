import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { getAuth } from 'firebase/auth';
import VideoTrimmer from '../../../components/VideoTrimmer';

interface VideoQuestion {
  id: string;
  text: string;
  subtitle?: string;
  required: boolean;
}

interface Video {
  id: string;
  url: string;
  questionId?: string;
  title: string;
  description: string;
  uploadedBy: string;
  uploadedAt: string;
  status: string;
}

export default function ProjectVideos() {
  const router = useRouter();
  const { id } = router.query;
  const [videos, setVideos] = useState<Video[]>([]);
  const [questions, setQuestions] = useState<VideoQuestion[]>([
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
  ]);
  const [showTrimmer, setShowTrimmer] = useState(false);
  const [currentVideo, setCurrentVideo] = useState<{ file: File, title: string, description: string, questionId?: string } | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (id) {
      fetchVideos();
    }
  }, [id]);

  const fetchVideos = async () => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        router.push('/login');
        return;
      }

      const idToken = await user.getIdToken();
      
      const response = await fetch(`/api/projects/${id}/videos`, {
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch videos');
      }

      const data = await response.json();
      setVideos(data.videos || []);
    } catch (error: any) {
      console.error('Failed to fetch videos:', error);
      alert(error?.message || 'Failed to fetch videos');
    }
  };

  const handleVideoUpload = async (file: File, questionId?: string) => {
    setCurrentVideo({ 
      file,
      title: questionId ? questions.find(q => q.id === questionId)?.text || '' : '',
      description: questionId ? questions.find(q => q.id === questionId)?.subtitle || '' : '',
      questionId
    });
    setShowTrimmer(true);
  };

  const handleTrimComplete = async (trimmedVideo: Blob) => {
    if (!currentVideo) return;
    setIsUploading(true);

    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        console.error('No user logged in');
        router.push('/login');
        return;
      }

      const idToken = await user.getIdToken();

      // Upload to Firebase Storage
      const formData = new FormData();
      formData.append('video', trimmedVideo);
      formData.append('title', currentVideo.title);
      formData.append('description', currentVideo.description);
      if (currentVideo.questionId) {
        formData.append('questionId', currentVideo.questionId);
      }

      const response = await fetch(`/api/projects/${id}/videos`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to upload video');
      }

      const newVideo = await response.json();
      setVideos(prev => [...prev, newVideo]);
      setShowTrimmer(false);
      setCurrentVideo(null);
    } catch (error: any) {
      console.error('Failed to upload video:', error);
      alert(error?.message || 'Failed to upload video');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="py-10">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          {/* Header */}
          <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6 mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              הקלטת ברכה
            </h1>
            <p className="text-gray-600 max-w-2xl">
              הקליטו ברכה מרגשת ואישית. תוכלו לערוך את הסרטון לפני השליחה.
            </p>
          </div>

          {/* טיפים לצילום */}
          <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6 mb-6">
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
                              if (file) handleVideoUpload(file, question.id);
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
                              src={video.url}
                            />
                          </div>
                          <div className="flex justify-end space-x-4">
                            <button
                              onClick={async () => {
                                try {
                                  const auth = getAuth();
                                  const user = auth.currentUser;
                                  if (!user) {
                                    console.error('No user logged in');
                                    router.push('/login');
                                    return;
                                  }

                                  const idToken = await user.getIdToken();
                                  
                                  const response = await fetch(`/api/projects/${id}/videos/${video.id}`, {
                                    method: 'DELETE',
                                    headers: {
                                      'Authorization': `Bearer ${idToken}`
                                    }
                                  });

                                  if (!response.ok) {
                                    throw new Error('Failed to delete video');
                                  }

                                  setVideos(prev => prev.filter(v => v.id !== video.id));
                                } catch (error: any) {
                                  console.error('Failed to delete video:', error);
                                  alert(error?.message || 'Failed to delete video');
                                }
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
                                  if (file) handleVideoUpload(file, question.id);
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
              );
            })}
          </div>

          {/* כפתור שליחה */}
          <div className="mt-8 flex justify-end">
            <button
              onClick={async () => {
                try {
                  const auth = getAuth();
                  const user = auth.currentUser;
                  if (!user) {
                    console.error('No user logged in');
                    router.push('/login');
                    return;
                  }

                  const idToken = await user.getIdToken();
                  
                  const response = await fetch(`/api/projects/${id}/videos/complete`, {
                    method: 'POST',
                    headers: {
                      'Authorization': `Bearer ${idToken}`
                    }
                  });

                  if (!response.ok) {
                    throw new Error('Failed to complete videos');
                  }

                  router.push(`/projects/${id}/thank-you`);
                } catch (error: any) {
                  console.error('Failed to complete videos:', error);
                  alert(error?.message || 'Failed to complete videos');
                }
              }}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              סיום והגשה
            </button>
          </div>
        </div>
      </main>

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
                    <input
                      type="text"
                      placeholder="כותרת"
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md mb-4"
                      value={currentVideo.title}
                      onChange={(e) => setCurrentVideo(prev => ({ ...prev!, title: e.target.value }))}
                    />
                    <textarea
                      placeholder="תיאור"
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md mb-4"
                      value={currentVideo.description}
                      onChange={(e) => setCurrentVideo(prev => ({ ...prev!, description: e.target.value }))}
                    />
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
                  className="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
                  onClick={() => setShowTrimmer(false)}
                  disabled={isUploading}
                >
                  {isUploading ? 'מעלה...' : 'ביטול'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
