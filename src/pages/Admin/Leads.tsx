import { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useFirestoreCollection } from '../../hooks/useFirestore';
import { orderBy, updateDocById, createDoc } from '../../lib/db';
import type { Enquiry } from '../../types';
import { formatDate } from '../../lib/utils';
import { PageSpinner } from '../../components/ui/Spinner';

// Auto-scoring formula — matches what gets applied at lead creation time
function computeLeadScore(lead: Record<string, any>): number {
  let score = 0;
  if (lead.budgetRange === '$50K+') score += 40;
  else if (lead.budgetRange === '$20K-$50K') score += 28;
  else if (lead.budgetRange === '$5K-$20K') score += 15;
  if (lead.timeline === 'Immediate') score += 30;
  else if (lead.timeline === '1-3 months') score += 18;
  if (lead.source === 'referral') score += 20;
  else if (lead.source === 'direct') score += 12;
  if (lead.enquiryType === 'quotation_request') score += 10;
  if (lead.companyName && lead.companyName.length > 2) score += 5;
  return Math.min(score, 100);
}

function ScoreBadge({ score }: { score: number }) {
  const s = score ?? 0;
  if (s >= 70) return (
    <div className="flex items-center gap-1.5">
      <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 font-bold text-xs px-2.5 py-1 rounded-full border border-red-200">
        🔥 {s} HOT
      </span>
    </div>
  );
  if (s >= 40) return (
    <div className="flex items-center gap-1.5">
      <span className="inline-flex items-center gap-1 bg-yellow-50 text-yellow-700 font-bold text-xs px-2.5 py-1 rounded-full border border-yellow-200">
        ⚡ {s} WARM
      </span>
    </div>
  );
  return (
    <div className="flex items-center gap-1.5">
      <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-500 font-bold text-xs px-2.5 py-1 rounded-full border border-gray-200">
        ❄ {s} COLD
      </span>
    </div>
  );
}

const STATUSES = ['new', 'contacted', 'qualified', 'proposal_sent', 'negotiating', 'won', 'lost', 'archived'];

const statusVariant: Record<string, 'success' | 'warning' | 'info' | 'error' | 'default'> = {
  won: 'success', lost: 'error', negotiating: 'warning', proposal_sent: 'info', qualified: 'info', new: 'default', contacted: 'default', archived: 'default',
};

