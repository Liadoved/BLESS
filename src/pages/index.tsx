import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Project, UserSession } from '../types';
import { useGoogleAuth } from '../hooks/useGoogleAuth';

export default function Home() {
  const router = useRouter();
  const { user, signIn } = useGoogleAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [projectData, setProjectData] = useState({
    celebrantName: '',
    celebrantGender: 'male',
    eventType: 'birthday',
    deadline: '',
    managerName: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // יצירת תיקיות בדרייב
      const response = await fetch('/api/projects/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(projectData)
      });

      const project = await response.json();
      router.push(`/projects/${project.id}/dashboard`);
    } catch (error) {
      console.error('Failed to create project:', error);
      // להוסיף הודעת שגיאה למשתמש
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      router.push('/landing');
    }
  }, [user, router]);

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            יצירת פרויקט חדש
          </h1>
          <p className="text-gray-600">
            מלאו את הפרטים הבאים כדי להתחיל באיסוף הזכרונות
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-lg shadow">
          <div className="space-y-4">
            <div>
              <label htmlFor="celebrantName" className="block text-sm font-medium text-gray-700">
                שם בעל/ת השמחה
              </label>
              <input
                type="text"
                id="celebrantName"
                required
                value={projectData.celebrantName}
                onChange={(e) => setProjectData({ ...projectData, celebrantName: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                מין
              </label>
              <select
                value={projectData.celebrantGender}
                onChange={(e) => setProjectData({ ...projectData, celebrantGender: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="male">זכר</option>
                <option value="female">נקבה</option>
                <option value="other">אחר</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                סוג האירוע
              </label>
              <select
                value={projectData.eventType}
                onChange={(e) => setProjectData({ ...projectData, eventType: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="birthday">יום הולדת</option>
                <option value="retirement">פרישה</option>
                <option value="wedding">חתונה</option>
                <option value="other">אחר</option>
              </select>
            </div>

            <div>
              <label htmlFor="deadline" className="block text-sm font-medium text-gray-700">
                תאריך יעד
              </label>
              <input
                type="date"
                id="deadline"
                required
                value={projectData.deadline}
                onChange={(e) => setProjectData({ ...projectData, deadline: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="managerName" className="block text-sm font-medium text-gray-700">
                שם מנהל/ת הפרויקט
              </label>
              <input
                type="text"
                id="managerName"
                required
                value={projectData.managerName}
                onChange={(e) => setProjectData({ ...projectData, managerName: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  יוצר פרויקט...
                </>
              ) : (
                'יצירת פרויקט'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
