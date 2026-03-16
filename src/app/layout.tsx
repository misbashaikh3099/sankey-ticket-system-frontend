import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: 'TicketDesk — Support Portal',
  description: 'Modern support ticket management system',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#1a2235',
                color: '#e2e8f0',
                border: '1px solid rgba(255,255,255,0.1)',
                fontFamily: 'DM Sans, sans-serif',
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
