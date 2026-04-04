'use client';

import React from 'react';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';
import '@/lib/i18n'; // Init i18n
import { AuthProvider } from './AuthProvider';
import { useTranslation } from 'react-i18next';

export function RootProvider({ children }: { children: React.ReactNode }) {
  const { i18n } = useTranslation();

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
      <AuthProvider>
        <Toaster richColors position="top-right" />
        {children}
      </AuthProvider>
    </ThemeProvider>
  );
}
