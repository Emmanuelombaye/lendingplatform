'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { Navbar, Footer, ApplicationFlow } from '@/components/client';
import { authService } from '@/lib/authUtils';

export default function ApplyPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [pendingApplication, setPendingApplication] = useState<any>(null);

  useEffect(() => {
    // Restore any pending application saved before auth redirect
    const pending = authService.getPendingApplication();
    if (pending) setPendingApplication(pending);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar user={user} onLogout={() => authService.logout((path) => router.push(path))} />
      <main className="pt-24">
        <ApplicationFlow
          user={user}
          pendingApplication={pendingApplication}
          setPendingApplication={(app: any) => {
            setPendingApplication(app);
            if (!app) router.push('/dashboard');
          }}
        />
      </main>
      <Footer />
    </div>
  );
}
