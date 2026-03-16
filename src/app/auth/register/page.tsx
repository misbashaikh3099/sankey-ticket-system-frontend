'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/authApi';
import { Button, Input, Select, Card } from '@/components/ui';
import toast from 'react-hot-toast';
import { RiTicketLine } from 'react-icons/ri';
import { Role } from '@/types';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'BUYER' as Role });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authApi.register(form);
      toast.success('Account created! Please sign in.');
      router.push('/auth/login');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-slide-up">
      <div className="flex flex-col items-center mb-8">
        <div className="w-14 h-14 rounded-2xl bg-brand-600 flex items-center justify-center mb-4 shadow-2xl shadow-brand-600/30">
          <RiTicketLine className="text-white text-3xl" />
        </div>
        <h1 className="text-3xl font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>
          Create Account
        </h1>
        <p className="text-slate-400 mt-1 text-sm">Join TicketDesk today</p>
      </div>

      <Card className="p-7">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full name"
            placeholder="John Doe"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
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
          <Select
            label="Role"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value as Role })}
            options={[
              { value: 'BUYER', label: 'Buyer — Submit support tickets' },
              { value: 'VENDOR', label: 'Vendor — Handle support tickets' },
              { value: 'ADMIN', label: 'Admin — Full access' },
            ]}
          />
          <Button type="submit" loading={loading} size="lg" className="w-full mt-2">
            Create Account
          </Button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-6">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">
            Sign in
          </Link>
        </p>
      </Card>
    </div>
  );
}
