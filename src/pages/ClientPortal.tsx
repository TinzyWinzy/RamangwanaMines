import { useState, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { PageSpinner } from '../components/ui/Spinner';
import { Link } from 'react-router-dom';
import { useFirestoreCollection } from '../hooks/useFirestore';
import { orderBy, updateDocById } from '../lib/db';
import { uploadFile as uploadToStorage, getFilePath } from '../lib/storage';
import type { Project } from '../types';
import { formatCurrency, formatDate } from '../lib/utils';
import { openWhatsApp, getWhatsAppNumber } from '../lib/whatsapp';
import toast from 'react-hot-toast';

function HealthRing({ score }: { score: number }) {
  const r = 26;
  const circumference = 2 * Math.PI * r;
  const dashOffset = circumference - (score / 100) * circumference;
  const color = score >= 75 ? '#16a34a' : score >= 50 ? '#d97706' : '#dc2626';

  return (
    <div className="relative w-16 h-16">
      <svg viewBox="0 0 60 60" className="w-full h-full -rotate-90">
        <circle cx="30" cy="30" r={r} fill="none" stroke="#f0f0f0" strokeWidth="6" />
        <circle cx="30" cy="30" r={r} fill="none" stroke={color} strokeWidth="6"
          strokeDasharray={circumference} strokeDashoffset={dashOffset}
          strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s ease' }} />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-gray-700">{score}</span>
    </div>
  );
}

function AuthenticatedPortal({ profile, logout }: { profile: any; logout: () => void }) {
  const { data: projects, isLoading } = useFirestoreCollection<Project>('projects', [orderBy('createdAt', 'desc')]);
  const [uploadName, setUploadName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [docUploading, setDocUploading] = useState(false);
  const [activeProject, setActiveProject] = useState<string | null>(null);
  const [photos, setPhotos] = useState<{ id: string; url: string; name: string; date: string }[]>([]);
  const [photoUploading, setPhotoUploading] = useState(false);
  const cameraRef = useRef<HTMLInputElement>(null);

  const handleRequestUpdate = (projectTitle: string) => {
    const msg = `👋 Hi Ramangwana Mining,\n\nI'd like an update on my project: *${projectTitle}*.\n\nPlease reply with the latest progress. Thank you!`;
    openWhatsApp(getWhatsAppNumber(), msg);
  };

  const handleDocUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !activeProject) return;
    setDocUploading(true);
    try {
      const path = getFilePath('projects', activeProject, selectedFile.name);
      const url = await uploadToStorage(path, selectedFile);
      const docEntry = {
        name: selectedFile.name,
        fileName: selectedFile.name,
        url,
        type: selectedFile.type,
        uploadedAt: new Date().toISOString(),
        status: 'pending_review',
        version: 1,
      };
      const p = projects.find((pr) => pr.id === activeProject) as any;
      const existing = p?.documents || [];
      await updateDocById('projects', activeProject, { documents: [...existing, docEntry] });
      toast.success(`"${selectedFile.name}" uploaded successfully`);
      setUploadName('');
      setSelectedFile(null);
    } catch (err) {
      toast.error('Upload failed');
      console.warn(err);
    } finally {
      setDocUploading(false);
    }
  };

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      const newPhoto = {
        id: `photo-${Date.now()}`,
        url: dataUrl,
        name: file.name,
        date: new Date().toISOString(),
      };
      setPhotos((prev) => [newPhoto, ...prev]);
      toast.success('Photo captured');
    };
    reader.readAsDataURL(file);
    if (cameraRef.current) cameraRef.current.value = '';
  };

  const handlePhotoUpload = async () => {
    const unsynced = photos.filter((p) => p.url.startsWith('data:'));
    if (unsynced.length === 0) return;
    setPhotoUploading(true);
    let uploaded = 0;
    for (const photo of unsynced) {
      try {
        const blob = await fetch(photo.url).then((r) => r.blob());
        const file = new File([blob], photo.name, { type: blob.type || 'image/jpeg' });
        const path = `photos/${activeProject || 'general'}/${Date.now()}_${photo.name}`;
        const url = await uploadToStorage(path, file);
        const photoEntry = { name: photo.name, url, date: photo.date };
        if (activeProject) {
          const p = projects.find((pr) => pr.id === activeProject) as any;
          const existing = p?.photos || [];
          await updateDocById('projects', activeProject, { photos: [...existing, photoEntry] });
        }
        setPhotos((prev) => prev.map((p) => p.id === photo.id ? { ...p, url } : p));
        uploaded++;
      } catch (err) {
        console.warn('Photo upload failed:', photo.name, err);
      }
    }
    setPhotoUploading(false);
    if (uploaded > 0) toast.success(`${uploaded} photo${uploaded > 1 ? 's' : ''} synced to cloud`);
  };

  return (
    <div className="py-16 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome, {profile.name}</h1>
            <p className="text-gray-500 text-sm mt-0.5">{profile.email} · {profile.companyName || 'Client'}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={logout}>Sign Out</Button>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            { label: '📄 Submit Enquiry', to: '/lead-form' },
            { label: '⛳ ROI Calculator', to: '/roi-calculator' },
            { label: '🎓 My Training', to: '/my-training' },
            { label: '📚 Browse Courses', to: '/training' },
          ].map((a) => (
            <Link key={a.to} to={a.to}>
              <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 hover:border-primary-300 hover:text-primary-600 hover:shadow-sm transition-all text-center cursor-pointer">
                {a.label}
              </div>
            </Link>
          ))}
        </div>

        {/* Projects */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Your Projects</h2>
          {isLoading ? (
            <PageSpinner />
          ) : projects.length === 0 ? (
            <Card padding="lg">
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-3">⛏️</div>
                <p className="font-medium">No active projects yet</p>
                <p className="text-sm mt-1">Once your enquiry is converted, your project will appear here with real-time progress.</p>
                <Link to="/lead-form" className="inline-block mt-4">
                  <Button variant="primary">Submit Enquiry</Button>
                </Link>
              </div>
            </Card>
          ) : (
            <div className="space-y-4">
              {projects.map((project) => {
                const p = project as any;
                const healthScore = p.healthScore || 75;
                const progress = p.status === 'completed' ? 100 : Math.round(((p.invoicedUsd || 0) / (p.budgetUsd || 1)) * 100);
                const isExpanded = activeProject === project.id;

                return (
                  <Card key={project.id} padding="lg">
                    <div className="flex items-start gap-4">
                      <HealthRing score={healthScore} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-gray-900">{project.title}</h3>
                          <Badge variant={p.status === 'completed' ? 'success' : healthScore >= 75 ? 'success' : healthScore >= 50 ? 'warning' : 'error'}>
                            {p.status === 'completed' ? 'Completed' : healthScore >= 75 ? 'On Track' : healthScore >= 50 ? 'At Risk' : 'Delayed'}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500 mt-0.5 truncate">{project.description?.slice(0, 80)}...</p>

                        {/* Progress bar */}
                        <div className="mt-3">
                          <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>Progress</span>
                            <span>{progress}%</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${progress >= 100 ? 'bg-green-500' : 'bg-primary-500'}`}
                              style={{ width: `${Math.min(progress, 100)}%`, transition: 'width 0.7s ease' }}
                            />
                          </div>
                          <div className="flex justify-between text-xs text-gray-400 mt-1">
                            <span>Budget: {formatCurrency(p.paidUsd || 0)} paid of {formatCurrency(project.budgetUsd)}</span>
                          </div>
                        </div>

                        {/* Milestones */}
                        {(p.milestones || []).length > 0 && (
                          <div className="mt-3 space-y-1">
                            {(p.milestones || []).slice(0, 3).map((m: any) => (
                              <div key={m.id} className="flex items-center gap-2 text-xs text-gray-600">
                                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${m.status === 'completed' ? 'bg-green-500' : m.status === 'delayed' ? 'bg-red-400' : 'bg-gray-300'}`} />
                                <span>{m.name}</span>
                                {m.targetDate && <span className="text-gray-400">— {formatDate(m.targetDate.toDate?.() || m.targetDate)}</span>}
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="flex gap-2 mt-4">
                          <Button variant="ghost" size="sm" onClick={() => setActiveProject(isExpanded ? null : project.id)}>
                            {isExpanded ? 'Hide Details' : 'View Details'}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRequestUpdate(project.title)}
                          >
                            📱 Request Update
                          </Button>
                        </div>

                        {/* Expanded: documents + upload */}
                        {isExpanded && (
                          <div className="mt-4 pt-4 border-t border-gray-100 space-y-4">
                            <div>
                              <h4 className="text-sm font-semibold text-gray-700 mb-2">Project Documents</h4>
                              {(p.documents || []).length === 0 ? (
                                <p className="text-xs text-gray-400">No documents uploaded yet.</p>
                              ) : (
                                <div className="space-y-1">
                                  {(p.documents || []).map((doc: any) => (
                                    <a key={doc.id || doc.name} href={doc.url} target="_blank" rel="noopener noreferrer"
                                      className="flex items-center gap-2 text-sm text-primary-600 hover:underline cursor-pointer">
                                      <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                      {doc.name || doc.fileName}
                                    </a>
                                  ))}
                                </div>
                              )}
                            </div>
                            <div>
                              <h4 className="text-sm font-semibold text-gray-700 mb-2">Upload Document</h4>
                              <form onSubmit={handleDocUpload} className="flex gap-2 flex-wrap">
                                  <input
                                  type="file"
                                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                                  className="text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 cursor-pointer"
                                />
                                <Button type="submit" variant="primary" size="sm" disabled={!selectedFile || docUploading} isLoading={docUploading}>
                                  {docUploading ? 'Uploading...' : 'Upload'}
                                </Button>
                              </form>
                              <p className="text-xs text-gray-400 mt-1">Supports: PDF, JPG, PNG, DWG, XLSX (max 10MB)</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Diaspora Photo Upload */}
        <Card padding="lg" className="mb-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">🌍 Diaspora Site Inspection</h2>
              <p className="text-sm text-gray-500 mt-0.5">Capture and share mine-site photos with your team abroad — Ramangwana verifies and archives each image.</p>
            </div>
            {photos.filter((p) => p.url.startsWith('data:')).length > 0 && (
              <Button variant="primary" size="sm" isLoading={photoUploading} onClick={handlePhotoUpload}>
                ☁️ Sync {photos.filter((p) => p.url.startsWith('data:')).length} Photo{photos.filter((p) => p.url.startsWith('data:')).length > 1 ? 's' : ''}
              </Button>
            )}
          </div>

          <div className="mt-4">
            <div className="flex items-center gap-3 mb-4">
              <Button variant="outline" size="sm" onClick={() => cameraRef.current?.click()}>
                📸 Capture Photo
              </Button>
              <input
                ref={cameraRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handlePhotoCapture}
                className="hidden"
              />
              <label className="text-xs text-gray-400 cursor-pointer hover:text-gray-600" onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/*';
                input.multiple = true;
                input.onchange = (e: any) => {
                  for (const file of e.target?.files || []) {
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                      setPhotos((prev) => [{
                        id: `photo-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                        url: ev.target?.result as string,
                        name: file.name,
                        date: new Date().toISOString(),
                      }, ...prev]);
                    };
                    reader.readAsDataURL(file);
                  }
                };
                input.click();
              }}>
                or upload from gallery
              </label>
            </div>

            {photos.length === 0 ? (
              <div className="text-center py-8 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
                <div className="text-4xl mb-2">📷</div>
                <p className="text-sm">No photos yet</p>
                <p className="text-xs mt-1">Capture site photos to share with your team abroad</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {photos.map((photo) => (
                  <div key={photo.id} className="group relative rounded-xl overflow-hidden border border-gray-200 bg-white">
                    <img src={photo.url} alt={photo.name} className="w-full h-32 object-cover" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <button
                        type="button"
                        className="text-white bg-red-500 hover:bg-red-600 rounded-full p-1.5 transition-colors"
                        onClick={() => setPhotos((prev) => prev.filter((p) => p.id !== photo.id))}
                        title="Remove"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                    <div className="px-2 py-1.5 text-xs text-gray-500 truncate">
                      {new Date(photo.date).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

export default function ClientPortal() {
  const { profile, isAuthenticated, isLoading, login, register, logout } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (isLoading) return <PageSpinner />;

  if (isAuthenticated && profile) {
    return <AuthenticatedPortal profile={profile} logout={logout} />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(email, password, { name, phone, companyName: company });
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="py-16 bg-gray-50 min-h-screen">
      <div className="max-w-md mx-auto px-4">
        {/* Value proposition before login */}
        {isLogin && (
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { icon: '📊', text: 'Live project health scores' },
              { icon: '📄', text: 'Document access & upload' },
              { icon: '💬', text: 'Direct update requests' },
            ].map((f) => (
              <div key={f.text} className="bg-white border border-gray-200 rounded-xl p-3 text-center">
                <div className="text-2xl mb-1">{f.icon}</div>
                <div className="text-xs text-gray-600">{f.text}</div>
              </div>
            ))}
          </div>
        )}

        <Card padding="lg">
          <div className="flex items-center gap-2 justify-center mb-4">
            <img src="/logo.jpg" alt="Logo" className="h-8 w-8 rounded object-cover" />
            <h1 className="text-xl font-bold text-gray-900">
              {isLogin ? 'Client Portal' : 'Create Account'}
            </h1>
          </div>
          <p className="text-center text-gray-500 text-sm mb-6">
            {isLogin ? 'Access your projects, documents, and training records' : 'Register to track your projects in real time'}
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <Input label="Full Name" value={name} onChange={(e) => setName(e.target.value)} required />
                <Input label="Phone Number" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                <Input label="Company Name" value={company} onChange={(e) => setCompany(e.target.value)} />
              </>
            )}
            <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <Button type="submit" variant="primary" className="w-full" isLoading={submitting}>
              {isLogin ? 'Sign In' : 'Create Account'}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <button type="button" onClick={() => { setIsLogin(!isLogin); setError(''); }} className="text-sm text-primary-500 hover:text-primary-600">
              {isLogin ? "Don't have an account? Register" : 'Already have an account? Sign In'}
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}
