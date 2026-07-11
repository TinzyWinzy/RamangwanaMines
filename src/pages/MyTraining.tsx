import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

const demoEnrollments = [
  {
    id: 'e1',
    courseTitle: 'Mine Blasting Certification',
    status: 'in_progress',
    progress: 40,
    completedModules: [1, 2],
    nextModule: 3,
    certificateUrl: null,
    batchName: 'Blasting Q3 2026',
    courseSlug: 'mine-blasting-certification',
  },
];

const allDemoModules: Record<string, { moduleNumber: number; title: string; description: string }[]> = {
  'mine-blasting-certification': [
    { moduleNumber: 1, title: 'Introduction to Blasting', description: 'Overview of blasting in mining, types of explosives.' },
    { moduleNumber: 2, title: 'Explosive Handling & Storage', description: 'Safe handling and storage of explosives.' },
    { moduleNumber: 3, title: 'Blast Design Fundamentals', description: 'Principles of blast design.' },
    { moduleNumber: 4, title: 'Safety & Risk Management', description: 'Risk assessment and safety protocols.' },
    { moduleNumber: 5, title: 'Regulatory Compliance', description: 'Zimbabwe mining regulations.' },
    { moduleNumber: 6, title: 'Practical Field Assessment', description: 'Supervised practical and exam.' },
  ],
};

export default function MyTraining() {
  const enrollment = demoEnrollments[0];
  const modules = allDemoModules['mine-blasting-certification'] || [];
  const nextModule = modules.find((m) => m.moduleNumber === enrollment.nextModule);

  return (
    <div className="py-16 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="section-title">My Training</h1>
        <p className="section-subtitle mb-8">Track your progress and continue learning</p>

        <div className="space-y-6">
          <Card padding="lg">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-xl font-semibold">{enrollment.courseTitle}</h2>
                  <Badge variant={enrollment.status === 'in_progress' ? 'info' : 'success'}>
                    {enrollment.status === 'in_progress' ? 'In Progress' : 'Completed'}
                  </Badge>
                </div>
                <p className="text-sm text-gray-500">Batch: {enrollment.batchName}</p>
              </div>
              {enrollment.certificateUrl && (
                <Button variant="primary" size="sm">Download Certificate</Button>
              )}
            </div>

            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Overall Progress</span>
                <span className="text-sm font-semibold text-primary-500">{enrollment.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-primary-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${enrollment.progress}%` }}
                />
              </div>
            </div>

            {nextModule && (
              <div className="mt-6 p-4 bg-primary-50 rounded-lg border border-primary-100">
                <p className="text-sm text-primary-700 font-medium">Continue where you left off</p>
                <p className="text-primary-600">Module {nextModule.moduleNumber}: {nextModule.title}</p>
              </div>
            )}
          </Card>

          <Card padding="lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Modules</h3>
            <div className="space-y-3">
              {modules.map((mod) => {
                const isCompleted = enrollment.completedModules.includes(mod.moduleNumber);
                const isCurrent = mod.moduleNumber === enrollment.nextModule;
                return (
                  <div
                    key={mod.moduleNumber}
                    className={`flex items-center gap-4 p-4 border rounded-lg ${
                      isCompleted ? 'border-green-200 bg-green-50' : isCurrent ? 'border-primary-200 bg-primary-50' : 'border-gray-200'
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${
                        isCompleted
                          ? 'bg-green-500 text-white'
                          : isCurrent
                          ? 'bg-primary-500 text-white'
                          : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {isCompleted ? '✓' : mod.moduleNumber}
                    </div>
                    <div className="flex-1">
                      <span className={`font-medium ${isCompleted ? 'text-green-700' : 'text-gray-900'}`}>
                        {mod.title}
                      </span>
                      <span className="block text-xs text-gray-500">{mod.description}</span>
                    </div>
                    <div>
                      {isCompleted ? (
                        <Badge variant="success">Complete</Badge>
                      ) : isCurrent ? (
                        <Button variant="primary" size="sm">
                          Start
                        </Button>
                      ) : (
                        <Badge variant="default">Locked</Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
