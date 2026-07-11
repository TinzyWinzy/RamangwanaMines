import { Link } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { useFirestoreCollection } from '../hooks/useFirestore';
import { orderBy } from '../lib/db';
import type { Project } from '../types';
import { formatCurrency, formatDate } from '../lib/utils';
import { PageSpinner } from '../components/ui/Spinner';

export default function ClientDashboard() {
  const { data: projects, isLoading } = useFirestoreCollection<Project>('projects', [orderBy('createdAt', 'desc')]);

  const healthSummary = {
    total: projects.length,
    onTrack: projects.filter((p) => (p as any).healthScore >= 75 && p.status !== 'completed').length,
    atRisk: projects.filter((p) => (p as any).healthScore < 75 && p.status !== 'completed').length,
    completed: projects.filter((p) => p.status === 'completed').length,
  };

  if (isLoading && projects.length === 0) return <div className="py-32"><PageSpinner /></div>;

  return (
    <div className="py-16 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8"><h1 className="section-title">Project Command Center</h1><p className="section-subtitle">Real-time visibility across all your active projects</p></div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Active Projects', value: healthSummary.total, color: 'text-primary-500' },
            { label: 'On Track', value: healthSummary.onTrack, color: 'text-green-500' },
            { label: 'At Risk', value: healthSummary.atRisk, color: 'text-red-500' },
            { label: 'Completed', value: healthSummary.completed, color: 'text-blue-500' },
          ].map((s) => (
            <Card key={s.label} padding="md"><div className={`text-3xl font-bold ${s.color}`}>{s.value}</div><div className="text-sm text-gray-500 mt-1">{s.label}</div></Card>
          ))}
        </div>

        {projects.length === 0 && <Card padding="lg"><p className="text-center text-gray-500 py-8">No projects yet. Projects will appear here once inquiries are converted.</p></Card>}

        <div className="grid gap-6">
          {projects.map((project) => {
            const p = project as any;
            const healthScore = p.healthScore || Math.round((p.paidUsd || 0) / (p.budgetUsd || 1) * 100);
            const statusLabel = p.status === 'completed' ? 'COMPLETED' : healthScore >= 75 ? 'ON TRACK' : healthScore >= 50 ? 'AT RISK' : 'DELAYED';
            const statusVariant = p.status === 'completed' ? 'info' : healthScore >= 75 ? 'success' : healthScore >= 50 ? 'warning' : 'error';
            const progress = p.status === 'completed' ? 100 : Math.round(((p.invoicedUsd || 0) / (p.budgetUsd || 1)) * 100);

            return (
              <Card key={project.id} padding="lg">
                <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-2"><h3 className="text-lg font-semibold text-gray-900">{project.title}</h3><Badge variant={statusVariant as any}>{statusLabel}</Badge></div>
                    <p className="text-sm text-gray-500 mt-1">{project.description?.slice(0, 80)}...</p>
                  </div>
                  <div className="text-right"><div className="text-2xl font-bold text-gray-900">{healthScore}</div><div className="text-xs text-gray-500">Health Score</div></div>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <div className="flex items-center justify-between mb-1"><span className="text-xs text-gray-500">Progress</span><span className="text-xs font-semibold">{progress}%</span></div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5"><div className={`h-2.5 rounded-full ${progress === 100 ? 'bg-green-500' : 'bg-primary-500'}`} style={{ width: `${progress}%` }} /></div>
                    <div className="flex justify-between mt-3 text-xs text-gray-500">
                      <span>Budget: {formatCurrency(p.paidUsd || 0)} / {formatCurrency(project.budgetUsd)}</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-2"><svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg><span className="text-sm font-medium text-gray-700">Milestones</span></div>
                    {(p.milestones || []).slice(0, 2).map((m: any) => (
                      <div key={m.id} className="flex items-center gap-2 text-xs text-gray-600">
                        <span className={`w-1.5 h-1.5 rounded-full ${m.status === 'completed' ? 'bg-green-500' : m.status === 'delayed' ? 'bg-red-500' : 'bg-gray-300'}`} />
                        {m.name} {m.targetDate && `— ${formatDate(m.targetDate.toDate?.() || m.targetDate)}`}
                      </div>
                    ))}
                  </div>

                  <div>
                    <div className="text-xs text-gray-500 mb-2">Safety & Docs</div>
                    <div className="flex gap-4 text-xs">
                      <span className={((p.safetyObservations || []).filter((o: any) => o.status === 'open').length > 0) ? 'text-red-500' : 'text-green-500'}>
                        {(p.safetyObservations || []).filter((o: any) => o.status === 'open').length === 0 ? 'Zero' : (p.safetyObservations || []).filter((o: any) => o.status === 'open').length} open incidents
                      </span>
                      <span className="text-gray-500">{(p.documents || []).length} docs</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                  <Link to={`/projects/${project.id}/field-log`}><Button variant="ghost" size="sm">Field Log</Button></Link>
                  <Link to={`/projects/${project.id}/documents`}><Button variant="ghost" size="sm">Documents</Button></Link>
                  <Link to="/safety"><Button variant="ghost" size="sm">Safety</Button></Link>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
