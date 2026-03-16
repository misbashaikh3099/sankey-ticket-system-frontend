'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { ticketApi } from '@/lib/ticketApi';
import { Ticket, TicketHistory } from '@/types';
import { Card, Button, PriorityBadge, StatusBadge, Spinner } from '@/components/ui';
import TicketComments from '@/components/tickets/TicketComments';
import TicketHistoryList from '@/components/tickets/TicketHistoryList';
import { formatDateTime } from '@/lib/utils';
import toast from 'react-hot-toast';
import { RiArrowLeftLine, RiTimeLine, RiUserLine, RiPlayLine, RiCheckLine } from 'react-icons/ri';

export default function VendorTicketDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [history, setHistory] = useState<TicketHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => { loadTicket(); }, [id]);

  const loadTicket = async () => {
    setLoading(true);
    try {
      const [t, h] = await Promise.all([ticketApi.getById(id), ticketApi.getHistory(id)]);
      setTicket(t);
      setHistory(h);
    } catch {
      toast.error('Failed to load ticket');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (status: string) => {
    setUpdating(status);
    try {
      await ticketApi.updateStatus(id, status);
      toast.success(`Status updated to ${status.replace('_', ' ')}`);
      loadTicket();
    } catch {
      toast.error('Failed to update status');
    } finally {
      setUpdating(null);
    }
  };

  if (loading) return (
    <DashboardLayout>
      <div className="flex justify-center py-20"><Spinner size="lg" /></div>
    </DashboardLayout>
  );

  if (!ticket) return (
    <DashboardLayout><p className="text-slate-400">Ticket not found</p></DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div className="mb-6">
        <button onClick={() => router.back()} className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors mb-4">
          <RiArrowLeftLine /> Back
        </button>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>{ticket.title}</h1>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <PriorityBadge priority={ticket.priority} />
              <StatusBadge status={ticket.status} />
              <span className="text-xs text-slate-500 font-mono">#{ticket.id.slice(-8)}</span>
            </div>
          </div>

   
          <div className="flex gap-2 flex-shrink-0">
            {ticket.status === 'ASSIGNED' && (
              <Button
                onClick={() => updateStatus('IN_PROGRESS')}
                loading={updating === 'IN_PROGRESS'}
                variant="secondary"
              >
                <RiPlayLine /> Start Working
              </Button>
            )}
            {ticket.status === 'IN_PROGRESS' && (
              <Button
                onClick={() => updateStatus('RESOLVED')}
                loading={updating === 'RESOLVED'}
              >
                <RiCheckLine /> Mark Resolved
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <h3 className="font-semibold text-white mb-3" style={{ fontFamily: 'var(--font-display)' }}>Description</h3>
            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
              {ticket.description || 'No description provided.'}
            </p>
          </Card>
          <TicketComments ticketId={id} />
        </div>

        <div className="space-y-4">
          <Card className="p-5">
            <h3 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider" style={{ fontFamily: 'var(--font-display)' }}>Details</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <RiTimeLine className="text-slate-500" />
                <span className="text-slate-400">Created:</span>
                <span className="text-slate-200 ml-auto">{formatDateTime(ticket.createdAt)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <RiUserLine className="text-blue-400" />
                <span className="text-slate-400">Buyer:</span>
                <span className="text-slate-200 ml-auto font-mono text-xs">{ticket.buyerId?.slice(0, 10)}…</span>
              </div>
              {ticket.resolvedAt && (
                <div className="flex items-center gap-2 text-sm">
                  <RiCheckLine className="text-emerald-400" />
                  <span className="text-slate-400">Resolved:</span>
                  <span className="text-emerald-300 ml-auto">{formatDateTime(ticket.resolvedAt)}</span>
                </div>
              )}
            </div>
          </Card>

         
          <Card className="p-5">
            <h3 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider" style={{ fontFamily: 'var(--font-display)' }}>Update Status</h3>
            <div className="space-y-2">
              {['IN_PROGRESS', 'RESOLVED'].map(s => (
                <button
                  key={s}
                  onClick={() => updateStatus(s)}
                  disabled={ticket.status === s || !!updating}
                  className={`w-full px-3 py-2 rounded-lg text-sm font-medium transition-all text-left flex items-center justify-between
                    ${ticket.status === s
                      ? 'bg-brand-600/20 text-brand-300 border border-brand-500/30 cursor-default'
                      : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10'
                    }`}
                >
                  {s.replace('_', ' ')}
                  {ticket.status === s && <span className="text-xs text-brand-400">Current</span>}
                </button>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider" style={{ fontFamily: 'var(--font-display)' }}>History</h3>
            <TicketHistoryList history={history} />
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
