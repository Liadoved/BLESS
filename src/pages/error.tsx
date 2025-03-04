import { useRouter } from 'next/router';
import Link from 'next/link';

export default function ErrorPage() {
  const router = useRouter();
  const { message } = router.query;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            שגיאה
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {message || 'אירעה שגיאה לא צפויה'}
          </p>
        </div>
        <div className="mt-8 text-center">
          <Link href="/" className="text-indigo-600 hover:text-indigo-500">
            חזרה לדף הבית
          </Link>
        </div>
      </div>
    </div>
  );
}
