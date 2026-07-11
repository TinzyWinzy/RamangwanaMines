import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { formatDate, formatCurrency } from '../lib/utils';

const demoCertifications = [
  {
    id: 'cert1',
    courseTitle: 'Mine Blasting Certification',
    certificateNumber: 'RMG-CERT-2026-0001',
    issuedAt: new Date('2026-06-15'),
    expiresAt: new Date('2027-06-15'),
    status: 'active',
    score: 92,
    certificateUrl: '#',
  },
  {
    id: 'cert2',
    courseTitle: 'Shaft Safety & Rescue',
    certificateNumber: 'RMG-CERT-2026-0042',
    issuedAt: new Date('2026-03-01'),
    expiresAt: new Date('2026-09-01'),
    status: 'active',
    score: 88,
    certificateUrl: '#',
  },
];

const demoEnrollments = [
  {
    id: 'e1',
    courseTitle: 'Grade Control & Sampling',
    courseSlug: 'grade-control-sampling',
    status: 'in_progress',
    progress: 65,
    completedModules: [1, 2],
    nextModule: 3,
    batchName: 'Geology Q3 2026',
  },
];

const allDemoModules: Record<string, { moduleNumber: number; title: string; description: string }[]> = {
  'grade-control-sampling': [
    { moduleNumber: 1, title: 'Sampling Fundamentals', description: 'Types of sampling, sample collection, and preparation methods.' },
    { moduleNumber: 2, title: 'QA/QC Procedures', description: 'Quality assurance and quality control in sampling programs.' },
    { moduleNumber: 3, title: 'Data Interpretation & Reporting', description: 'Analysis, interpretation, and reporting of grade control data.' },
  ],
};

export default function MyTraining() {
  const modules = allDemoModules['grade-control-sampling'] || [];
  const activeCerts = demoCertifications.filter((c) => c.status === 'active');
  const expiringSoon = demoCertifications.filter((c) => {
    const daysUntil = Math.ceil((c.expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return daysUntil <= 90 && daysUntil > 0;
  });

  return (
    <div className="py-16 bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="section-title">Training & Certifications</h1>
            <p className="section-subtitle">Your digital certification wallet and learning portal</p>
          </div>
          <Link to="/training">
            <Button variant="primary">Browse Courses</Button>
          </Link>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <Card padding="lg">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <svg className="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                Certification Wallet
              </h3>
              <p className="text-sm text-gray-500 mt-1">{activeCerts.length} active certifications</p>

              {demoCertifications.map((cert) => {
                const daysUntilExpiry = Math.ceil((cert.expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                const isExpiringSoon = daysUntilExpiry <= 90;

                return (
                  <div key={cert.id} className="mt-4 p-4 border rounded-lg bg-white">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-gray-900">{cert.courseTitle}</h4>
                        <p className="text-xs text-gray-500 font-mono mt-0.5">{cert.certificateNumber}</p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                          <span>Issued: {formatDate(cert.issuedAt)}</span>
                          <span>Expires: {formatDate(cert.expiresAt)}</span>
                          <span>Score: {cert.score}%</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge variant={isExpiringSoon ? 'warning' : 'success'}>
                          {isExpiringSoon ? `Expires in ${daysUntilExpiry}d` : 'Active'}
                        </Badge>
                        {isExpiringSoon && (
                          <Button variant="outline" size="sm">Renew Now</Button>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                      <Button variant="ghost" size="sm">Download PDF</Button>
                      <Link to={`/verify-cert/${cert.certificateNumber}`}>
                        <Button variant="ghost" size="sm">Verify QR</Button>
                      </Link>
                    </div>
                  </div>
                );
              })}

              {activeCerts.length === 0 && (
                <p className="text-gray-500 text-sm py-6 text-center">
                  No certifications yet. Complete a training course to earn your first.
                </p>
              )}
            </Card>
          </div>

          <div className="space-y-6">
            <Card padding="lg">
              <h3 className="text-lg font-semibold text-gray-900">In Progress</h3>
              {demoEnrollments.map((enr) => (
                <div key={enr.id} className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-medium text-gray-900">{enr.courseTitle}</h4>
                      <p className="text-xs text-gray-500">{enr.batchName}</p>
                    </div>
                    <Badge variant="info">{enr.progress}%</Badge>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mb-3">
                    <div className="bg-primary-500 h-2.5 rounded-full" style={{ width: `${enr.progress}%` }} />
                  </div>
                  <div className="space-y-2">
                    {modules.map((mod) => {
                      const isCompleted = enr.completedModules.includes(mod.moduleNumber);
                      return (
                        <div
                          key={mod.moduleNumber}
                          className={`flex items-center gap-3 p-2.5 rounded-lg text-sm ${
                            isCompleted ? 'bg-green-50' : mod.moduleNumber === enr.nextModule ? 'bg-primary-50' : 'bg-gray-50'
                          }`}
                        >
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                            isCompleted ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'
                          }`}>
                            {isCompleted ? '\u2713' : mod.moduleNumber}
                          </div>
                          <span className={isCompleted ? 'text-green-700' : 'text-gray-600'}>{mod.title}</span>
                          {mod.moduleNumber === enr.nextModule && (
                            <Button variant="primary" size="sm" className="ml-auto">Continue</Button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </Card>

            <Card padding="lg">
              <h3 className="text-lg font-semibold text-gray-900">Practice Mode</h3>
              <p className="text-sm text-gray-500 mt-1">
                Practice blasting fuse timing and safety procedures safely before your assessment.
              </p>
              <Button variant="outline" className="mt-3">Start AR Practice</Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
