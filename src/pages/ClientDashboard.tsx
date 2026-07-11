import { Link } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { formatCurrency, formatDate } from '../lib/utils';

interface DemoProject {
  id: string;
  title: string;
  service: string;
  status: 'on_track' | 'at_risk' | 'delayed' | 'completed';
  progress: number;
  healthScore: number;
  nextMilestone: string;
  nextMilestoneDate: string;
  recentActivity: { type: string; content: string; time: string }[];
  budgetSpent: number;
  budgetTotal: number;
  safetyIncidents: number;
  documents: number;
}

const demoProjects: DemoProject[] = [
  {
    id: 'p1',
    title: 'Shaft Rehabilitation — Mazowe Mine',
    service: 'Project Management',
    status: 'on_track',
    progress: 78,
    healthScore: 87,
    nextMilestone: 'Structural inspection',
    nextMilestoneDate: '2026-07-15',
    recentActivity: [
      { type: 'document', content: 'Geological report approved by engineer', time: '2h ago' },
      { type: 'log', content: 'Daily progress logged: 8.5m depth reached', time: '4h ago' },
      { type: 'payment', content: 'Invoice #RMG-2026-0126 paid — $4,500', time: '1d ago' },
    ],
    budgetSpent: 38000,
    budgetTotal: 50000,
    safetyIncidents: 0,
    documents: 14,
  },
  {
    id: 'p2',
    title: 'Borehole Drilling — Farm 47',
    service: 'Drilling',
    status: 'completed',
    progress: 100,
    healthScore: 100,
    nextMilestone: 'Water quality report',
    nextMilestoneDate: '2026-07-18',
    recentActivity: [
      { type: 'document', content: 'Final drilling report uploaded', time: '3d ago' },
      { type: 'log', content: 'Borehole completed at 120m depth', time: '5d ago' },
    ],
    budgetSpent: 8500,
    budgetTotal: 8500,
    safetyIncidents: 0,
    documents: 8,
  },
  {
    id: 'p3',
    title: 'Headgear Fabrication — Trojan Mine',
    service: 'Fabrication',
    status: 'at_risk',
    progress: 42,
    healthScore: 55,
    nextMilestone: 'Steel delivery to site',
    nextMilestoneDate: '2026-07-20',
    recentActivity: [
      { type: 'note', content: 'Steel shipment delayed — revised ETA Jul 22', time: '6h ago' },
      { type: 'log', content: 'Welding phase 2 completed', time: '1d ago' },
    ],
    budgetSpent: 52000,
    budgetTotal: 85000,
    safetyIncidents: 1,
    documents: 22,
  },
];

export default function ClientDashboard() {
  const healthSummary = {
    total: demoProjects.length,
    onTrack: demoProjects.filter((p) => p.status === 'on_track').length,
    atRisk: demoProjects.filter((p) => p.status === 'at_risk').length,
    completed: demoProjects.filter((p) => p.status === 'completed').length,
  };

  return (
    <div className="py-16 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="section-title">Project Command Center</h1>
          <p className="section-subtitle">Real-time visibility across all your active projects</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Active Projects', value: healthSummary.total, color: 'text-primary-500' },
            { label: 'On Track', value: healthSummary.onTrack, color: 'text-green-500' },
            { label: 'At Risk', value: healthSummary.atRisk, color: 'text-red-500' },
            { label: 'Completed', value: healthSummary.completed, color: 'text-blue-500' },
          ].map((s) => (
            <Card key={s.label} padding="md">
              <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-sm text-gray-500 mt-1">{s.label}</div>
            </Card>
          ))}
        </div>

        <div className="grid gap-6">
          {demoProjects.map((project) => (
            <Card key={project.id} padding="lg">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-gray-900">{project.title}</h3>
                    <Badge variant={project.status === 'on_track' ? 'success' : project.status === 'at_risk' ? 'warning' : project.status === 'completed' ? 'info' : 'error'}>
                      {project.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{project.service}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">{project.healthScore}</div>
                  <div className="text-xs text-gray-500">Health Score</div>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-500">Progress</span>
                    <span className="text-xs font-semibold">{project.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full transition-all ${
                        project.progress === 100 ? 'bg-green-500' : project.status === 'at_risk' ? 'bg-yellow-500' : 'bg-primary-500'
                      }`}
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-3 text-xs text-gray-500">
                    <span>Budget: {formatCurrency(project.budgetSpent)} / {formatCurrency(project.budgetTotal)}</span>
                    <span>{Math.round((project.budgetSpent / project.budgetTotal) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1">
                    <div
                      className="h-1.5 rounded-full bg-gray-400"
                      style={{ width: `${(project.budgetSpent / project.budgetTotal) * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    <span className="text-sm font-medium text-gray-700">Next Milestone</span>
                  </div>
                  <p className="text-sm text-gray-900">{project.nextMilestone}</p>
                  <p className="text-xs text-gray-500">{formatDate(project.nextMilestoneDate)}</p>
                </div>

                <div>
                  <div className="text-xs text-gray-500 mb-2">Recent Activity</div>
                  <div className="space-y-1.5">
                    {project.recentActivity.slice(0, 2).map((act, i) => (
                      <div key={i} className="text-xs text-gray-600 flex gap-1">
                        <span className="text-gray-400 flex-shrink-0">&#8226;</span>
                        <span>{act.content}</span>
                        <span className="text-gray-400 ml-auto flex-shrink-0">{act.time}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-4 mt-3 text-xs text-gray-500">
                    <span>{project.documents} docs</span>
                    <span className={project.safetyIncidents > 0 ? 'text-red-500' : 'text-green-500'}>
                      {project.safetyIncidents === 0 ? 'Zero' : project.safetyIncidents} incidents
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                {[
                  { label: 'Details', to: `/projects/${project.id}` },
                  { label: 'Documents', to: `/projects/${project.id}/documents` },
                  { label: 'Field Log', to: `/projects/${project.id}/field-log` },
                ].map((action) => (
                  <Link key={action.label} to={action.to}>
                    <Button variant="ghost" size="sm">{action.label}</Button>
                  </Link>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
