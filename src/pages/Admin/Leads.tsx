import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useFirestoreCollection } from '../../hooks/useFirestore';
import { orderBy, updateDocById, createDoc } from '../../lib/db';
import type { Enquiry } from '../../types';
import { formatDate } from '../../lib/utils';
import { PageSpinner } from '../../components/ui/Spinner';

export default function ClientDashboardFull() {
  const { data: enquiries, isLoading } = useFirestoreCollection<Enquiry>('enquiries', [orderBy('createdAt', 'desc')]);
  const [newEnquiry, setNewEnquiry] = useState({ fullName: '', companyName: '', phone: '', email: '', enquiryType: 'general_inquiry', serviceId: '', projectDescription: '' });
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createDoc('enquiries', { ...newEnquiry, status: 'new', priority: 'medium', leadScore: 0, source: 'website', documents: [], budgetRange: 'Undisclosed' });
    setShowForm(false);
    setNewEnquiry({ fullName: '', companyName: '', phone: '', email: '', enquiryType: 'general_inquiry', serviceId: '', projectDescription: '' });
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    await updateDocById('enquiries', id, { status: newStatus });
  };

  if (isLoading) return <div className="py-16"><PageSpinner /></div>;

  return (
    <div className="py-16 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div><h1 className="text-2xl font-bold text-gray-900">My Enquiries & Leads</h1><p className="text-gray-500 text-sm">{enquiries.length} total</p></div>
          <Button variant="primary" onClick={() => setShowForm(true)}>+ New Enquiry</Button>
        </div>

        {showForm && (
          <Card padding="lg" className="mb-6">
            <h3 className="text-lg font-semibold mb-4">New Enquiry</h3>
            <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
              <Input label="Full Name" value={newEnquiry.fullName} onChange={(e) => setNewEnquiry({ ...newEnquiry, fullName: e.target.value })} required />
              <Input label="Company" value={newEnquiry.companyName} onChange={(e) => setNewEnquiry({ ...newEnquiry, companyName: e.target.value })} required />
              <Input label="Phone" value={newEnquiry.phone} onChange={(e) => setNewEnquiry({ ...newEnquiry, phone: e.target.value })} required />
              <Input label="Email" type="email" value={newEnquiry.email} onChange={(e) => setNewEnquiry({ ...newEnquiry, email: e.target.value })} required />
              <div className="md:col-span-2 flex gap-3">
                <Button type="submit" variant="primary">Submit</Button>
                <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </form>
          </Card>
        )}

        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Name</th><th className="text-left py-3 px-4 text-gray-500 font-medium">Company</th><th className="text-left py-3 px-4 text-gray-500 font-medium">Type</th><th className="text-left py-3 px-4 text-gray-500 font-medium">Status</th><th className="text-left py-3 px-4 text-gray-500 font-medium">Priority</th><th className="text-left py-3 px-4 text-gray-500 font-medium">Score</th><th className="text-left py-3 px-4 text-gray-500 font-medium">Date</th><th className="text-left py-3 px-4 text-gray-500 font-medium">Actions</th>
              </tr></thead>
              <tbody>
                {enquiries.map((e: any) => (
                  <tr key={e.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-900">{e.fullName}</td>
                    <td className="py-3 px-4 text-gray-600">{e.companyName}</td>
                    <td className="py-3 px-4 text-gray-500 text-xs capitalize">{(e.enquiryType || '').replace(/_/g, ' ')}</td>
                    <td className="py-3 px-4"><Badge variant={e.status === 'won' ? 'success' : e.status === 'lost' ? 'error' : 'info'}>{(e.status || 'new').replace(/_/g, ' ')}</Badge></td>
                    <td className="py-3 px-4"><Badge variant={e.priority === 'urgent' ? 'error' : e.priority === 'high' ? 'warning' : 'default'}>{e.priority}</Badge></td>
                    <td className="py-3 px-4 text-gray-700">{e.leadScore}</td>
                    <td className="py-3 px-4 text-gray-500 text-xs">{e.createdAt?.toDate ? formatDate(e.createdAt.toDate()) : ''}</td>
                    <td className="py-3 px-4">
                      <select className="text-xs border rounded p-1" value={e.status} onChange={(ev) => handleStatusChange(e.id, ev.target.value)}>
                        {['new', 'contacted', 'qualified', 'proposal_sent', 'negotiating', 'won', 'lost', 'archived'].map((s) => (
                          <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {enquiries.length === 0 && <div className="text-center py-12 text-gray-500">No enquiries yet. Click "+ New Enquiry" to start.</div>}
        </Card>
      </div>
    </div>
  );
}
