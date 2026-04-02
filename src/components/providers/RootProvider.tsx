'use client';

import React, { useEffect, useState } from 'react';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';
import '@/lib/i18n'; // Init i18n
import { AuthProvider } from './AuthProvider';
import { useTranslation } from 'react-i18next';

export function RootProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const { i18n } = useTranslation();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="min-h-screen bg-white" />;
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <AuthProvider>
        <Toaster richColors position="top-right" />
        {children}
      </AuthProvider>
    </ThemeProvider>
  );
}
