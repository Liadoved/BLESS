import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../lib/firebase';
import GoogleSignIn from '../components/GoogleSignIn';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';

export default function Home() {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [userProjects, setUserProjects] = useState<any[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);

  // Fetch user's projects when authenticated
  useEffect(() => {
    async function fetchUserProjects() {
      if (!user) return;
      
      setIsLoadingProjects(true);
      try {
        const db = getFirestore();
        const projectsRef = collection(db, 'projects');
        const q = query(projectsRef, where('createdBy', '==', user.uid));
        const querySnapshot = await getDocs(q);
        
        const projects: any[] = [];
        querySnapshot.forEach((doc) => {
          projects.push({
            id: doc.id,
            ...doc.data()
          });
        });
        
        setUserProjects(projects);
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setIsLoadingProjects(false);
      }
    }

    if (user) {
      fetchUserProjects();
    }
  }, [user]);

  // If not authenticated, show landing page
  if (!user && !loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="relative pt-6 pb-16 sm:pb-24">
          <main className="mt-16 mx-auto max-w-7xl px-4 sm:mt-24">
            <div className="text-center">
              <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                <span className="block">ברוכים הבאים ל-</span>
                <span className="block text-blue-600">BLESS</span>
              </h1>
              <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
                המערכת החכמה לניהול אירועים ושמירת קשר עם המוזמנים שלך
              </p>
              <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
                <div className="rounded-md shadow">
                  <div className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10">
                    <GoogleSignIn />
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>

        {/* Feature Section */}
        <div className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:text-center">
              <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">יתרונות</h2>
              <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                דרך חכמה יותר לנהל את האירועים שלך
              </p>
              <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
                BLESS מאפשרת לך לנהל את האירועים שלך בצורה חכמה ויעילה
              </p>
            </div>

            <div className="mt-10">
              <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
                <div className="relative">
                  <dt>
                    <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                      <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                    <p className="mr-16 text-lg leading-6 font-medium text-gray-900">ניהול מוזמנים</p>
                  </dt>
                  <dd className="mt-2 mr-16 text-base text-gray-500">
                    נהל את רשימת המוזמנים שלך בקלות, שלח הזמנות ועקוב אחר תשובות
                  </dd>
                </div>

                <div className="relative">
                  <dt>
                    <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                      <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="mr-16 text-lg leading-6 font-medium text-gray-900">תזכורות חכמות</p>
                  </dt>
                  <dd className="mt-2 mr-16 text-base text-gray-500">
                    שלח תזכורות אוטומטיות למוזמנים שלך לפני האירוע
                  </dd>
                </div>

                <div className="relative">
                  <dt>
                    <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                      <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <p className="mr-16 text-lg leading-6 font-medium text-gray-900">סטטיסטיקות וניתוחים</p>
                  </dt>
                  <dd className="mt-2 mr-16 text-base text-gray-500">
                    קבל סטטיסטיקות וניתוחים על האירוע שלך בזמן אמת
                  </dd>
                </div>

                <div className="relative">
                  <dt>
                    <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                      <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="mr-16 text-lg leading-6 font-medium text-gray-900">תקשורת פשוטה</p>
                  </dt>
                  <dd className="mt-2 mr-16 text-base text-gray-500">
                    תקשר עם המוזמנים שלך בקלות דרך הודעות אישיות או קבוצתיות
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If user is authenticated but projects are still loading
  if (isLoadingProjects) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">טוען את הפרויקטים שלך...</p>
        </div>
      </div>
    );
  }

  // If user has projects, show project list
  if (userProjects.length > 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">הפרויקטים שלי</h1>
            <button
              onClick={() => router.push('/new-project')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              פרויקט חדש
            </button>
          </div>
          
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {userProjects.map((project) => (
                <li key={project.id}>
                  <a
                    href={`/projects/${project.id}/dashboard`}
                    className="block hover:bg-gray-50"
                  >
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <p className="text-lg font-medium text-blue-600 truncate">
                          {project.celebrantName}
                        </p>
                        <div className="mr-2 flex-shrink-0 flex">
                          <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            {project.eventType === 'birthday' ? 'יום הולדת' :
                             project.eventType === 'wedding' ? 'חתונה' :
                             project.eventType === 'bar_mitzvah' ? 'בר מצווה' :
                             project.eventType === 'bat_mitzvah' ? 'בת מצווה' :
                             project.eventType === 'anniversary' ? 'יום נישואין' : 'אחר'}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-sm text-gray-500">
                            {project.deadline && (
                              <>
                                <svg className="flex-shrink-0 ml-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                </svg>
                                {new Date(project.deadline).toLocaleDateString('he-IL')}
                              </>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // If user has no projects, redirect to create project page
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full mx-auto space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            ברוך הבא, {user?.displayName}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            נראה שאין לך פרויקטים עדיין. בוא ניצור את הפרויקט הראשון שלך!
          </p>
        </div>
        
        <div className="flex justify-center">
          <button
            onClick={() => router.push('/new-project')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md text-base font-medium"
          >
            צור פרויקט חדש
          </button>
        </div>
      </div>
    </div>
  );
}
