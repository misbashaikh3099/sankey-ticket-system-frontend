'use client';

import clsx from 'clsx';
import { priorityConfig, statusConfig } from '@/lib/utils';
import { Priority, TicketStatus } from '@/types';


export function PriorityBadge({ priority }: { priority: Priority }) {
  const cfg = priorityConfig[priority] || { label: priority, color: 'text-slate-400', bg: 'bg-slate-400/10', dot: 'bg-slate-400' };
  return (
    <span className={clsx('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold', cfg.color, cfg.bg)}>
      <span className={clsx('w-1.5 h-1.5 rounded-full', cfg.dot)} />
      {cfg.label}
    </span>
  );
}

export function StatusBadge({ status }: { status: TicketStatus | string }) {
  const cfg = statusConfig[status as TicketStatus] || { label: status, color: 'text-slate-400', bg: 'bg-slate-400/10' };
  return (
    <span className={clsx('inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold', cfg.color, cfg.bg)}>
      {cfg.label}
    </span>
  );
}


interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
}

export function Button({ variant = 'primary', size = 'md', loading, children, className, disabled, ...props }: ButtonProps) {
  const base = 'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed';
  const variants = {
    primary: 'bg-brand-600 hover:bg-brand-500 text-white shadow-lg shadow-brand-600/20',
    secondary: 'bg-white/8 hover:bg-white/12 text-white border border-white/10',
    danger: 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20',
    ghost: 'hover:bg-white/5 text-slate-400 hover:text-white',
  };
  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
  };
  return (
    <button className={clsx(base, variants[variant], sizes[size], className)} disabled={disabled || loading} {...props}>
      {loading && <span className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />}
      {children}
    </button>
  );
}

// ---- CARD ----
export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={clsx('rounded-2xl', className)} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
      {children}
    </div>
  );
}

// ---- INPUT ----
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}
export function Input({ label, error, className, ...props }: InputProps) {
  return (
    <div className="space-y-1.5">
      {label && <label className="block text-sm font-medium text-slate-300">{label}</label>}
      <input
        className={clsx(
          'w-full px-4 py-2.5 rounded-xl text-sm text-white placeholder-slate-500 outline-none transition-all',
          'bg-white/5 border border-white/10 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20',
          error && 'border-red-500/50 focus:border-red-500',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}


interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}
export function Textarea({ label, error, className, ...props }: TextareaProps) {
  return (
    <div className="space-y-1.5">
      {label && <label className="block text-sm font-medium text-slate-300">{label}</label>}
      <textarea
        className={clsx(
          'w-full px-4 py-2.5 rounded-xl text-sm text-white placeholder-slate-500 outline-none transition-all resize-none',
          'bg-white/5 border border-white/10 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20',
          error && 'border-red-500/50',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

// ---- SELECT ----
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}
export function Select({ label, error, options, className, ...props }: SelectProps) {
  return (
    <div className="space-y-1.5">
      {label && <label className="block text-sm font-medium text-slate-300">{label}</label>}
      <select
        className={clsx(
          'w-full px-4 py-2.5 rounded-xl text-sm text-white outline-none transition-all appearance-none cursor-pointer',
          'bg-white/5 border border-white/10 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20',
          error && 'border-red-500/50',
          className
        )}
        style={{ background: 'var(--bg-elevated)' }}
        {...props}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} style={{ background: 'var(--bg-elevated)' }}>
            {o.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}


export function Spinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-10 h-10' };
  return (
    <div className={clsx('rounded-full border-2 border-brand-500 border-t-transparent animate-spin', sizes[size])} />
  );
}

// ---- STAT CARD ----
export function StatCard({ label, value, icon, color = 'brand' }: { label: string; value: number | string; icon: React.ReactNode; color?: string }) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-slate-400">{label}</span>
        <div className={clsx('w-9 h-9 rounded-xl flex items-center justify-center text-lg', `bg-${color}-500/10 text-${color}-400`)}>
          {icon}
        </div>
      </div>
      <p className="text-3xl font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>{value}</p>
    </Card>
  );
}

// ---- EMPTY STATE ----
export function EmptyState({ title, message, icon }: { title: string; message: string; icon?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      {icon && <div className="text-5xl mb-4 text-slate-600">{icon}</div>}
      <h3 className="text-lg font-semibold text-slate-300 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 max-w-sm">{message}</p>
    </div>
  );
}

// ---- PAGE HEADER ----
export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between mb-8">
      <div>
        <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>{title}</h1>
        {subtitle && <p className="text-sm text-slate-400 mt-1">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
