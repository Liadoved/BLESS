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
          <div className="flex justify-center">
            <GoogleSignIn />
          </div>
        </div>
      </div>
    </div>
  );
}
