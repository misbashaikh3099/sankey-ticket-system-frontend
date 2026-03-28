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
import { RiArrowLeftLine, RiTimeLine, RiUserLine, RiPlayLine, RiCheckLine, RiCloseLine } from 'react-icons/ri';

// Resolve reason popup modal
function ResolveModal({
  onConfirm,
  onCancel,
  loading,
}: {
  onConfirm: (reason: string) => void;
  onCancel: () => void;
  loading: boolean;
}) {
  const [reason, setReason] = useState('');

  const handleSubmit = () => {
    if (!reason.trim()) {
      return;
    }
    onConfirm(reason.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
      <div
        className="relative z-10 w-full max-w-md mx-4 p-6 rounded-2xl border"
        style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-lg font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>
              Resolve Ticket
            </h3>
            <p className="text-sm text-slate-400 mt-0.5">Please explain how this ticket was resolved</p>
          </div>
          <button
            onClick={onCancel}
            className="text-slate-500 hover:text-white transition-colors p-1"
          >
            <RiCloseLine className="text-xl" />
          </button>
        </div>

        <div className="mb-5">
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Resolution Reason <span className="text-red-400">*</span>
          </label>
          <textarea
            className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-slate-500 outline-none resize-none"
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border)',
            }}
            placeholder="Describe what was done to resolve this issue..."
            rows={4}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            onFocus={(e) => e.target.style.borderColor = 'var(--brand-500)'}
            onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
            autoFocus
          />
          {reason.trim() === '' && (
            <p className="text-xs text-slate-500 mt-1.5">This field is required before resolving</p>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-300 border border-white/10 hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !reason.trim()}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
            ) : (
              <>
                <RiCheckLine /> Mark as Resolved
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function VendorTicketDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [history, setHistory] = useState<TicketHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [showResolveModal, setShowResolveModal] = useState(false);

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

  const updateStatus = async (status: string, resolveReason?: string) => {
    setUpdating(status);
    try {
      await ticketApi.updateStatus(id, status, resolveReason);
      toast.success(`Status updated to ${status.replace('_', ' ')}`);
      setShowResolveModal(false);
      loadTicket();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Failed to update status');
    } finally {
      setUpdating(null);
    }
  };

  const handleResolveClick = () => {
    setShowResolveModal(true);
  };

  const handleResolveConfirm = (reason: string) => {
    updateStatus('RESOLVED', reason);
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

          {/* Action buttons */}
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
                onClick={handleResolveClick}
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

            {/* Show existing resolve reason if ticket already resolved */}
            {ticket.resolveReason && (
              <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <p className="text-xs font-semibold text-emerald-400 mb-1">Your Resolution Note</p>
                <p className="text-sm text-emerald-200">{ticket.resolveReason}</p>
              </div>
            )}
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

          {/* Status panel - vendor can move to IN_PROGRESS or trigger resolve modal */}
          <Card className="p-5">
            <h3 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider" style={{ fontFamily: 'var(--font-display)' }}>Update Status</h3>
            <div className="space-y-2">
              <button
                onClick={() => updateStatus('IN_PROGRESS')}
                disabled={ticket.status === 'IN_PROGRESS' || ticket.status === 'RESOLVED' || !!updating}
                className={`w-full px-3 py-2 rounded-lg text-sm font-medium transition-all text-left flex items-center justify-between
                  ${ticket.status === 'IN_PROGRESS'
                    ? 'bg-brand-600/20 text-brand-300 border border-brand-500/30 cursor-default'
                    : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10 disabled:opacity-40 disabled:cursor-not-allowed'
                  }`}
              >
                IN PROGRESS
                {ticket.status === 'IN_PROGRESS' && <span className="text-xs text-brand-400">Current</span>}
              </button>

              <button
                onClick={handleResolveClick}
                disabled={ticket.status === 'RESOLVED' || ticket.status !== 'IN_PROGRESS' || !!updating}
                className={`w-full px-3 py-2 rounded-lg text-sm font-medium transition-all text-left flex items-center justify-between
                  ${ticket.status === 'RESOLVED'
                    ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 cursor-default'
                    : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10 disabled:opacity-40 disabled:cursor-not-allowed'
                  }`}
              >
                RESOLVED
                {ticket.status === 'RESOLVED' && <span className="text-xs text-emerald-400">Current</span>}
              </button>
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider" style={{ fontFamily: 'var(--font-display)' }}>History</h3>
            <TicketHistoryList history={history} />
          </Card>
        </div>
      </div>

      {/* Resolve reason modal */}
      {showResolveModal && (
        <ResolveModal
          onConfirm={handleResolveConfirm}
          onCancel={() => setShowResolveModal(false)}
          loading={updating === 'RESOLVED'}
        />
      )}
    </DashboardLayout>
  );
}