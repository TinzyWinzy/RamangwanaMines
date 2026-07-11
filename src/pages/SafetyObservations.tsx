import { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Textarea } from '../components/ui/Textarea';

interface SafetyObs {
  id: string;
  type: 'hazard' | 'near_miss' | 'incident' | 'observation';
  description: string;
  location: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'resolved' | 'escalated';
  reportedBy: string;
  reportedAt: string;
  resolvedAt?: string;
}

const demoObservations: SafetyObs[] = [
  { id: '1', type: 'hazard', description: 'Loose scaffolding on north face of shaft headgear. Risk of falling objects.', location: 'Shaft B — Mazowe Mine', severity: 'high', status: 'open', reportedBy: 'Farai M.', reportedAt: '2026-07-11 08:30' },
  { id: '2', type: 'near_miss', description: 'Vehicle nearly backed into trench. No spotter present.', location: 'Site entrance — Farm 47', severity: 'medium', status: 'resolved', reportedBy: 'Simba N.', reportedAt: '2026-07-10 14:00', resolvedAt: '2026-07-10 15:00' },
  { id: '3', type: 'observation', description: 'All workers wearing correct PPE. Good practice noted.', location: 'Workshop — Eastlea', severity: 'low', status: 'resolved', reportedBy: 'Rutendo C.', reportedAt: '2026-07-09 10:00', resolvedAt: '2026-07-09 10:15' },
  { id: '4', type: 'incident', description: 'Minor cut from unguarded cutting tool. First aid applied.', location: 'Fabrication bay — Trojan', severity: 'medium', status: 'escalated', reportedBy: 'Tafadzwa Z.', reportedAt: '2026-07-08 16:00' },
];

const severityStyles: Record<string, string> = {
  low: 'bg-gray-100 text-gray-700',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800',
};

const typeStyles: Record<string, string> = {
  hazard: 'bg-red-100 text-red-800',
  near_miss: 'bg-yellow-100 text-yellow-800',
  incident: 'bg-orange-100 text-orange-800',
  observation: 'bg-blue-100 text-blue-800',
};

export default function SafetyObservations() {
  const [observations] = useState<SafetyObs[]>(demoObservations);
  const [filter, setFilter] = useState('all');
  const [showReport, setShowReport] = useState(false);

  const filtered = filter === 'all' ? observations : observations.filter((o) => o.status === filter);

  const stats = {
    total: observations.length,
    open: observations.filter((o) => o.status === 'open').length,
    resolved: observations.filter((o) => o.status === 'resolved').length,
    escalated: observations.filter((o) => o.status === 'escalated').length,
  };

  return (
    <div className="py-16 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Safety Observations</h1>
            <p className="text-gray-500 text-sm">{stats.total} total &middot; {stats.open} open</p>
          </div>
          <Button variant="primary" onClick={() => setShowReport(true)}>+ Report Observation</Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Reports', value: stats.total, color: 'text-gray-700' },
            { label: 'Open', value: stats.open, color: 'text-red-500' },
            { label: 'Resolved', value: stats.resolved, color: 'text-green-500' },
            { label: 'Escalated', value: stats.escalated, color: 'text-orange-500' },
          ].map((s) => (
            <Card key={s.label} padding="md">
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-gray-500 mt-1">{s.label}</div>
            </Card>
          ))}
        </div>

        <div className="flex gap-2 mb-6">
          {[
            { value: 'all', label: 'All' },
            { value: 'open', label: 'Open' },
            { value: 'resolved', label: 'Resolved' },
          ].map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filter === f.value ? 'bg-primary-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {filtered.map((obs) => (
            <Card key={obs.id} padding="md">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge>{obs.type.replace('_', ' ')}</Badge>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${severityStyles[obs.severity]}`}>
                      {obs.severity.toUpperCase()}
                    </span>
                    <Badge variant={obs.status === 'open' ? 'error' : obs.status === 'resolved' ? 'success' : 'warning'}>
                      {obs.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-900 mt-1">{obs.description}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                    <span>Location: {obs.location}</span>
                    <span>&middot;</span>
                    <span>By: {obs.reportedBy}</span>
                    <span>&middot;</span>
                    <span>{obs.reportedAt}</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {showReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowReport(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Report Safety Observation</h3>
            <div className="space-y-4">
              <Select
                label="Type"
                options={[
                  { value: 'hazard', label: 'Hazard' },
                  { value: 'near_miss', label: 'Near Miss' },
                  { value: 'incident', label: 'Incident' },
                  { value: 'observation', label: 'Observation' },
                ]}
              />
              <Input label="Location" placeholder="e.g. Shaft B — Mazowe Mine" />
              <Textarea label="Description" placeholder="Describe what you observed..." rows={3} />
              <Select
                label="Severity"
                options={[
                  { value: 'low', label: 'Low' },
                  { value: 'medium', label: 'Medium' },
                  { value: 'high', label: 'High' },
                  { value: 'critical', label: 'Critical — Immediate Action' },
                ]}
              />
              <div className="flex gap-3 pt-2">
                <Button variant="primary" onClick={() => setShowReport(false)}>Submit Report</Button>
                <Button variant="ghost" onClick={() => setShowReport(false)}>Cancel</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
