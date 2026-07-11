import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { PageSpinner } from '../components/ui/Spinner';
import { Link } from 'react-router-dom';

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
    return (
      <div className="py-16 bg-gray-50 min-h-screen">
        <div className="max-w-2xl mx-auto px-4">
          <Card padding="lg">
            <h1 className="text-2xl font-bold">Welcome, {profile.name}</h1>
            <p className="text-gray-600 mt-2">{profile.email}</p>
            <p className="text-sm text-gray-500 mt-1 capitalize">Role: {profile.role.replace('_', ' ')}</p>

            <div className="mt-8 grid gap-4">
              <h3 className="font-semibold text-gray-900">Quick Actions</h3>
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  { label: 'My Training', to: '/my-training' },
                  { label: 'Submit Enquiry', to: '/lead-form' },
                  { label: 'Browse Services', to: '/services' },
                  { label: 'Browse Courses', to: '/training' },
                ].map((action) => (
                  <Link key={action.to} to={action.to}>
                    <Button variant="outline" className="w-full">
                      {action.label}
                    </Button>
                  </Link>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-100">
              <Button variant="ghost" onClick={logout}>
                Sign Out
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
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
        <Card padding="lg">
          <h1 className="text-2xl font-bold text-center text-gray-900">
            {isLogin ? 'Client Portal' : 'Create Account'}
          </h1>
          <p className="text-center text-gray-600 mt-2 text-sm">
            {isLogin ? 'Sign in to manage your projects and training' : 'Register to access our services'}
          </p>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {!isLogin && (
              <>
                <Input label="Full Name" value={name} onChange={(e) => setName(e.target.value)} required />
                <Input label="Phone Number" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                <Input label="Company Name" value={company} onChange={(e) => setCompany(e.target.value)} />
              </>
            )}
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button type="submit" variant="primary" className="w-full" isLoading={submitting}>
              {isLogin ? 'Sign In' : 'Create Account'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => { setIsLogin(!isLogin); setError(''); }}
              className="text-sm text-primary-500 hover:text-primary-600"
            >
              {isLogin ? "Don't have an account? Register" : 'Already have an account? Sign In'}
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}
