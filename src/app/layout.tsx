import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: 'MangaStream | Premium Manga Hosting',
  description: 'Read the latest manga online in high quality with a sleek dark mode reader.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen flex flex-col bg-slate-900 text-slate-100 selection:bg-purple-500/30 selection:text-purple-200">
        <Navbar />
        <main className="flex-1 w-full filter drop-shadow-sm">
          {children}
        </main>
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1e293b',
              color: '#fff',
              border: '1px solid #334155',
            },
            success: {
              iconTheme: {
                primary: '#a855f7',
                secondary: '#fff',
              },
            },
          }}
        />
      </body>
    </html>
  );
}