export default function Leads() {
  const { data: enquiries, isLoading } = useFirestoreCollection<Enquiry>('enquiries', [orderBy('createdAt', 'desc')]);
  const [newEnquiry, setNewEnquiry] = useState({ fullName: '', companyName: '', phone: '', email: '', enquiryType: 'general_inquiry', serviceId: '', projectDescription: '', budgetRange: 'Undisclosed', timeline: '', source: 'website' });
  const [showForm, setShowForm] = useState(false);
  const [filterTab, setFilterTab] = useState<'all' | 'hot' | 'active'>('all');
  const [search, setSearch] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const score = computeLeadScore(newEnquiry);
    const priority = score >= 70 ? 'urgent' : score >= 40 ? 'high' : 'medium';
    await createDoc('enquiries', { ...newEnquiry, status: 'new', priority, leadScore: score, documents: [] });
    setShowForm(false);
    setNewEnquiry({ fullName: '', companyName: '', phone: '', email: '', enquiryType: 'general_inquiry', serviceId: '', projectDescription: '', budgetRange: 'Undisclosed', timeline: '', source: 'website' });
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    await updateDocById('enquiries', id, { status: newStatus });
  };

  if (isLoading) return <div className="py-16"><PageSpinner /></div>;

  // Pipeline summary counts
  const pipeline = {
    new: enquiries.filter((e: any) => e.status === 'new').length,
    contacted: enquiries.filter((e: any) => e.status === 'contacted').length,
    qualified: enquiries.filter((e: any) => e.status === 'qualified').length,
    proposal: enquiries.filter((e: any) => e.status === 'proposal_sent').length,
    won: enquiries.filter((e: any) => e.status === 'won').length,
    hot: enquiries.filter((e: any) => (e.leadScore ?? 0) >= 70).length,
  };

  const filtered = enquiries.filter((e: any) => {
    if (filterTab === 'hot' && (e.leadScore ?? 0) < 70) return false;
    if (filterTab === 'active' && (e.status === 'won' || e.status === 'lost' || e.status === 'archived')) return false;
    if (search && !`${e.fullName} ${e.companyName}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leads &amp; Pipeline</h1>
          <p className="text-gray-500 mt-1">{enquiries.length} total · {pipeline.hot} hot leads</p>
        </div>
        <Button variant="primary" onClick={() => setShowForm(true)}>+ New Lead</Button>
      </div>

      {/* Pipeline Summary Bar */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-6">
        {[
          { label: 'New', value: pipeline.new, color: 'bg-gray-100 text-gray-700' },
          { label: 'Contacted', value: pipeline.contacted, color: 'bg-blue-50 text-blue-700' },
          { label: 'Qualified', value: pipeline.qualified, color: 'bg-purple-50 text-purple-700' },
          { label: 'Proposal', value: pipeline.proposal, color: 'bg-yellow-50 text-yellow-700' },
          { label: 'Won', value: pipeline.won, color: 'bg-green-50 text-green-700' },
          { label: '🔥 Hot', value: pipeline.hot, color: 'bg-red-50 text-red-700' },
        ].map((s) => (
          <div key={s.label} className={`${s.color} rounded-xl px-3 py-3 text-center`}>
            <div className="text-2xl font-bold">{s.value}</div>
            <div className="text-xs font-medium mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filter + Search */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        {[{ key: 'all', label: 'All Leads' }, { key: 'hot', label: '🔥 Hot Leads' }, { key: 'active', label: 'Active' }].map((t) => (
          <button
            key={t.key}
            onClick={() => setFilterTab(t.key as any)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${filterTab === t.key ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            {t.label}
          </button>
        ))}
        <input
          type="text"
          placeholder="Search name or company..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="ml-auto border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 w-52"
        />
      </div>

      {showForm && (
        <Card padding="lg" className="mb-6">
          <h3 className="text-lg font-semibold mb-4">New Lead</h3>
          <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
            <Input label="Full Name" value={newEnquiry.fullName} onChange={(e) => setNewEnquiry({ ...newEnquiry, fullName: e.target.value })} required />
            <Input label="Company" value={newEnquiry.companyName} onChange={(e) => setNewEnquiry({ ...newEnquiry, companyName: e.target.value })} required />
            <Input label="Phone" value={newEnquiry.phone} onChange={(e) => setNewEnquiry({ ...newEnquiry, phone: e.target.value })} required />
            <Input label="Email" type="email" value={newEnquiry.email} onChange={(e) => setNewEnquiry({ ...newEnquiry, email: e.target.value })} required />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Budget Range</label>
              <select className="input-field" value={newEnquiry.budgetRange} onChange={(e) => setNewEnquiry({ ...newEnquiry, budgetRange: e.target.value })}>
                {['<$5K', '$5K-$20K', '$20K-$50K', '$50K+', 'Undisclosed'].map((v) => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Timeline</label>
              <select className="input-field" value={newEnquiry.timeline} onChange={(e) => setNewEnquiry({ ...newEnquiry, timeline: e.target.value })}>
                {['', 'Immediate', '1-3 months', '3-6 months', '6+ months'].map((v) => <option key={v} value={v}>{v || 'Select...'}</option>)}
              </select>
            </div>
            <div className="md:col-span-2 flex gap-3">
              <Button type="submit" variant="primary">Submit &amp; Score</Button>
              <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </form>
        </Card>
      )}

      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Name</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Company</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Type</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Status</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Score</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Date</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Move to</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((e: any) => (
                <tr key={e.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4 font-medium text-gray-900">{e.fullName}</td>
                  <td className="py-3 px-4 text-gray-600">{e.companyName}</td>
                  <td className="py-3 px-4 text-gray-500 text-xs capitalize">{(e.enquiryType || '').replace(/_/g, ' ')}</td>
                  <td className="py-3 px-4">
                    <Badge variant={statusVariant[e.status] ?? 'default'}>{(e.status || 'new').replace(/_/g, ' ')}</Badge>
                  </td>
                  <td className="py-3 px-4"><ScoreBadge score={e.leadScore ?? 0} /></td>
                  <td className="py-3 px-4 text-gray-500 text-xs">{e.createdAt?.toDate ? formatDate(e.createdAt.toDate()) : ''}</td>
                  <td className="py-3 px-4">
                    <select className="text-xs border rounded-lg p-1 bg-white focus:outline-none focus:ring-1 focus:ring-primary-500" value={e.status} onChange={(ev) => handleStatusChange(e.id, ev.target.value)}>
                      {STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && <div className="text-center py-12 text-gray-500">No leads match this filter.</div>}
      </Card>
    </div>
  );
}
