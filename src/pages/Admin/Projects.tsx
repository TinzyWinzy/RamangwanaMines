import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

const projects = [
  { id: '1', title: 'Mutare Borehole Drilling', client: 'MiningCo Ltd', budget: 15000, paid: 7500, status: 'in_progress', progress: 60, startDate: '2026-06-01', targetDate: '2026-08-15' },
  { id: '2', title: 'Headgear Fabrication', client: 'Gold Fields ZW', budget: 45000, paid: 45000, status: 'completed', progress: 100, startDate: '2026-03-15', targetDate: '2026-06-30' },
  { id: '3', title: 'Exploration Survey - Phase 1', client: 'Bulawayo Drillers', budget: 28000, paid: 14000, status: 'in_progress', progress: 40, startDate: '2026-05-10', targetDate: '2026-09-01' },
  { id: '4', title: 'Blasting Site Preparation', client: 'Ncube Holdings', budget: 32000, paid: 0, status: 'planning', progress: 0, startDate: '2026-08-01', targetDate: '2026-10-01' },
];

const statusColors: Record<string, string> = {
  planning: 'bg-gray-100 text-gray-800',
  in_progress: 'bg-blue-100 text-blue-800',
  on_hold: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

export default function Projects() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-500 mt-1">{projects.length} projects</p>
        </div>
        <Button variant="primary">+ New Project</Button>
      </div>

      <div className="grid gap-4">
        {projects.map((p) => (
          <Card key={p.id} padding="lg">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-lg font-semibold text-gray-900">{p.title}</h4>
                  <Badge>{p.status.replace('_', ' ')}</Badge>
                </div>
                <p className="text-sm text-gray-500 mt-1">{p.client}</p>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-gray-900">${p.budget.toLocaleString()}</div>
                <div className="text-xs text-gray-500">${p.paid.toLocaleString()} paid</div>
              </div>
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-500">Progress</span>
                <span className="text-xs font-medium text-gray-700">{p.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${p.progress === 100 ? 'bg-green-500' : 'bg-primary-500'}`}
                  style={{ width: `${p.progress}%` }}
                />
              </div>
            </div>

            <div className="mt-3 flex gap-4 text-xs text-gray-500">
              <span>Start: {p.startDate}</span>
              <span>Target: {p.targetDate}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
