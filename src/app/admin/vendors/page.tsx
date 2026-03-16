'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { authApi } from '@/lib/authApi';
import { ticketApi } from '@/lib/ticketApi';
import { User, Ticket } from '@/types';
import { Card, PageHeader, Spinner, EmptyState } from '@/components/ui';
import toast from 'react-hot-toast';
import { RiTeamLine, RiTicketLine, RiCheckboxCircleLine } from 'react-icons/ri';

interface VendorStats {
  vendor: User;
  total: number;
  resolved: number;
  inProgress: number;
}

export default function AdminVendorsPage() {
  const [vendorStats, setVendorStats] = useState<VendorStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [vendors, allTickets]: [User[], Ticket[]] = await Promise.all([
        authApi.getVendors(),
        ticketApi.getAll(),
      ]);
      const stats: VendorStats[] = vendors.map(vendor => {
        const vTickets = allTickets.filter(t => t.vendorId === vendor.id);
        return {
          vendor,
          total: vTickets.length,
          resolved: vTickets.filter(t => t.status === 'RESOLVED' || t.status === 'CLOSED').length,
          inProgress: vTickets.filter(t => t.status === 'IN_PROGRESS').length,
        };
      });
      setVendorStats(stats);
    } catch {
      toast.error('Failed to load vendors');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Vendors"
        subtitle="Manage vendor team and performance overview"
      />

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : vendorStats.length === 0 ? (
        <EmptyState
          title="No vendors registered"
          message="Ask vendors to register with their email and select Vendor role"
          icon={<RiTeamLine />}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {vendorStats.map(({ vendor, total, resolved, inProgress }) => {
            const resolveRate = total > 0 ? Math.round((resolved / total) * 100) : 0;
            return (
              <Card key={vendor.id} className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-11 h-11 rounded-xl bg-violet-600/20 border border-violet-500/20 flex items-center justify-center">
                    <span className="text-lg font-bold text-violet-300">
                      {vendor.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-white">{vendor.name}</p>
                    <p className="text-xs text-slate-400">{vendor.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="text-center p-2 rounded-lg bg-white/4">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <RiTicketLine className="text-brand-400 text-xs" />
                    </div>
                    <p className="text-xl font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>{total}</p>
                    <p className="text-xs text-slate-500">Total</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-white/4">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <RiCheckboxCircleLine className="text-emerald-400 text-xs" />
                    </div>
                    <p className="text-xl font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>{resolved}</p>
                    <p className="text-xs text-slate-500">Resolved</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-white/4">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <RiTicketLine className="text-amber-400 text-xs" />
                    </div>
                    <p className="text-xl font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>{inProgress}</p>
                    <p className="text-xs text-slate-500">Active</p>
                  </div>
                </div>

             
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-slate-400">Resolution Rate</span>
                    <span className={resolveRate >= 70 ? 'text-emerald-400' : resolveRate >= 40 ? 'text-amber-400' : 'text-red-400'}>
                      {resolveRate}%
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        resolveRate >= 70 ? 'bg-emerald-500' : resolveRate >= 40 ? 'bg-amber-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${resolveRate}%` }}
                    />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}
