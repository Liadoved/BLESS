import type { AppProps } from 'next/app';
import AuthProvider from '../components/AuthProvider';
import Navbar from '../components/Navbar';
import '../styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow">
          <Component {...pageProps} />
        </main>
      </div>
    </AuthProvider>
  );
}
