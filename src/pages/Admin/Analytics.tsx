import { useMemo } from 'react';
import { Card } from '../../components/ui/Card';
import { useFirestoreCollection } from '../../hooks/useFirestore';
import type { Enquiry, Project } from '../../types';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

const COLORS = ['#16a34a', '#2563eb', '#d97706', '#dc2626', '#7c3aed', '#0891b2'];

function StatCard({ label, value, sub, color = 'text-gray-900' }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <Card padding="md">
      <p className="text-sm text-gray-500">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </Card>
  );
}

export default function Analytics() {
  const { data: enquiries } = useFirestoreCollection<Enquiry>('enquiries', []);
  const { data: projects } = useFirestoreCollection<Project>('projects', []);

  const metrics = useMemo(() => {
    const now = Date.now();
    const DAY = 86400000;

    // Lead volume over last 30 days — grouped by day
    const buckets: Record<string, number> = {};
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now - i * DAY);
      const key = `${d.getDate()}/${d.getMonth() + 1}`;
      buckets[key] = 0;
    }
    enquiries.forEach((e: any) => {
      const d = e.createdAt?.toDate?.();
      if (!d) return;
      const age = now - d.getTime();
      if (age > 30 * DAY) return;
      const key = `${d.getDate()}/${d.getMonth() + 1}`;
      if (key in buckets) buckets[key]++;
    });
    const leadTimeline = Object.entries(buckets).map(([date, count]) => ({ date, count }));

    // Lead sources
    const sourceCount: Record<string, number> = {};
    enquiries.forEach((e: any) => {
      const s = e.source || 'unknown';
      sourceCount[s] = (sourceCount[s] || 0) + 1;
    });
    const sourcePie = Object.entries(sourceCount).map(([name, value]) => ({ name, value }));

    // Status funnel
    const funnel = ['new', 'contacted', 'qualified', 'proposal_sent', 'negotiating', 'won'].map((s) => ({
      stage: s.replace(/_/g, ' '),
      count: enquiries.filter((e: any) => e.status === s).length,
    }));

    // Revenue
    const totalInvoiced = projects.reduce((s, p: any) => s + (p.budgetUsd || 0), 0);
    const totalPaid = projects.reduce((s, p: any) => s + (p.paidUsd || 0), 0);
    const outstanding = totalInvoiced - totalPaid;
    const wonDeals = enquiries.filter((e: any) => e.status === 'won').length;
    const winRate = enquiries.length > 0 ? ((wonDeals / enquiries.length) * 100).toFixed(1) : '0.0';
    const avgDeal = wonDeals > 0 ? Math.round(totalPaid / wonDeals) : 0;

    // Hot leads count
    const hotLeads = enquiries.filter((e: any) => (e.leadScore ?? 0) >= 70).length;

    // Service revenue breakdown from projects
    const serviceRevenue: Record<string, number> = {};
    projects.forEach((p: any) => {
      const cat = p.category || 'Other';
      serviceRevenue[cat] = (serviceRevenue[cat] || 0) + (p.budgetUsd || 0);
    });
    const serviceBar = Object.entries(serviceRevenue).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([name, revenue]) => ({ name, revenue }));

    // Leakage recovered: won deals revenue vs total enquiry opportunity
    const potentialRevenue = enquiries.length * 5000; // assume $5K avg deal
    const recoveryRate = potentialRevenue > 0 ? Math.round((totalPaid / potentialRevenue) * 100) : 0;

    return { leadTimeline, sourcePie, funnel, totalInvoiced, totalPaid, outstanding, winRate, avgDeal, hotLeads, serviceBar, recoveryRate };
  }, [enquiries, projects]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-500 mt-1">Live data · {enquiries.length} leads · {projects.length} projects</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Revenue" value={`$${metrics.totalPaid.toLocaleString()}`} sub="Collected to date" color="text-green-600" />
        <StatCard label="Outstanding" value={`$${metrics.outstanding.toLocaleString()}`} sub="Awaiting payment" color="text-orange-500" />
        <StatCard label="Win Rate" value={`${metrics.winRate}%`} sub="Enquiry → Won" />
        <StatCard label="🔥 Hot Leads" value={String(metrics.hotLeads)} sub="Score ≥ 70 · Call now" color="text-red-600" />
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Lead Volume — 30 day area chart */}
        <Card padding="lg">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Lead Volume — Last 30 Days</h3>
          {metrics.leadTimeline.every(d => d.count === 0) ? (
            <div className="h-48 flex items-center justify-center text-gray-400 text-sm">No leads yet — seed data or wait for first submissions</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={metrics.leadTimeline}>
                <defs>
                  <linearGradient id="leadGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16a34a" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={4} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Area type="monotone" dataKey="count" stroke="#16a34a" strokeWidth={2} fill="url(#leadGrad)" name="Leads" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Conversion Funnel */}
        <Card padding="lg">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Conversion Funnel</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={metrics.funnel} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
              <YAxis dataKey="stage" type="category" tick={{ fontSize: 11 }} width={90} />
              <Tooltip />
              <Bar dataKey="count" fill="#2563eb" radius={[0, 4, 4, 0]} name="Leads" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Lead Sources Pie */}
        <Card padding="lg">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Lead Sources</h3>
          {metrics.sourcePie.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-gray-400 text-sm">No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={metrics.sourcePie} cx="50%" cy="50%" outerRadius={80} dataKey="value" nameKey="name" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={11}>
                  {metrics.sourcePie.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Revenue by Service */}
        <Card padding="lg">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Revenue by Service</h3>
          {metrics.serviceBar.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-gray-400 text-sm">No project data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={metrics.serviceBar}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} />
                <Tooltip formatter={(v: number) => [`$${v.toLocaleString()}`, 'Revenue']} />
                <Bar dataKey="revenue" fill="#d97706" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      {/* Revenue Summary */}
      <Card padding="lg">
        <h3 className="text-base font-semibold text-gray-900 mb-4">Revenue Summary</h3>
        <div className="grid md:grid-cols-4 gap-6 text-center">
          {[
            { label: 'Total Contracted', value: `$${metrics.totalInvoiced.toLocaleString()}` },
            { label: 'Collected', value: `$${metrics.totalPaid.toLocaleString()}`, color: 'text-green-600' },
            { label: 'Outstanding', value: `$${metrics.outstanding.toLocaleString()}`, color: 'text-orange-500' },
            { label: 'Avg. Deal Size', value: `$${metrics.avgDeal.toLocaleString()}` },
          ].map((item) => (
            <div key={item.label}>
              <div className={`text-2xl font-bold ${(item as any).color || 'text-gray-900'}`}>{item.value}</div>
              <div className="text-sm text-gray-500 mt-1">{item.label}</div>
            </div>
          ))}
        </div>
        <div className="mt-6 bg-green-50 border border-green-100 rounded-xl p-4 text-center">
          <p className="text-sm text-green-700 font-medium">
            Revenue recovery rate: <span className="font-bold text-green-800">{metrics.recoveryRate}%</span> of addressable opportunity captured
          </p>
        </div>
      </Card>
    </div>
  );
}
