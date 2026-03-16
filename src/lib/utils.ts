import { Priority, TicketStatus } from '@/types';

export const priorityConfig: Record<Priority, { label: string; color: string; bg: string; dot: string }> = {
  LOW: { label: 'Low', color: 'text-emerald-400', bg: 'bg-emerald-400/10', dot: 'bg-emerald-400' },
  MEDIUM: { label: 'Medium', color: 'text-amber-400', bg: 'bg-amber-400/10', dot: 'bg-amber-400' },
  HIGH: { label: 'High', color: 'text-orange-400', bg: 'bg-orange-400/10', dot: 'bg-orange-400' },
  CRITICAL: { label: 'Critical', color: 'text-red-400', bg: 'bg-red-400/10', dot: 'bg-red-400' },
};

export const statusConfig: Record<TicketStatus, { label: string; color: string; bg: string }> = {
  OPEN: { label: 'Open', color: 'text-blue-400', bg: 'bg-blue-400/10' },
  ASSIGNED: { label: 'Assigned', color: 'text-violet-400', bg: 'bg-violet-400/10' },
  IN_PROGRESS: { label: 'In Progress', color: 'text-amber-400', bg: 'bg-amber-400/10' },
  RESOLVED: { label: 'Resolved', color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  CLOSED: { label: 'Closed', color: 'text-slate-400', bg: 'bg-slate-400/10' },
};

export function formatDate(dateStr: string): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

export function formatDateTime(dateStr: string): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

export function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}
