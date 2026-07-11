import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { useFirestoreDoc } from '../hooks/useFirestore';
import { formatDate } from '../lib/utils';
import { useParams } from 'react-router-dom';

interface ProcItem {
  id: string;
  name: string;
  vendor: string;
  poNumber: string;
  stages: { name: string; completedAt?: Date; photoUrl?: string; notes?: string }[];
  currentStage: string;
  expectedDelivery: Date;
}

interface Proj {
  procurementItems?: ProcItem[];
  title: string;
}

export default function ProcurementTracker() {
  const { projectId } = useParams<{ projectId: string }>();
  const { data: project } = useFirestoreDoc<Proj>('projects', projectId || null);

  if (!projectId) return <div className="py-16 text-center text-gray-500">No project specified.</div>;

  const items = (project as any)?.procurementItems || [];

  return (
    <div className="py-16 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Procurement Tracker</h1>
        <p className="text-gray-500 text-sm mb-8">{(project as any)?.title || 'Project'}</p>

        {items.length === 0 && <Card padding="lg"><p className="text-center text-gray-500 py-8">No procurement items tracked for this project.</p></Card>}

        <div className="space-y-6">
          {items.map((item: ProcItem, idx: number) => {
            const stageIndex = item.stages.findIndex((s) => s.name === item.currentStage);
            return (
              <Card key={item.id || idx} padding="lg">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">{item.name}</h3>
                    <p className="text-xs text-gray-500">{item.vendor} &middot; PO: {item.poNumber}</p>
                  </div>
                  <Badge variant={stageIndex >= item.stages.length - 1 ? 'success' : 'info'}>
                    Expected: {formatDate((item.expectedDelivery as any)?.toDate?.() || item.expectedDelivery)}
                  </Badge>
                </div>

                <div className="flex items-center gap-0">
                  {item.stages.map((stage, i) => {
                    const isComplete = !!stage.completedAt;
                    const isCurrent = stage.name === item.currentStage;
                    return (
                      <div key={stage.name} className="flex-1 flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${isComplete ? 'bg-green-500 text-white' : isCurrent ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                          {isComplete ? '\u2713' : i + 1}
                        </div>
                        <span className="text-[10px] text-center mt-1 text-gray-600 leading-tight">{stage.name}</span>
                        {stage.completedAt && <span className="text-[9px] text-gray-400">{formatDate((stage.completedAt as any).toDate?.() || stage.completedAt)}</span>}
                        {i < item.stages.length - 1 && <div className={`h-0.5 w-full mt-2 ${isComplete ? 'bg-green-500' : 'bg-gray-200'}`} />}
                      </div>
                    );
                  })}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
