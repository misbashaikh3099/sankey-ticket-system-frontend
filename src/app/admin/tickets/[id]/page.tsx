'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { ticketApi } from '@/lib/ticketApi';
import { authApi } from '@/lib/authApi';
import { Ticket, TicketHistory, User } from '@/types';
import { Card, Button, PriorityBadge, StatusBadge, Spinner, Select } from '@/components/ui';
import TicketComments from '@/components/tickets/TicketComments';
import TicketHistoryList from '@/components/tickets/TicketHistoryList';
import { formatDateTime } from '@/lib/utils';
import toast from 'react-hot-toast';
import { RiArrowLeftLine, RiTimeLine, RiUserLine, RiTeamLine } from 'react-icons/ri';

const ALL_STATUSES = [
  { value: 'OPEN', label: 'Open' },
  { value: 'ASSIGNED', label: 'Assigned' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'RESOLVED', label: 'Resolved' },
  { value: 'CLOSED', label: 'Closed' },
];

export default function AdminTicketDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [history, setHistory] = useState<TicketHistory[]>([]);
  const [vendors, setVendors] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVendor, setSelectedVendor] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => { loadAll(); }, [id]);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [t, h, v] = await Promise.all([
        ticketApi.getById(id),
        ticketApi.getHistory(id),
        authApi.getVendors(),
      ]);
      setTicket(t);
      setHistory(h);
      setVendors(v);
      setSelectedStatus(t.status);
    } catch {
      toast.error('Failed to load ticket');
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedVendor) return toast.error('Select a vendor first');
    setAssigning(true);
    try {
      await ticketApi.assignVendor(id, selectedVendor);
      toast.success('Vendor assigned!');
      loadAll();
    } catch {
      toast.error('Failed to assign vendor');
    } finally {
      setAssigning(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!selectedStatus || selectedStatus === ticket?.status) return;
    setUpdatingStatus(true);
    try {
      await ticketApi.updateStatus(id, selectedStatus);
      toast.success(`Status updated to ${selectedStatus}`);
      loadAll();
    } catch {
      toast.error('Failed to update status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) return <DashboardLayout><div className="flex justify-center py-20"><Spinner size="lg" /></div></DashboardLayout>;
  if (!ticket) return <DashboardLayout><p className="text-slate-400">Ticket not found</p></DashboardLayout>;

  const vendorOptions = [
    { value: '', label: '— Select a vendor —' },
    ...vendors.map(v => ({ value: v.id, label: v.name })),
  ];

  return (
    <DashboardLayout>
      <div className="mb-6">
        <button onClick={() => router.back()} className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors mb-4">
          <RiArrowLeftLine /> Back to Tickets
        </button>
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>{ticket.title}</h1>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <PriorityBadge priority={ticket.priority} />
              <StatusBadge status={ticket.status} />
              <span className="text-xs text-slate-500 font-mono">#{ticket.id.slice(-8)}</span>
            </div>
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
            <h3 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider flex items-center gap-2" style={{ fontFamily: 'var(--font-display)' }}>
              <RiTeamLine className="text-violet-400" /> Assign Vendor
            </h3>
            {ticket.vendorId && (
              <div className="mb-3 px-3 py-2 rounded-lg bg-violet-500/10 border border-violet-500/20">
                <p className="text-xs text-violet-300">
                  Currently assigned: <span className="font-mono">{ticket.vendorId.slice(0, 12)}…</span>
                </p>
              </div>
            )}
            <div className="space-y-3">
              <Select
                value={selectedVendor}
                onChange={(e) => setSelectedVendor(e.target.value)}
                options={vendorOptions}
              />
              <Button onClick={handleAssign} loading={assigning} className="w-full" size="sm">
                {ticket.vendorId ? 'Reassign Vendor' : 'Assign Vendor'}
              </Button>
            </div>
          </Card>

          
          <Card className="p-5">
            <h3 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider" style={{ fontFamily: 'var(--font-display)' }}>
              Update Status
            </h3>
            <div className="space-y-3">
              <Select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                options={ALL_STATUSES}
              />
              <Button
                onClick={handleStatusUpdate}
                loading={updatingStatus}
                disabled={selectedStatus === ticket.status}
                className="w-full"
                size="sm"
              >
                Update Status
              </Button>
            </div>
          </Card>

   
          <Card className="p-5">
            <h3 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider" style={{ fontFamily: 'var(--font-display)' }}>Details</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <RiTimeLine className="text-slate-500 flex-shrink-0" />
                <span className="text-slate-400">Created:</span>
                <span className="text-slate-200 ml-auto text-right text-xs">{formatDateTime(ticket.createdAt)}</span>
              </div>
              <div className="flex items-center gap-2">
                <RiUserLine className="text-blue-400 flex-shrink-0" />
                <span className="text-slate-400">Buyer:</span>
                <span className="text-slate-200 ml-auto font-mono text-xs">{ticket.buyerId?.slice(0, 10)}…</span>
              </div>
              {ticket.resolvedAt && (
                <div className="flex items-center gap-2">
                  <RiTimeLine className="text-emerald-400 flex-shrink-0" />
                  <span className="text-slate-400">Resolved:</span>
                  <span className="text-emerald-300 ml-auto text-xs">{formatDateTime(ticket.resolvedAt)}</span>
                </div>
              )}
              {ticket.resolutionTimeHours != null && (
                <div className="px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <p className="text-xs text-emerald-300">⏱ Resolved in {ticket.resolutionTimeHours} hours</p>
                </div>
              )}
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
