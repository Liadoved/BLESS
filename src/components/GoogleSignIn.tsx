import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useRouter } from 'next/router';

export default function GoogleSignIn() {
  const router = useRouter();
  const provider = new GoogleAuthProvider();

  const signInWithGoogle = async () => {
    try {
      console.log('Starting Google sign in...');
      console.log('Auth object:', auth);
      
      if (!auth) {
        console.error('Auth is not initialized');
        throw new Error('מערכת האימות לא אותחלה כראוי. נסה לרענן את הדף.');
      }

      console.log('Calling signInWithPopup...');
      const result = await signInWithPopup(auth, provider);
      
      console.log('Sign in successful, getting user...');
      const user = result.user;
      
      // Get the Google Access Token
      console.log('Getting credentials...');
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential?.accessToken;

      console.log('Successfully signed in:', { 
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        hasToken: !!token
      });
      
      // Redirect to home page after successful sign in
      console.log('Redirecting to home page...');
      router.push('/');
    } catch (error: any) {
      console.error('Error signing in with Google:', error);
      
      // Show error message to user
      alert(`התחברות נכשלה: ${error?.message || 'אירעה שגיאה בהתחברות'}`);
    }
  };

  return (
    <button
      onClick={signInWithGoogle}
      className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
    >
      <span className="absolute left-0 inset-y-0 flex items-center pl-3">
        <svg className="h-5 w-5 text-blue-500 group-hover:text-blue-400" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
          <path fillRule="evenodd" d="M10 0C4.477 0 0 4.477 0 10c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0110 4.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.933.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C17.14 18.163 20 14.418 20 10c0-5.523-4.477-10-10-10z" clipRule="evenodd" />
        </svg>
      </span>
      התחבר עם Google
    </button>
  );
}
