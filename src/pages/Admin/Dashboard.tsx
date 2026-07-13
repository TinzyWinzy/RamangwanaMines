import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { useFirestoreCollection } from '../../hooks/useFirestore';
import type { Enquiry, Project } from '../../types';
import { formatDate } from '../../lib/utils';
import { runSeed } from '../../lib/seed';
import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const { data: enquiries, isLoading } = useFirestoreCollection<Enquiry>('enquiries', []);
  const { data: projects } = useFirestoreCollection<Project>('projects', []);
  const [seeding, setSeeding] = useState(false);
  const [seeded, setSeeded] = useState(false);
  const [autoSeeded, setAutoSeeded] = useState(false);

  useEffect(() => {
    if (!isLoading && enquiries.length === 0 && !autoSeeded) {
      setAutoSeeded(true);
      setSeeding(true);
      runSeed().then(() => { setSeeded(true); setSeeding(false); }).catch(() => setSeeding(false));
    }
  }, [isLoading, enquiries.length, autoSeeded]);

  const metrics = useMemo(() => {
    const now = Date.now();
    const DAY = 86400000;

    const newToday = enquiries.filter((e: any) => {
      const d = e.createdAt?.toDate?.();
      return d && now - d.getTime() < DAY;
    }).length;

    const hotLeads = enquiries.filter((e: any) => (e.leadScore ?? 0) >= 70);
    const uncontactedHot = hotLeads.filter((e: any) => e.status === 'new');
    const activeProjects = projects.filter((p) => p.status !== 'completed' && p.status !== 'cancelled');
    const atRisk = activeProjects.filter((p: any) => (p.healthScore ?? 100) < 60);
    const pendingQuotes = enquiries.filter((e: any) => e.status === 'proposal_sent' || e.status === 'negotiating').length;
    const totalRevenue = projects.reduce((s, p: any) => s + (p.paidUsd || 0), 0);

    // Pipeline funnel for visual bar
    const stages = [
      { label: 'New', count: enquiries.filter((e: any) => e.status === 'new').length, color: 'bg-gray-400' },
      { label: 'Contacted', count: enquiries.filter((e: any) => e.status === 'contacted').length, color: 'bg-blue-400' },
      { label: 'Qualified', count: enquiries.filter((e: any) => e.status === 'qualified').length, color: 'bg-purple-400' },
      { label: 'Proposal', count: enquiries.filter((e: any) => e.status === 'proposal_sent').length, color: 'bg-yellow-400' },
      { label: 'Negotiating', count: enquiries.filter((e: any) => e.status === 'negotiating').length, color: 'bg-orange-400' },
      { label: 'Won', count: enquiries.filter((e: any) => e.status === 'won').length, color: 'bg-green-500' },
    ];
    const maxStage = Math.max(...stages.map(s => s.count), 1);

    return { newToday, hotLeads, uncontactedHot, activeProjects, atRisk, pendingQuotes, totalRevenue, stages, maxStage };
  }, [enquiries, projects]);

  const recentLeads = [...enquiries].sort((a: any, b: any) => {
    const da = a.createdAt?.toDate?.()?.getTime() || 0;
    const db = b.createdAt?.toDate?.()?.getTime() || 0;
    return db - da;
  }).slice(0, 5);

  // Priority actions
  const actions: { icon: string; text: string; urgency: 'red' | 'yellow' | 'blue' }[] = [
    ...metrics.uncontactedHot.slice(0, 2).map((e: any) => ({
      icon: '🔥', text: `Hot lead not contacted: ${e.fullName} (${e.companyName}) — Score ${e.leadScore}`, urgency: 'red' as const,
    })),
    ...metrics.atRisk.slice(0, 2).map((p: any) => ({
      icon: '⚠️', text: `Project at risk: ${p.title} — Health ${p.healthScore ?? '?'}%`, urgency: 'yellow' as const,
    })),
    ...(metrics.pendingQuotes > 0 ? [{ icon: '📄', text: `${metrics.pendingQuotes} proposal${metrics.pendingQuotes > 1 ? 's' : ''} awaiting client response`, urgency: 'blue' as const }] : []),
  ].slice(0, 5);

  const urgencyClass: Record<string, string> = {
    red: 'bg-red-50 border-red-100 text-red-800',
    yellow: 'bg-yellow-50 border-yellow-100 text-yellow-800',
    blue: 'bg-blue-50 border-blue-100 text-blue-800',
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Command Centre</h1>
          <p className="text-gray-500 mt-1">
            {new Date().toLocaleDateString('en-ZW', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={async () => { setSeeding(true); try { await runSeed(); setSeeded(true); } finally { setSeeding(false); } }} isLoading={seeding}>
          {seeded ? 'Seeded ✓' : 'Re-Seed Demo'}
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'New Leads Today', value: metrics.newToday, icon: '👥', color: 'text-blue-600' },
          { label: 'Active Projects', value: metrics.activeProjects.length, icon: '⛏️', color: 'text-primary-600' },
          { label: 'Revenue Collected', value: `$${metrics.totalRevenue.toLocaleString()}`, icon: '💰', color: 'text-green-600' },
          { label: '🔥 Hot Leads', value: metrics.hotLeads.length, icon: '', color: 'text-red-600' },
        ].map((stat) => (
          <Card key={stat.label} padding="md">
            <p className="text-sm text-gray-500">{stat.label}</p>
            <p className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        {/* Pipeline Health Visual */}
        <Card padding="lg" className="lg:col-span-2">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Pipeline Health</h3>
          <div className="space-y-3">
            {metrics.stages.map((s) => (
              <div key={s.label} className="flex items-center gap-3">
                <span className="text-xs text-gray-500 w-20 text-right">{s.label}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-5 relative">
                  <div
                    className={`${s.color} h-5 rounded-full flex items-center justify-end pr-2 transition-all duration-700`}
                    style={{ width: `${(s.count / metrics.maxStage) * 100}%`, minWidth: s.count > 0 ? '2rem' : '0' }}
                  >
                    {s.count > 0 && <span className="text-white text-xs font-bold">{s.count}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span>Win Rate: <span className="font-semibold text-green-600">
              {enquiries.length > 0 ? ((enquiries.filter((e: any) => e.status === 'won').length / enquiries.length) * 100).toFixed(1) : '0.0'}%
            </span></span>
            <Link to="/admin/leads" className="text-primary-500 font-medium hover:underline">View all leads →</Link>
          </div>
        </Card>

        {/* Priority Actions */}
        <Card padding="lg">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Today's Priority Actions</h3>
          {actions.length === 0 ? (
            <div className="text-center py-6 text-gray-400 text-sm">
              <div className="text-3xl mb-2">✅</div>
              All clear — no urgent actions
            </div>
          ) : (
            <div className="space-y-2">
              {actions.map((action, i) => (
                <div key={i} className={`border rounded-lg px-3 py-2.5 text-sm font-medium ${urgencyClass[action.urgency]}`}>
                  {action.icon} {action.text}
                </div>
              ))}
            </div>
          )}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <Link to="/admin/leads"><Button variant="primary" className="w-full" size="sm">Open Lead Pipeline</Button></Link>
          </div>
        </Card>
      </div>

      {seeding && <Card padding="lg" className="mb-6 text-center"><p className="text-gray-600 py-4">Setting up demo data... {seeded ? 'Done!' : 'Please wait...'}</p></Card>}

      {/* Recent Leads Table */}
      <Card padding="lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-gray-900">Recent Leads</h3>
          <Link to="/admin/leads" className="text-sm text-primary-500 font-medium hover:underline">View all</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 text-gray-500 font-medium">Name</th>
                <th className="text-left py-3 text-gray-500 font-medium">Company</th>
                <th className="text-left py-3 text-gray-500 font-medium">Status</th>
                <th className="text-left py-3 text-gray-500 font-medium">Score</th>
                <th className="text-left py-3 text-gray-500 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {recentLeads.map((lead: any) => {
                const score = lead.leadScore ?? 0;
                const scoreBg = score >= 70 ? 'bg-red-50 text-red-700' : score >= 40 ? 'bg-yellow-50 text-yellow-700' : 'bg-gray-100 text-gray-500';
                return (
                  <tr key={lead.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 font-medium text-gray-900">{lead.fullName}</td>
                    <td className="py-3 text-gray-600">{lead.companyName}</td>
                    <td className="py-3">
                      <Badge variant={lead.status === 'won' ? 'success' : lead.status === 'lost' ? 'error' : 'info'}>
                        {(lead.status || 'new').replace(/_/g, ' ')}
                      </Badge>
                    </td>
                    <td className="py-3">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${scoreBg}`}>{score}</span>
                    </td>
                    <td className="py-3 text-gray-500 text-xs">{lead.createdAt?.toDate ? formatDate(lead.createdAt.toDate()) : ''}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {recentLeads.length === 0 && <div className="text-center py-8 text-gray-400 text-sm">No leads yet.</div>}
        </div>
      </Card>
    </div>
  );
}
