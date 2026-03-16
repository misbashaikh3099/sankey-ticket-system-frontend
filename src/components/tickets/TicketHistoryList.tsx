'use client';

import { TicketHistory } from '@/types';
import { StatusBadge } from '@/components/ui';
import { formatDateTime } from '@/lib/utils';
import { RiTimeLine } from 'react-icons/ri';

export default function TicketHistoryList({ history }: { history: TicketHistory[] }) {
  if (history.length === 0) {
    return <p className="text-sm text-slate-500 text-center py-4">No history yet</p>;
  }

  return (
    <div className="relative pl-6">
     
      <div className="absolute left-2.5 top-2 bottom-2 w-px bg-white/8" />

      <div className="space-y-4">
        {history.map((h, i) => (
          <div key={h.id} className="relative flex items-start gap-3">
         
            <div className="absolute -left-4 top-1 w-3 h-3 rounded-full border-2 border-brand-500 bg-brand-900 z-10" />
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-0.5">
                <StatusBadge status={h.status} />
                <span className="text-xs text-slate-500">
                  by <span className="text-slate-400 font-mono">{h.changedBy?.slice(0, 8)}…</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-1">
                <RiTimeLine /> {formatDateTime(h.changedAt)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
