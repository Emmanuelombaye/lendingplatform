'use client';

import { Register } from '@/components/auth';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();

  const handleLoginSuccess = (data: any) => {
    router.push('/dashboard');
  };

  return <Register onLoginSuccess={handleLoginSuccess} />;
}
