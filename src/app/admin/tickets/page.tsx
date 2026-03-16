'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { ticketApi } from '@/lib/ticketApi';
import { Ticket } from '@/types';
import { Card, PageHeader, Spinner, PriorityBadge, StatusBadge, EmptyState } from '@/components/ui';
import { timeAgo } from '@/lib/utils';
import { RiArrowRightLine, RiSearchLine } from 'react-icons/ri';
import toast from 'react-hot-toast';

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [filtered, setFiltered] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');

  useEffect(() => { fetchTickets(); }, []);

  useEffect(() => {
    let result = tickets;
    if (search) result = result.filter(t => t.title.toLowerCase().includes(search.toLowerCase()));
    if (statusFilter !== 'ALL') result = result.filter(t => t.status === statusFilter);
    if (priorityFilter !== 'ALL') result = result.filter(t => t.priority === priorityFilter);
    setFiltered(result);
  }, [tickets, search, statusFilter, priorityFilter]);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const data = await ticketApi.getAll();
      setTickets(data);
    } catch {
      toast.error('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  const statuses = ['ALL', 'OPEN', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
  const priorities = ['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];

  return (
    <DashboardLayout>
      <PageHeader
        title="All Tickets"
        subtitle={`${tickets.length} total tickets in the system`}
      />

      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative min-w-60 flex-1">
          <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm text-white placeholder-slate-500 outline-none bg-white/5 border border-white/10 focus:border-brand-500"
            placeholder="Search tickets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      
      <div className="flex flex-wrap gap-2 mb-3">
        <span className="text-xs text-slate-500 self-center mr-1">Status:</span>
        {statuses.map(s => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              statusFilter === s ? 'bg-brand-600 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white border border-white/10'
            }`}
          >
            {s === 'ALL' ? 'All' : s.replace('_', ' ')}
          </button>
        ))}
      </div>

  
      <div className="flex flex-wrap gap-2 mb-6">
        <span className="text-xs text-slate-500 self-center mr-1">Priority:</span>
        {priorities.map(p => (
          <button
            key={p}
            onClick={() => setPriorityFilter(p)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              priorityFilter === p ? 'bg-brand-600 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white border border-white/10'
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      <Card>
        {loading ? (
          <div className="flex justify-center py-20"><Spinner /></div>
        ) : filtered.length === 0 ? (
          <EmptyState title="No tickets found" message="Try changing your filters" icon="🔍" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
                  {['Ticket', 'Priority', 'Status', 'Buyer', 'Vendor', 'Created', ''].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: 'var(--border)' }}>
                {filtered.map(ticket => (
                  <tr key={ticket.id} className="group hover:bg-white/3 transition-colors">
                    <td className="px-5 py-4 max-w-xs">
                      <p className="text-sm font-medium text-white truncate group-hover:text-brand-300 transition-colors">{ticket.title}</p>
                      <p className="text-xs text-slate-500 truncate mt-0.5">{ticket.description}</p>
                    </td>
                    <td className="px-5 py-4"><PriorityBadge priority={ticket.priority} /></td>
                    <td className="px-5 py-4"><StatusBadge status={ticket.status} /></td>
                    <td className="px-5 py-4 text-xs text-slate-400 font-mono">{ticket.buyerId?.slice(0, 8)}…</td>
                    <td className="px-5 py-4 text-xs text-slate-500 font-mono">
                      {ticket.vendorId ? `${ticket.vendorId.slice(0, 8)}…` : <span className="text-slate-600">—</span>}
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-500 whitespace-nowrap">{timeAgo(ticket.createdAt)}</td>
                    <td className="px-5 py-4">
                      <Link href={`/admin/tickets/${ticket.id}`}
                        className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-brand-400 transition-colors">
                        Manage <RiArrowRightLine />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </DashboardLayout>
  );
}
