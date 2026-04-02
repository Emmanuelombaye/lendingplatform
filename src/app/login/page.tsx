'use client';

import { Login } from '@/components/auth';
import { useAuth } from '@/components/providers/AuthProvider';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();

  const handleLoginSuccess = (data: any) => {
    router.push('/dashboard');
  };

  return <Login onLoginSuccess={handleLoginSuccess} />;
}
