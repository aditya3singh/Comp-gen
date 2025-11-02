import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/components/providers/AuthProvider';
import { FastAuthProvider } from '@/components/providers/FastAuthProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'AI Component Generator',
  description: 'Generate React components with AI',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <FastAuthProvider>
            {children}
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 3000,
                style: {
                  background: '#fff',
                  color: '#333',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                },
              }}
            />
          </FastAuthProvider>
        </AuthProvider>
      </body>
    </html>
  );
}