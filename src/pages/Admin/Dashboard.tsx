import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { useFirestoreCollection } from '../../hooks/useFirestore';
import type { Enquiry, Project } from '../../types';
import { formatDate } from '../../lib/utils';
import { runSeed } from '../../lib/seed';
import { useState, useEffect } from 'react';

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

  const newToday = enquiries.filter((e: any) => {
    const d = (e as any).createdAt?.toDate?.();
    return d && new Date().getTime() - d.getTime() < 24 * 60 * 60 * 1000;
  }).length;

  const activeProjects = projects.filter((p) => p.status !== 'completed' && p.status !== 'cancelled').length;
  const totalRevenue = projects.reduce((s, p) => s + ((p as any).paidUsd || 0), 0);
  const pendingQuotes = enquiries.filter((e: any) => e.status === 'proposal_sent' || e.status === 'negotiating').length;

  const stats = [
    { label: 'New Leads Today', value: newToday, change: '+18%', trend: 'up' as const },
    { label: 'Active Projects', value: activeProjects, change: '—', trend: 'up' as const },
    { label: 'Revenue (Total)', value: `$${totalRevenue.toLocaleString()}`, change: '—', trend: 'up' as const },
    { label: 'Pending Quotes', value: pendingQuotes, change: '—', trend: 'down' as const },
  ];

  const recentLeads = enquiries.slice(0, 5);

  const handleSeed = async () => {
    setSeeding(true);
    try {
      await runSeed();
      setSeeded(true);
    } catch (e: any) { console.error(e); } finally { setSeeding(false); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold text-gray-900">Dashboard</h1><p className="text-gray-500 mt-1">Overview of your mining enterprise operations</p></div>
        <Button variant="outline" size="sm" onClick={handleSeed} isLoading={seeding}>
          {seeded ? 'Seeded!' : seeding ? 'Seeding...' : 'Re-Seed Demo Data'}
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat) => (
          <Card key={stat.label} padding="md">
            <p className="text-sm text-gray-500">{stat.label}</p>
            <div className="flex items-end justify-between mt-2">
              <span className="text-2xl font-bold text-gray-900">{stat.value}</span>
              <span className={`text-xs font-medium ${stat.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>{stat.change}</span>
            </div>
          </Card>
        ))}
      </div>

      {seeding && (<Card padding="lg" className="mb-6 text-center"><p className="text-gray-600 py-4">Setting up demo data with 11 services, 6 courses, 8 leads, 3 projects... {seeded ? 'Done!' : 'Please wait...'}</p></Card>)}

      {!seeding && enquiries.length === 0 && (
        <Card padding="lg" className="mb-6">
          <p className="text-center text-gray-500 py-4">No data yet. Demo data auto-seeds on first visit. Click "Re-Seed Demo Data" to populate manually.</p>
        </Card>
      )}

      <Card padding="lg">
        <div className="flex items-center justify-between mb-4"><h3 className="text-lg font-semibold text-gray-900">Recent Leads</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-100">
              <th className="text-left py-3 text-gray-500 font-medium">Name</th><th className="text-left py-3 text-gray-500 font-medium">Company</th><th className="text-left py-3 text-gray-500 font-medium">Status</th><th className="text-left py-3 text-gray-500 font-medium">Priority</th><th className="text-left py-3 text-gray-500 font-medium">Date</th>
            </tr></thead>
            <tbody>
              {recentLeads.map((lead: any) => (
                <tr key={lead.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 font-medium text-gray-900">{lead.fullName}</td>
                  <td className="py-3 text-gray-600">{lead.companyName}</td>
                  <td className="py-3"><Badge variant={lead.status === 'won' ? 'success' : 'info'}>{(lead.status || 'new').replace(/_/g, ' ')}</Badge></td>
                  <td className="py-3"><Badge variant={lead.priority === 'urgent' ? 'error' : 'default'}>{lead.priority}</Badge></td>
                  <td className="py-3 text-gray-500 text-xs">{lead.createdAt?.toDate ? formatDate(lead.createdAt.toDate()) : ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
