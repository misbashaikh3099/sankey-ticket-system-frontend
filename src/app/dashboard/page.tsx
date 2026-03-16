'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { ticketApi, reportApi } from '@/lib/ticketApi';
import { Ticket, TicketStats } from '@/types';
import { Card, StatCard, PriorityBadge, StatusBadge, Spinner } from '@/components/ui';
import Link from 'next/link';
import { timeAgo } from '@/lib/utils';
import {
  RiTicketLine, RiCheckboxCircleLine, RiTimeLine,
  RiAlertLine, RiArrowRightLine, RiAddLine
} from 'react-icons/ri';

export default function DashboardPage() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [stats, setStats] = useState<TicketStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      if (user.role === 'BUYER') {
        const data = await ticketApi.getByBuyer(user.id);
        setTickets(data.slice(0, 5));
      } else if (user.role === 'VENDOR') {
        const data = await ticketApi.getByVendor(user.id);
        setTickets(data.slice(0, 5));
      } else {
        const [allTickets, statsData] = await Promise.all([
          ticketApi.getAll(),
          reportApi.getStats(),
        ]);
        setTickets(allTickets.slice(0, 5));
        setStats(statsData);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const buyerStats = {
    total: tickets.length,
    open: tickets.filter((t) => t.status === 'OPEN').length,
    inProgress: tickets.filter((t) => t.status === 'IN_PROGRESS' || t.status === 'ASSIGNED').length,
    resolved: tickets.filter((t) => t.status === 'RESOLVED' || t.status === 'CLOSED').length,
  };

  const detailPath =
    user?.role === 'BUYER' ? '/buyer/tickets' :
      user?.role === 'VENDOR' ? '/vendor/tickets' : '/admin/tickets';

  return (
    <DashboardLayout>
   
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>
          Welcome back, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-slate-400 mt-1 text-sm">
          Here's what's happening with your tickets today.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : (
        <>
         
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {user?.role === 'ADMIN' && stats ? (
              <>
                <StatCard label="Total Tickets" value={stats.total} icon={<RiTicketLine />} color="brand" />
                <StatCard label="Open" value={stats.open} icon={<RiAlertLine />} color="blue" />
                <StatCard label="In Progress" value={stats.inProgress} icon={<RiTimeLine />} color="amber" />
                <StatCard label="Resolved" value={stats.resolved} icon={<RiCheckboxCircleLine />} color="emerald" />
              </>
            ) : (
              <>
                <StatCard label="Total" value={buyerStats.total} icon={<RiTicketLine />} color="brand" />
                <StatCard label="Open" value={buyerStats.open} icon={<RiAlertLine />} color="blue" />
                <StatCard label="In Progress" value={buyerStats.inProgress} icon={<RiTimeLine />} color="amber" />
                <StatCard label="Resolved" value={buyerStats.resolved} icon={<RiCheckboxCircleLine />} color="emerald" />
              </>
            )}
          </div>

        
          <Card>
            <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
              <h2 className="font-semibold text-white" style={{ fontFamily: 'var(--font-display)' }}>
                Recent Tickets
              </h2>
              <div className="flex items-center gap-3">
                {user?.role === 'BUYER' && (
                  <Link href="/buyer/tickets/create"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-400 hover:text-brand-300 transition-colors">
                    <RiAddLine /> New Ticket
                  </Link>
                )}
                <Link href={detailPath}
                  className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors">
                  View all <RiArrowRightLine />
                </Link>
              </div>
            </div>

            {tickets.length === 0 ? (
              <div className="py-16 text-center">
                <div className="text-4xl mb-3">🎫</div>
                <p className="text-slate-400 font-medium">No tickets yet</p>
                {user?.role === 'BUYER' && (
                  <Link href="/buyer/tickets/create"
                    className="inline-flex items-center gap-1.5 mt-3 text-sm text-brand-400 hover:text-brand-300">
                    Create your first ticket →
                  </Link>
                )}
              </div>
            ) : (
              <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
                {tickets.map((ticket) => (
                  <Link
                    key={ticket.id}
                    href={`${detailPath}/${ticket.id}`}
                    className="flex items-center justify-between px-6 py-4 hover:bg-white/3 transition-colors group"
                  >
                    <div className="flex-1 min-w-0 mr-4">
                      <p className="text-sm font-medium text-white truncate group-hover:text-brand-300 transition-colors">
                        {ticket.title}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">{timeAgo(ticket.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <PriorityBadge priority={ticket.priority} />
                      <StatusBadge status={ticket.status} />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </Card>
        </>
      )}
    </DashboardLayout>
  );
}
