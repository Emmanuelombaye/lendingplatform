'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { Dashboard } from '@/components/dashboard/Dashboard';

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Small delay to let AuthProvider sync-init from localStorage before redirecting
    const timer = setTimeout(() => {
      if (!isLoading && !user) {
        router.replace('/login');
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [user, isLoading, router]);

  // Show spinner only during background token validation
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return <Dashboard />;
}
