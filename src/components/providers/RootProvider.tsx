'use client';

import React, { useEffect } from 'react';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';
import '@/lib/i18n';
import { AuthProvider } from './AuthProvider';
import { useTranslation } from 'react-i18next';
import { getStoredRegion } from '@/lib/regions';

export function RootProvider({ children }: { children: React.ReactNode }) {
  const { i18n } = useTranslation();

  // Switch to the user's stored language AFTER hydration to avoid mismatch
  useEffect(() => {
    const region = getStoredRegion();
    if (i18n.language !== region.language) {
      i18n.changeLanguage(region.language);
    }
  }, []);

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
      <AuthProvider>
        <Toaster richColors position="top-right" />
        {children}
      </AuthProvider>
    </ThemeProvider>
  );
}
