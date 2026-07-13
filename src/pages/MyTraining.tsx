import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { PageSpinner } from '../components/ui/Spinner';
import { formatDate } from '../lib/utils';
import { useAuth } from '../hooks/useAuth';
import { useTraining } from '../hooks/useTraining';

export default function MyTraining() {
  const { user, profile, isAuthenticated, isLoading: authLoading } = useAuth();
  const {
    courses, enrollments, isLoading,
  } = useTraining(user?.uid);

  const courseMap = useMemo(() => {
    const map: Record<string, { title: string; slug: string; syllabus: { moduleNumber: number; title: string; description: string; duration: string }[] }> = {};
    for (const c of courses) {
      map[c.id] = { title: c.title, slug: c.slug, syllabus: c.syllabus };
    }
    return map;
  }, [courses]);

  const activeCerts = (profile?.certifications || []).filter((c: any) => c.status === 'active');

  if (authLoading || isLoading) return <PageSpinner />;

  if (!isAuthenticated) {
    return (
      <div className="py-16 bg-gray-50 min-h-screen flex items-center justify-center">
        <Card padding="lg" className="text-center max-w-md">
          <div className="text-5xl mb-4">🎓</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Sign in to view your training</h2>
          <p className="text-sm text-gray-500 mb-4">Track your enrollments, progress, and certifications.</p>
          <Link to="/client-portal"><Button variant="primary">Sign In</Button></Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="py-16 bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Training & Certifications</h1>
            <p className="text-gray-500 text-sm mt-1">Your digital certification wallet and learning portal</p>
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
              <p className="text-sm text-gray-500 mt-1">{activeCerts.length} active certification{activeCerts.length !== 1 ? 's' : ''}</p>

              {activeCerts.map((cert: any) => {
                const issued = cert.issuedAt?.toDate ? cert.issuedAt.toDate() : new Date(cert.issuedAt);
                const expires = cert.expiresAt?.toDate ? cert.expiresAt.toDate() : new Date(cert.expiresAt);
                const daysUntilExpiry = Math.ceil((expires.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                const isExpiringSoon = daysUntilExpiry <= 90 && daysUntilExpiry > 0;

                return (
                  <div key={cert.certificateNumber || cert.id} className="mt-4 p-4 border rounded-lg bg-white">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-gray-900">{cert.courseTitle}</h4>
                        <p className="text-xs text-gray-500 font-mono mt-0.5">{cert.certificateNumber}</p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                          <span>Issued: {formatDate(issued)}</span>
                          <span>Expires: {formatDate(expires)}</span>
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
                      <Link to={`/verify-cert/${cert.certificateNumber}`}>
                        <Button variant="ghost" size="sm">Verify</Button>
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
              <h3 className="text-lg font-semibold text-gray-900">Current Enrollments</h3>
              {enrollments.length === 0 ? (
                <p className="text-gray-500 text-sm py-6 text-center">
                  No enrollments yet. <Link to="/training" className="text-primary-500">Browse courses</Link> to get started.
                </p>
              ) : (
                enrollments.map((enr) => {
                  const courseInfo = courseMap[enr.courseId];
                  const modules = courseInfo?.syllabus || [];
                  const nextModule = enr.completedModules.length + 1;
                  const activeModule = enr.status === 'completed' ? null : nextModule;

                  return (
                    <div key={enr.id} className="mt-4 first:mt-0">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className="font-medium text-gray-900">{courseInfo?.title || enr.courseId}</h4>
                          <p className="text-xs text-gray-500 capitalize">{enr.status.replace('_', ' ')}</p>
                        </div>
                        <Badge variant={enr.status === 'completed' ? 'success' : 'info'}>{enr.progress}%</Badge>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-3">
                        <div className="bg-primary-500 h-2.5 rounded-full" style={{ width: `${enr.progress}%` }} />
                      </div>
                      {modules.length > 0 && (
                        <div className="space-y-2">
                          {modules.map((mod) => {
                            const isCompleted = enr.completedModules.includes(mod.moduleNumber);
                            const isCurrent = mod.moduleNumber === activeModule;
                            return (
                              <div
                                key={mod.moduleNumber}
                                className={`flex items-center gap-3 p-2.5 rounded-lg text-sm ${
                                  isCompleted ? 'bg-green-50' : isCurrent ? 'bg-primary-50' : 'bg-gray-50'
                                }`}
                              >
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                                  isCompleted ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'
                                }`}>
                                  {isCompleted ? '\u2713' : mod.moduleNumber}
                                </div>
                                <span className={isCompleted ? 'text-green-700' : 'text-gray-600'}>{mod.title}</span>
                                {isCurrent && (
                                  <Button variant="primary" size="sm" className="ml-auto">Continue</Button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </Card>

            <Card padding="lg">
              <h3 className="text-lg font-semibold text-gray-900">Practice Mode</h3>
              <p className="text-sm text-gray-500 mt-1">
                Practice blasting fuse timing and safety procedures safely before your assessment.
              </p>
              <Button variant="outline" className="mt-3">Start Practice</Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
