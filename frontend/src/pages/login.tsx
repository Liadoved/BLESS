import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../lib/firebase';
import GoogleSignIn from '../components/GoogleSignIn';

export default function LoginPage() {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            התחבר לחשבון שלך
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            כדי להתחיל להשתמש במערכת
          </p>
        </div>
        <div className="mt-8 space-y-6">
          <div className="rounded-md bg-yellow-50 p-4 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="mr-3">
                <h3 className="text-sm font-medium text-yellow-800">הערה חשובה</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    אם אתה מנסה להתחבר לחשבון "דומייני לא מורשה", יש לדעת את הדומייני הנרשם לרשימת הדומיינים המורשים ב-Firebase Authentication.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-center">
            <GoogleSignIn />
          </div>
        </div>
      </div>
    </div>
  );
}
