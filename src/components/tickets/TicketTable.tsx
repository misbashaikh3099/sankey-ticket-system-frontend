'use client';

import Link from 'next/link';
import { Ticket } from '@/types';
import { PriorityBadge, StatusBadge } from '@/components/ui';
import { timeAgo } from '@/lib/utils';
import { RiArrowRightLine } from 'react-icons/ri';
import clsx from 'clsx';

interface Props {
  tickets: Ticket[];
  basePath?: string;
}

export default function TicketTable({ tickets, basePath = '/admin/tickets' }: Props) {
  if (tickets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="text-5xl mb-4">🎫</div>
        <p className="text-slate-400 font-medium">No tickets found</p>
        <p className="text-sm text-slate-500 mt-1">Tickets will appear here once created</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
            {['Title', 'Priority', 'Status', 'Created', 'Buyer', ''].map((h) => (
              <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y" style={{ borderColor: 'var(--border)' }}>
          {tickets.map((ticket) => (
            <tr key={ticket.id}
              className="group hover:bg-white/3 transition-colors duration-100">
              <td className="px-4 py-3.5 max-w-xs">
                <p className="text-sm font-medium text-white truncate group-hover:text-brand-300 transition-colors">
                  {ticket.title}
                </p>
                {ticket.description && (
                  <p className="text-xs text-slate-500 truncate mt-0.5">{ticket.description}</p>
                )}
              </td>
              <td className="px-4 py-3.5">
                <PriorityBadge priority={ticket.priority} />
              </td>
              <td className="px-4 py-3.5">
                <StatusBadge status={ticket.status} />
              </td>
              <td className="px-4 py-3.5 text-xs text-slate-400 whitespace-nowrap">
                {timeAgo(ticket.createdAt)}
              </td>
              <td className="px-4 py-3.5 text-xs text-slate-400 font-mono">
                {ticket.buyerId?.slice(0, 8)}…
              </td>
              <td className="px-4 py-3.5">
                <Link
                  href={`${basePath}/${ticket.id}`}
                  className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-brand-400 transition-colors"
                >
                  View <RiArrowRightLine />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
