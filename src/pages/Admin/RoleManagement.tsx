import { useState, useEffect, useCallback } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../hooks/useAuth';
import { queryDocs, updateDocById } from '../../lib/db';
import toast from 'react-hot-toast';
import type { AppUser, UserRole } from '../../types';

const ROLES: { value: UserRole; label: string }[] = [
  { value: 'client', label: 'Client' },
  { value: 'trainee', label: 'Trainee' },
  { value: 'sales_rep', label: 'Sales Rep' },
  { value: 'trainer', label: 'Trainer' },
  { value: 'project_manager', label: 'Project Manager' },
  { value: 'admin', label: 'Admin' },
  { value: 'super_admin', label: 'Super Admin' },
];

export default function RoleManagement() {
  const { role } = useAuth();
  const [users, setUsers] = useState<(AppUser & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const isSuperAdmin = role === 'super_admin';

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const all = await queryDocs<(AppUser & { id: string })>('users');
      setUsers(all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (err) {
      console.error(err);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    try {
      await updateDocById('users', userId, { role: newRole });
      setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, role: newRole } : u));
      toast.success(`Role updated to ${ROLES.find((r) => r.value === newRole)?.label}`);
    } catch (err) {
      toast.error('Failed to update role');
    }
  };

  const filtered = search
    ? users.filter((u) =>
        u.name?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase())
      )
    : users;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Role Management</h1>
          <p className="text-gray-500 text-sm mt-1">Assign and manage user roles</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2 py-1 rounded-full ${isSuperAdmin ? 'bg-purple-50 text-purple-600 border border-purple-200' : 'bg-gray-100 text-gray-500'}`}>
            {role}
          </span>
        </div>
      </div>

      {!isSuperAdmin && (
        <Card padding="md" className="mb-6 bg-yellow-50 border-yellow-200">
          <p className="text-sm text-yellow-700">Only super admins can change roles.</p>
        </Card>
      )}

      <Card padding="md" className="mb-6">
        <Input
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </Card>

      <Card padding="none">
        {loading ? (
          <div className="p-8 text-center text-gray-400 text-sm">Loading users...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">No users found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Name</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Email</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Company</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Current Role</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Change To</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Created</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((user) => (
                  <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="px-4 py-3 font-medium text-gray-900">{user.name || '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{user.email}</td>
                    <td className="px-4 py-3 text-gray-600">{user.companyName || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${
                        user.role === 'super_admin' ? 'bg-purple-50 text-purple-600' :
                        user.role === 'admin' ? 'bg-red-50 text-red-600' :
                        user.role === 'project_manager' ? 'bg-blue-50 text-blue-600' :
                        user.role === 'trainer' ? 'bg-green-50 text-green-600' :
                        'bg-gray-50 text-gray-600'
                      }`}>
                        {ROLES.find((r) => r.value === user.role)?.label || user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {isSuperAdmin ? (
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
                          className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-primary-400"
                        >
                          {ROLES.map((r) => (
                            <option key={r.value} value={r.value}>{r.label}</option>
                          ))}
                        </select>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
