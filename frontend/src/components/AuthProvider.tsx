import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../lib/firebase';

interface AuthProviderProps {
  children: ReactNode;
}

const publicPaths = ['/login', '/privacy', '/terms'];

export default function AuthProvider({ children }: AuthProviderProps) {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  
  // Only use auth on client side and when auth is defined
  const [user, loading] = typeof window !== 'undefined' && auth ? useAuthState(auth) : [null, true];

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !loading) {
      if (!user && !publicPaths.includes(router.pathname)) {
        router.push('/login');
      }
    }
  }, [user, loading, router, mounted]);

  // Don't render anything on server side
  if (!mounted) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return <>{children}</>;
}
