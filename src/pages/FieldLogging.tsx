import { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Textarea } from '../components/ui/Textarea';
import { Badge } from '../components/ui/Badge';

interface FieldLog {
  id: string;
  date: string;
  depthMeters: number;
  rockType: string;
  waterIngress: string;
  notes: string;
  photos: string[];
  synced: boolean;
}

const demoLogs: FieldLog[] = [
  { id: '1', date: '2026-07-11', depthMeters: 8.5, rockType: 'hard', waterIngress: 'none', notes: 'Steady progress through granite layer', photos: [], synced: true },
  { id: '2', date: '2026-07-10', depthMeters: 7.2, rockType: 'hard', waterIngress: 'none', notes: 'No issues. Rock slightly fractured at 6.8m', photos: [], synced: true },
  { id: '3', date: '2026-07-09', depthMeters: 6.0, rockType: 'medium', waterIngress: 'minor', notes: 'Hit transition zone. Minor seepage started', photos: [], synced: true },
  { id: '4', date: '2026-07-08', depthMeters: 5.0, rockType: 'soft', waterIngress: 'none', notes: 'Topsoil and weathered rock cleared', photos: [], synced: false },
];

export default function FieldLogging() {
  const [isLogging, setIsLogging] = useState(false);
  const [depth, setDepth] = useState('');
  const [rockType, setRockType] = useState('hard');
  const [waterIngress, setWaterIngress] = useState('none');
  const [notes, setNotes] = useState('');
  const [logs, setLogs] = useState<FieldLog[]>(demoLogs);

  const pendingSync = logs.filter((l) => !l.synced).length;

  const submitLog = () => {
    const newLog: FieldLog = {
      id: String(Date.now()),
      date: new Date().toISOString().split('T')[0],
      depthMeters: parseFloat(depth) || 0,
      rockType,
      waterIngress,
      notes,
      photos: [],
      synced: false,
    };
    setLogs([newLog, ...logs]);
    setIsLogging(false);
    setDepth('');
    setNotes('');
  };

  const currentDepth = logs[0]?.depthMeters || 0;
  const targetDepth = 12;

  return (
    <div className="py-16 bg-gray-50 min-h-screen">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Field Logging</h1>
            <p className="text-gray-500 text-sm">Shaft Rehabilitation — Mazowe Mine</p>
          </div>
          <Badge variant={pendingSync > 0 ? 'warning' : 'success'}>
            {pendingSync > 0 ? `${pendingSync} pending sync` : 'All synced'}
          </Badge>
        </div>

        <Card padding="lg" className="mb-6">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-primary-50 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-primary-500">{currentDepth}m</div>
              <div className="text-xs text-gray-500 mt-1">Current Depth</div>
            </div>
            <div className="bg-gray-100 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-gray-700">{targetDepth}m</div>
              <div className="text-xs text-gray-500 mt-1">Today's Target</div>
            </div>
          </div>
          <div className="mb-2 flex justify-between text-xs text-gray-500">
            <span>Progress</span>
            <span>{Math.round((currentDepth / targetDepth) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div className="bg-primary-500 h-3 rounded-full transition-all" style={{ width: `${(currentDepth / targetDepth) * 100}%` }} />
          </div>
        </Card>

        {!isLogging ? (
          <Button variant="primary" className="w-full mb-6" size="lg" onClick={() => setIsLogging(true)}>
            + Log Progress
          </Button>
        ) : (
          <Card padding="lg" className="mb-6">
            <h3 className="text-lg font-semibold mb-4">New Progress Entry</h3>
            <div className="space-y-4">
              <Input label="Depth Reached (meters)" type="number" value={depth} onChange={(e) => setDepth(e.target.value)} placeholder="e.g. 9.2" />
              <Select
                label="Rock Type"
                value={rockType}
                onChange={(e) => setRockType(e.target.value)}
                options={[
                  { value: 'soft', label: 'Soft (soil/clay)' },
                  { value: 'medium', label: 'Medium (weathered)' },
                  { value: 'hard', label: 'Hard (solid rock)' },
                ]}
              />
              <Select
                label="Water Ingress"
                value={waterIngress}
                onChange={(e) => setWaterIngress(e.target.value)}
                options={[
                  { value: 'none', label: 'None — Dry' },
                  { value: 'minor', label: 'Minor seepage' },
                  { value: 'moderate', label: 'Moderate inflow' },
                  { value: 'heavy', label: 'Heavy — Needs pump' },
                ]}
              />
              <Textarea label="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Observations, issues, next steps..." rows={3} />
              <div className="text-sm text-gray-500 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Add photo (optional)
              </div>
              <div className="flex gap-3 pt-2">
                <Button variant="primary" onClick={submitLog} disabled={!depth}>Submit Log</Button>
                <Button variant="ghost" onClick={() => setIsLogging(false)}>Cancel</Button>
              </div>
            </div>
          </Card>
        )}

        <div>
          <h3 className="font-semibold text-gray-900 mb-3">Previous Logs</h3>
          <div className="space-y-3">
            {logs.map((log) => (
              <Card key={log.id} padding="md" className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">{log.depthMeters}m</span>
                    <span className="text-xs text-gray-400">{log.date}</span>
                    {!log.synced && <Badge variant="warning">Pending</Badge>}
                  </div>
                  <p className="text-sm text-gray-600 mt-0.5">
                    {log.rockType} rock &middot; {log.waterIngress} water {log.notes && `— ${log.notes}`}
                  </p>
                </div>
                <span className={`w-2 h-2 rounded-full ${log.synced ? 'bg-green-400' : 'bg-yellow-400'}`} />
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
