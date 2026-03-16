'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { ticketApi } from '@/lib/ticketApi';
import { Ticket } from '@/types';
import { Card, PageHeader, Spinner, PriorityBadge, StatusBadge, EmptyState, Button } from '@/components/ui';
import { timeAgo } from '@/lib/utils';
import { RiArrowRightLine, RiSearchLine } from 'react-icons/ri';
import toast from 'react-hot-toast';

export default function VendorTicketsPage() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [filtered, setFiltered] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

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
      const data = await ticketApi.getByVendor(user!.id);
      setTickets(data);
    } catch {
      toast.error('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  const statuses = ['ALL', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED'];

  return (
    <DashboardLayout>
      <PageHeader
        title="Assigned Tickets"
        subtitle="Tickets assigned to you for resolution"
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
        <div className="flex gap-1.5">
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
            title="No tickets assigned"
            message="You'll see tickets here once an admin assigns them to you"
            icon="📋"
          />
        ) : (
          <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
            {filtered.map(ticket => (
              <Link
                key={ticket.id}
                href={`/vendor/tickets/${ticket.id}`}
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
                  <RiArrowRightLine className="text-slate-600 group-hover:text-brand-400 transition-colors ml-1" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </DashboardLayout>
  );
}
