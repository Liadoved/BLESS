import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../lib/firebase';
import { Project, UserSession } from '../types';

export default function Home() {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
    setError(null);
    
    try {
      console.log('Getting ID token...');
      // Get the current user's ID token
      const idToken = await user?.getIdToken();
      if (!idToken) {
        throw new Error('No auth token available');
      }
      console.log('Got ID token');

      console.log('Creating project...', projectData);
      // Create the project
      const response = await fetch('/api/projects/new', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify(projectData)
      });

      if (!response.ok) {
        let errorMessage = 'Failed to create project';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.details || errorMessage;
        } catch (parseError) {
          console.error('Error parsing error response:', parseError);
          errorMessage = `Server error (${response.status}): ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      console.log('Project created successfully');
      const project = await response.json();
      console.log('Redirecting to dashboard...');
      router.push(`/projects/${project.id}/dashboard`);
    } catch (error: any) {
      console.error('Failed to create project:', error);
      setError(error?.message || 'אירעה שגיאה ביצירת הפרויקט');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProjectData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [loading, user, router]);

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Only render the form if we have a user
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full mx-auto space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            יצירת פרויקט חדש
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            מלא את הפרטים הבאים כדי ליצור פרויקט חדש
          </p>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div className="mb-4">
              <label htmlFor="celebrantName" className="block text-sm font-medium text-gray-700 mb-1">
                שם החוגג/ת
              </label>
              <input
                id="celebrantName"
                name="celebrantName"
                type="text"
                required
                value={projectData.celebrantName}
                onChange={handleChange}
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="שם החוגג/ת"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="celebrantGender" className="block text-sm font-medium text-gray-700 mb-1">
                מגדר
              </label>
              <select
                id="celebrantGender"
                name="celebrantGender"
                value={projectData.celebrantGender}
                onChange={handleChange}
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              >
                <option value="male">זכר</option>
                <option value="female">נקבה</option>
                <option value="other">אחר</option>
              </select>
            </div>

            <div className="mb-4">
              <label htmlFor="eventType" className="block text-sm font-medium text-gray-700 mb-1">
                סוג האירוע
              </label>
              <select
                id="eventType"
                name="eventType"
                value={projectData.eventType}
                onChange={handleChange}
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              >
                <option value="birthday">יום הולדת</option>
                <option value="wedding">חתונה</option>
                <option value="bar_mitzvah">בר מצווה</option>
                <option value="bat_mitzvah">בת מצווה</option>
                <option value="anniversary">יום נישואין</option>
                <option value="other">אחר</option>
              </select>
            </div>

            <div className="mb-4">
              <label htmlFor="deadline" className="block text-sm font-medium text-gray-700 mb-1">
                תאריך האירוע (אופציונלי)
              </label>
              <input
                id="deadline"
                name="deadline"
                type="date"
                value={projectData.deadline}
                onChange={handleChange}
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="managerName" className="block text-sm font-medium text-gray-700 mb-1">
                שם המנהל/ת (אופציונלי)
              </label>
              <input
                id="managerName"
                name="managerName"
                type="text"
                value={projectData.managerName}
                onChange={handleChange}
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="שם המנהל/ת"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                isLoading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
            >
              {isLoading ? (
                <>
                  <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </span>
                  יוצר פרויקט...
                </>
              ) : (
                'צור פרויקט'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
