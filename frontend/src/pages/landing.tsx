import { useRouter } from 'next/router';
import Image from 'next/image';
import GoogleSignIn from '../components/GoogleSignIn';

export default function Landing() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            ברוכים הבאים ל-BLESS
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            המערכת שתעזור לכם לנהל את הפרויקטים שלכם בצורה חכמה
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
