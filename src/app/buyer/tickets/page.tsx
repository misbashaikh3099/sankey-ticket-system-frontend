'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { ticketApi } from '@/lib/ticketApi';
import { Ticket } from '@/types';
import { Card, PageHeader, Button, Spinner, PriorityBadge, StatusBadge, EmptyState } from '@/components/ui';
import { timeAgo } from '@/lib/utils';
import { RiAddLine, RiSearchLine, RiArrowRightLine, RiCloseLine, RiCheckLine } from 'react-icons/ri';
import toast from 'react-hot-toast';

// Inline close confirmation modal
function CloseConfirmModal({
  ticketTitle,
  onConfirm,
  onCancel,
  loading,
}: {
  ticketTitle: string;
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
        <p className="text-sm text-slate-400 text-center mb-1">Are you sure you want to close</p>
        <p className="text-sm font-semibold text-white text-center mb-5 truncate px-2">"{ticketTitle}"?</p>
        <p className="text-xs text-amber-400 text-center mb-6">
          Once closed, this ticket cannot be reopened.
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
                <RiCheckLine /> Yes, Close
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function BuyerTicketsPage() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [filtered, setFiltered] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [closingTicket, setClosingTicket] = useState<Ticket | null>(null);
  const [closeLoading, setCloseLoading] = useState(false);

  useEffect(() => {
    if (user) fetchTickets();
  }, [user]);

  useEffect(() => {
    let result = tickets;
    if (search) result = result.filter(t => t.title.toLowerCase().includes(search.toLowerCase()));
    if (statusFilter !== 'ALL') result = result.filter(t => t.status === statusFilter);
    setFiltered(result);
  }, [tickets, search, statusFilter]);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const data = await ticketApi.getByBuyer(user!.id);
      setTickets(data);
      setFiltered(data);
    } catch {
      toast.error('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseRequest = (ticket: Ticket, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setClosingTicket(ticket);
  };

  const handleCloseConfirm = async () => {
    if (!closingTicket) return;
    setCloseLoading(true);
    try {
      await ticketApi.updateStatus(closingTicket.id, 'CLOSED');
      toast.success('Ticket closed');
      setClosingTicket(null);
      fetchTickets();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Failed to close ticket');
    } finally {
      setCloseLoading(false);
    }
  };

  const statuses = ['ALL', 'OPEN', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];

  return (
    <DashboardLayout>
      <PageHeader
        title="My Tickets"
        subtitle="Track all your support requests"
        action={
          <Link href="/buyer/tickets/create">
            <Button><RiAddLine /> New Ticket</Button>
          </Link>
        }
      />

      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-48">
          <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm text-white placeholder-slate-500 outline-none bg-white/5 border border-white/10 focus:border-brand-500"
            placeholder="Search tickets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {statuses.map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                statusFilter === s
                  ? 'bg-brand-600 text-white'
                  : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white border border-white/10'
              }`}
            >
              {s === 'ALL' ? 'All' : s.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      <Card>
        {loading ? (
          <div className="flex justify-center py-20"><Spinner /></div>
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No tickets found"
            message={search ? 'Try a different search term' : 'Create your first ticket to get started'}
            icon="🎫"
          />
        ) : (
          <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
            {filtered.map(ticket => (
              <Link
                key={ticket.id}
                href={`/buyer/tickets/${ticket.id}`}
                className="flex items-center justify-between px-6 py-4 hover:bg-white/3 transition-colors group"
              >
                <div className="flex-1 min-w-0 mr-4">
                  <p className="text-sm font-semibold text-white truncate group-hover:text-brand-300 transition-colors">
                    {ticket.title}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5 truncate">{ticket.description}</p>
                  <p className="text-xs text-slate-600 mt-1">{timeAgo(ticket.createdAt)}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <PriorityBadge priority={ticket.priority} />
                  <StatusBadge status={ticket.status} />

                  {/* Close button ONLY for RESOLVED tickets */}
                  {ticket.status === 'RESOLVED' && (
                    <button
                      onClick={(e) => handleCloseRequest(ticket, e)}
                      className="ml-2 px-2.5 py-1 text-xs rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors border border-red-500/20 flex items-center gap-1"
                    >
                      <RiCloseLine /> Close
                    </button>
                  )}
                  <RiArrowRightLine className="text-slate-600 group-hover:text-brand-400 transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </Card>

      {/* Close confirmation modal */}
      {closingTicket && (
        <CloseConfirmModal
          ticketTitle={closingTicket.title}
          onConfirm={handleCloseConfirm}
          onCancel={() => setClosingTicket(null)}
          loading={closeLoading}
        />
      )}
    </DashboardLayout>
  );
}