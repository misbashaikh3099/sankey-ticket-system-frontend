'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { authApi } from '@/lib/authApi';
import { Button, Input, Card } from '@/components/ui';
import toast from 'react-hot-toast';
import { RiTicketLine, RiMailLine, RiLockLine } from 'react-icons/ri';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authApi.login(form);
      login(
        { id: res.id, name: res.name, email: res.email, role: res.role },
        res.token
      );
      toast.success(`Welcome back, ${res.name}!`);
      router.push('/dashboard');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-slide-up">
      {/* Logo */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-14 h-14 rounded-2xl bg-brand-600 flex items-center justify-center mb-4 shadow-2xl shadow-brand-600/30">
          <RiTicketLine className="text-white text-3xl" />
        </div>
        <h1 className="text-3xl font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>
          TicketDesk
        </h1>
        <p className="text-slate-400 mt-1 text-sm">Sign in to your account</p>
      </div>

      <Card className="p-7">
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Email address"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
          <Button type="submit" loading={loading} size="lg" className="w-full mt-2">
            Sign In
          </Button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-6">
          Don&apos;t have an account?{' '}
          <Link href="/auth/register" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">
            Create one
          </Link>
        </p>
      </Card>

    
      <p className="text-center text-xs text-slate-600 mt-4">
        Secure access · JWT Authentication
      </p>
    </div>
  );
}
