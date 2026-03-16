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
import { RiArrowLeftLine, RiTimeLine, RiUserLine, RiAttachmentLine } from 'react-icons/ri';

export default function BuyerTicketDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [history, setHistory] = useState<TicketHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    loadTicket();
  }, [id]);

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
      toast.success('Ticket closed');
      loadTicket();
    } catch {
      toast.error('Failed to close ticket');
    } finally {
      setClosing(false);
    }
  };

  const canClose = ticket && ['OPEN', 'ASSIGNED', 'RESOLVED'].includes(ticket.status);

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
          {canClose && (
            <Button variant="danger" onClick={handleClose} loading={closing}>
              Close Ticket
            </Button>
          )}
        </div>
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
    </DashboardLayout>
  );
}
