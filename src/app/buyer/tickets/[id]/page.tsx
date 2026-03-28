'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { ticketApi } from '@/lib/ticketApi';
import { Ticket, TicketHistory } from '@/types';
import { Card, PageHeader, Button, PriorityBadge, StatusBadge, Spinner } from '@/components/ui';
import TicketComments from '@/components/tickets/TicketComments';
import TicketHistoryList from '@/components/tickets/TicketHistoryList';
import { formatDateTime } from '@/lib/utils';
import toast from 'react-hot-toast';
import { RiArrowLeftLine, RiTimeLine, RiUserLine, RiAttachmentLine, RiCloseLine, RiCheckLine } from 'react-icons/ri';

// Close confirmation modal
function CloseConfirmModal({
  onConfirm,
  onCancel,
  loading,
}: {
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
      <div
        className="relative z-10 w-full max-w-sm mx-4 p-6 rounded-2xl border"
        style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}
      >
        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 mx-auto mb-4">
          <RiCloseLine className="text-red-400 text-2xl" />
        </div>
        <h3 className="text-lg font-bold text-white text-center mb-2" style={{ fontFamily: 'var(--font-display)' }}>
          Close Ticket
        </h3>
        <p className="text-sm text-slate-400 text-center mb-6">
          Are you sure you want to close this ticket? Once closed, it cannot be reopened.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-300 border border-white/10 hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
            ) : (
              <>
                <RiCheckLine /> Yes, Close It
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function BuyerTicketDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [history, setHistory] = useState<TicketHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [closing, setClosing] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);

  useEffect(() => { loadTicket(); }, [id]);

  const loadTicket = async () => {
    setLoading(true);
    try {
      const [t, h] = await Promise.all([
        ticketApi.getById(id),
        ticketApi.getHistory(id),
      ]);
      setTicket(t);
      setHistory(h);
    } catch {
      toast.error('Failed to load ticket');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = async () => {
    setClosing(true);
    try {
      await ticketApi.updateStatus(id, 'CLOSED');
      toast.success('Ticket closed successfully');
      setShowCloseModal(false);
      loadTicket();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Failed to close ticket');
    } finally {
      setClosing(false);
    }
  };

  // Only show Close button when ticket is RESOLVED
  const canClose = ticket?.status === 'RESOLVED';

  if (loading) return (
    <DashboardLayout>
      <div className="flex justify-center py-20"><Spinner size="lg" /></div>
    </DashboardLayout>
  );

  if (!ticket) return (
    <DashboardLayout>
      <p className="text-slate-400">Ticket not found</p>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors mb-4"
        >
          <RiArrowLeftLine /> Back to Tickets
        </button>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>
              {ticket.title}
            </h1>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <PriorityBadge priority={ticket.priority} />
              <StatusBadge status={ticket.status} />
              <span className="text-xs text-slate-500 font-mono">#{ticket.id.slice(-8)}</span>
            </div>
          </div>

          {/* Close Ticket button — ONLY visible when status is RESOLVED */}
          {canClose && (
            <Button variant="danger" onClick={() => setShowCloseModal(true)} loading={closing}>
              <RiCloseLine /> Close Ticket
            </Button>
          )}
        </div>

        {/* Info banner when ticket is not yet resolved */}
        {ticket.status !== 'RESOLVED' && ticket.status !== 'CLOSED' && (
          <div className="mt-4 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-sm text-amber-300">
            You can close this ticket once the vendor marks it as <strong>Resolved</strong>.
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <h3 className="font-semibold text-white mb-3" style={{ fontFamily: 'var(--font-display)' }}>
              Description
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
              {ticket.description || 'No description provided.'}
            </p>

            {/* Show vendor's resolve reason if available */}
            {ticket.resolveReason && (
              <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <p className="text-xs font-semibold text-emerald-400 mb-1">Vendor Resolution Note</p>
                <p className="text-sm text-emerald-200">{ticket.resolveReason}</p>
              </div>
            )}

            {ticket.attachments && ticket.attachments.length > 0 && (
              <div className="mt-5 pt-5 border-t" style={{ borderColor: 'var(--border)' }}>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
                  Attachments ({ticket.attachments.length})
                </h4>
                <div className="space-y-2">
                  {ticket.attachments.map((att, i) => (
                    <a
                      key={i}
                      href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/uploads/${att}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 text-xs text-brand-400 hover:text-brand-300 transition-colors"
                    >
                      <RiAttachmentLine /> {att}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </Card>

          <TicketComments ticketId={id} />
        </div>

        <div className="space-y-4">
          <Card className="p-5">
            <h3 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider" style={{ fontFamily: 'var(--font-display)' }}>
              Details
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <RiTimeLine className="text-slate-500" />
                <span className="text-slate-400">Created:</span>
                <span className="text-slate-200 ml-auto text-right">{formatDateTime(ticket.createdAt)}</span>
              </div>
              {ticket.resolvedAt && (
                <div className="flex items-center gap-2 text-sm">
                  <RiTimeLine className="text-emerald-400" />
                  <span className="text-slate-400">Resolved:</span>
                  <span className="text-emerald-300 ml-auto text-right">{formatDateTime(ticket.resolvedAt)}</span>
                </div>
              )}
              {ticket.vendorId && (
                <div className="flex items-center gap-2 text-sm">
                  <RiUserLine className="text-violet-400" />
                  <span className="text-slate-400">Assigned to:</span>
                  <span className="text-violet-300 ml-auto font-mono text-xs">{ticket.vendorId.slice(0, 12)}…</span>
                </div>
              )}
              {ticket.resolutionTimeHours != null && (
                <div className="flex items-center gap-2 text-sm">
                  <RiTimeLine className="text-amber-400" />
                  <span className="text-slate-400">Resolution:</span>
                  <span className="text-amber-300 ml-auto">{ticket.resolutionTimeHours}h</span>
                </div>
              )}
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider" style={{ fontFamily: 'var(--font-display)' }}>
              History
            </h3>
            <TicketHistoryList history={history} />
          </Card>
        </div>
      </div>

      {/* Close Ticket confirmation modal */}
      {showCloseModal && (
        <CloseConfirmModal
          onConfirm={handleClose}
          onCancel={() => setShowCloseModal(false)}
          loading={closing}
        />
      )}
    </DashboardLayout>
  );
}