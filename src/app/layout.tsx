'use client'
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { Provider } from 'react-redux';
import { store } from '../../redux/store';
// import { store } from '@/redux/store'; 

// export const metadata: Metadata = {
//   title: 'Seda Admin Panel',
//   description: 'Admin Panel for Seda',
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <Provider store={store}>
          {children}
          <Toaster />
        </Provider>
      </body>
    </html>
  );
}
