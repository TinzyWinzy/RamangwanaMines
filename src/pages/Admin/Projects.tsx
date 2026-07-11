import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { useFirestoreCollection } from '../../hooks/useFirestore';
import { orderBy } from '../../lib/db';
import type { Project } from '../../types';
import { formatCurrency } from '../../lib/utils';
import { PageSpinner } from '../../components/ui/Spinner';
import { Link } from 'react-router-dom';

const statusVariant: Record<string, 'success' | 'error' | 'warning' | 'info' | 'default'> = {
  planning: 'default', in_progress: 'info', on_hold: 'warning', completed: 'success', cancelled: 'error',
};

export default function ProjectsAdmin() {
  const { data: projects, isLoading } = useFirestoreCollection<Project>('projects', [orderBy('createdAt', 'desc')]);

  if (isLoading) return <div className="py-16"><PageSpinner /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold text-gray-900">Projects</h1><p className="text-gray-500 mt-1">{projects.length} projects</p></div>
      </div>

      <div className="grid gap-4">
        {projects.map((p: any) => (
          <Card key={p.id} padding="lg">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2"><h4 className="text-lg font-semibold text-gray-900">{p.title}</h4><Badge variant={statusVariant[p.status] || 'default'}>{(p.status || 'planning').replace('_', ' ')}</Badge></div>
                <p className="text-sm text-gray-500 mt-1">{p.description?.slice(0, 80)}...</p>
              </div>
              <div className="text-right"><div className="text-lg font-bold text-gray-900">{formatCurrency(p.budgetUsd || 0)}</div><div className="text-xs text-gray-500">{formatCurrency(p.paidUsd || 0)} paid</div></div>
            </div>

            <div className="mt-4 flex items-center justify-between mb-1"><span className="text-xs text-gray-500">Health</span><span className="text-xs font-medium">{p.healthScore || 0}</span></div>
            <div className="w-full bg-gray-200 rounded-full h-2"><div className={`h-2 rounded-full ${(p.healthScore || 0) >= 75 ? 'bg-green-500' : (p.healthScore || 0) >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${p.healthScore || 0}%` }} /></div>

            <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
              <Link to={`/procurement/${p.id}`}><Button variant="ghost" size="sm">Procurement</Button></Link>
              <Link to={`/projects/${p.id}/documents`}><Button variant="ghost" size="sm">Documents</Button></Link>
            </div>
          </Card>
        ))}
        {projects.length === 0 && <Card padding="lg"><p className="text-center text-gray-500 py-8">Seed demo data from the Dashboard to populate projects.</p></Card>}
      </div>
    </div>
  );
}
