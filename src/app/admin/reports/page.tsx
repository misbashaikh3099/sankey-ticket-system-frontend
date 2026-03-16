'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { reportApi } from '@/lib/ticketApi';
import { TicketStats, PriorityStats, SlaReport } from '@/types';
import { Card, PageHeader, StatCard, Spinner } from '@/components/ui';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import toast from 'react-hot-toast';
import {
  RiTicketLine, RiAlertLine, RiTimeLine,
  RiCheckboxCircleLine, RiBarChartLine
} from 'react-icons/ri';

const COLORS = ['#5a5fff', '#34d399', '#f59e0b', '#ef4444'];

const tooltipStyle = {
  contentStyle: {
    background: '#1a2235',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '12px',
    color: '#e2e8f0',
    fontFamily: 'DM Sans, sans-serif',
    fontSize: '12px',
  },
};

export default function AdminReportsPage() {
  const [stats, setStats] = useState<TicketStats | null>(null);
  const [priorityStats, setPriorityStats] = useState<PriorityStats | null>(null);
  const [sla, setSla] = useState<SlaReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadReports(); }, []);

  const loadReports = async () => {
    setLoading(true);
    try {
      const [s, p, sl] = await Promise.all([
        reportApi.getStats(),
        reportApi.getPriorityStats(),
        reportApi.getSlaReport(),
      ]);
      setStats(s);
      setPriorityStats(p);
      setSla(sl);
    } catch {
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <DashboardLayout>
      <div className="flex justify-center py-20"><Spinner size="lg" /></div>
    </DashboardLayout>
  );

  const statusChartData = stats ? [
    { name: 'Open', value: stats.open, fill: '#5a5fff' },
    { name: 'Assigned', value: stats.assigned, fill: '#a78bfa' },
    { name: 'In Progress', value: stats.inProgress, fill: '#f59e0b' },
    { name: 'Resolved', value: stats.resolved, fill: '#34d399' },
    { name: 'Closed', value: stats.closed, fill: '#64748b' },
  ] : [];

  const priorityChartData = priorityStats ? [
    { name: 'Critical', value: priorityStats.critical, fill: '#ef4444' },
    { name: 'High', value: priorityStats.high, fill: '#f97316' },
    { name: 'Medium', value: priorityStats.medium, fill: '#f59e0b' },
    { name: 'Low', value: priorityStats.low, fill: '#34d399' },
  ] : [];

  return (
    <DashboardLayout>
      <PageHeader
        title="Reports & Analytics"
        subtitle="System-wide ticket metrics and performance insights"
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Tickets" value={stats?.total ?? 0} icon={<RiTicketLine />} color="brand" />
        <StatCard label="Open" value={stats?.open ?? 0} icon={<RiAlertLine />} color="blue" />
        <StatCard label="Resolved" value={stats?.resolved ?? 0} icon={<RiCheckboxCircleLine />} color="emerald" />
        <StatCard
          label="Avg Resolution"
          value={sla ? `${sla.averageResolutionHours.toFixed(1)}h` : '—'}
          icon={<RiTimeLine />}
          color="amber"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
       
        <Card className="p-6">
          <h3 className="font-semibold text-white mb-5 flex items-center gap-2" style={{ fontFamily: 'var(--font-display)' }}>
            <RiBarChartLine className="text-brand-400" /> Tickets by Status
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={statusChartData} barSize={32}>
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip {...tooltipStyle} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {statusChartData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        
        <Card className="p-6">
          <h3 className="font-semibold text-white mb-5 flex items-center gap-2" style={{ fontFamily: 'var(--font-display)' }}>
            <RiAlertLine className="text-amber-400" /> Tickets by Priority
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={priorityChartData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={3}
                dataKey="value"
              >
                {priorityChartData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip {...tooltipStyle} />
              <Legend
                formatter={(value) => <span style={{ color: '#94a3b8', fontSize: 12 }}>{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

   
      <Card className="p-6">
        <h3 className="font-semibold text-white mb-5" style={{ fontFamily: 'var(--font-display)' }}>
          SLA Summary
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-white/4 border border-white/8">
            <p className="text-xs text-slate-400 mb-1">Average Resolution Time</p>
            <p className="text-3xl font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>
              {sla ? `${sla.averageResolutionHours.toFixed(1)}h` : '—'}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-white/4 border border-white/8">
            <p className="text-xs text-slate-400 mb-1">Tickets In Progress</p>
            <p className="text-3xl font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>
              {stats?.inProgress ?? 0}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-white/4 border border-white/8">
            <p className="text-xs text-slate-400 mb-1">Closure Rate</p>
            <p className="text-3xl font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>
              {stats && stats.total > 0
                ? `${Math.round(((stats.resolved + stats.closed) / stats.total) * 100)}%`
                : '—'}
            </p>
          </div>
        </div>
      </Card>
    </DashboardLayout>
  );
}
