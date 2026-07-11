import { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

interface Lead {
  id: string;
  fullName: string;
  companyName: string;
  phone: string;
  email: string;
  enquiryType: string;
  status: 'new' | 'contacted' | 'qualified' | 'proposal_sent' | 'negotiating' | 'won' | 'lost' | 'archived';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  source: string;
  leadScore: number;
  createdAt: string;
}

const dummyLeads: Lead[] = [
  { id: '1', fullName: 'Farai Moyo', companyName: 'MiningCo Ltd', phone: '+263 77 111 2222', email: 'farai@miningco.co.zw', enquiryType: 'quotation_request', status: 'new', priority: 'high', source: 'website', leadScore: 75, createdAt: '2026-07-11' },
  { id: '2', fullName: 'Tendai Dube', companyName: 'Bulawayo Drillers', phone: '+263 77 333 4444', email: 'tendai@bdrillers.co.zw', enquiryType: 'consultation_booking', status: 'contacted', priority: 'medium', source: 'referral', leadScore: 60, createdAt: '2026-07-10' },
  { id: '3', fullName: 'Simba Ncube', companyName: 'Ncube Holdings', phone: '+263 77 555 6666', email: 'simba@nholdings.co.zw', enquiryType: 'project_brief', status: 'qualified', priority: 'urgent', source: 'direct', leadScore: 90, createdAt: '2026-07-09' },
  { id: '4', fullName: 'Rutendo Chikosi', companyName: 'Gold Fields ZW', phone: '+263 77 777 8888', email: 'rutendo@gfields.co.zw', enquiryType: 'quotation_request', status: 'new', priority: 'low', source: 'google', leadScore: 45, createdAt: '2026-07-08' },
  { id: '5', fullName: 'Tafadzwa Zhou', companyName: 'Zhou Mining', phone: '+263 77 999 0000', email: 'tf@zhoumining.co.zw', enquiryType: 'training_enrollment', status: 'new', priority: 'medium', source: 'facebook', leadScore: 55, createdAt: '2026-07-11' },
];

const statusColors: Record<string, string> = {
  new: 'bg-blue-100 text-blue-800',
  contacted: 'bg-purple-100 text-purple-800',
  qualified: 'bg-yellow-100 text-yellow-800',
  proposal_sent: 'bg-indigo-100 text-indigo-800',
  negotiating: 'bg-orange-100 text-orange-800',
  won: 'bg-green-100 text-green-800',
  lost: 'bg-red-100 text-red-800',
  archived: 'bg-gray-100 text-gray-800',
};

const priorityColors: Record<string, string> = {
  low: 'bg-gray-100 text-gray-700',
  medium: 'bg-blue-100 text-blue-700',
  high: 'bg-orange-100 text-orange-700',
  urgent: 'bg-red-100 text-red-700',
};

export default function Leads() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [leads] = useState<Lead[]>(dummyLeads);

  const filtered = leads.filter((l) => {
    if (statusFilter !== 'all' && l.status !== statusFilter) return false;
    if (search && !l.fullName.toLowerCase().includes(search.toLowerCase()) && !l.companyName.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
          <p className="text-gray-500 mt-1">{leads.length} total leads</p>
        </div>
        <Button variant="primary">+ New Lead</Button>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <Input
          placeholder="Search leads..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <div className="flex flex-wrap gap-2">
          {['all', 'new', 'contacted', 'qualified', 'won', 'lost'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                statusFilter === s
                  ? 'bg-primary-500 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {s === 'all' ? 'All' : s.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
            </button>
          ))}
        </div>
      </div>

      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Name</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Company</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Type</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Status</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Priority</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Source</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Score</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((lead) => (
                <tr key={lead.id} className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer">
                  <td className="py-3 px-4">
                    <span className="font-medium text-gray-900">{lead.fullName}</span>
                    <span className="block text-xs text-gray-400">{lead.email}</span>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{lead.companyName}</td>
                  <td className="py-3 px-4 text-gray-500 capitalize text-xs">{lead.enquiryType.replace(/_/g, ' ')}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex px-2 py-0.5 text-xs rounded-full ${statusColors[lead.status]}`}>
                      {lead.status.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex px-2 py-0.5 text-xs rounded-full ${priorityColors[lead.priority]}`}>
                      {lead.priority.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-500 capitalize">{lead.source}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-200 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full ${lead.leadScore >= 70 ? 'bg-green-500' : lead.leadScore >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                          style={{ width: `${lead.leadScore}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500">{lead.leadScore}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-500 text-xs">{lead.createdAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-500">No leads found.</div>
        )}
      </Card>
    </div>
  );
}
