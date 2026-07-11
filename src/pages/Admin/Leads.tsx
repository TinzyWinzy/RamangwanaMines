import { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { cn } from '../../lib/utils';

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
  value: number;
  lastContact: string;
  notes: string;
}

const pipelineStages = [
  { key: 'new', label: 'New', color: 'border-blue-300 bg-blue-50' },
  { key: 'contacted', label: 'Contacted', color: 'border-purple-300 bg-purple-50' },
  { key: 'qualified', label: 'Qualified', color: 'border-yellow-300 bg-yellow-50' },
  { key: 'proposal_sent', label: 'Proposal', color: 'border-indigo-300 bg-indigo-50' },
  { key: 'negotiating', label: 'Negotiating', color: 'border-orange-300 bg-orange-50' },
  { key: 'won', label: 'Won', color: 'border-green-300 bg-green-50' },
  { key: 'lost', label: 'Lost', color: 'border-red-300 bg-red-50' },
];

const dummyLeads: Lead[] = [
  { id: '1', fullName: 'Farai Moyo', companyName: 'MiningCo Ltd', phone: '+263 77 111 2222', email: 'farai@miningco.co.zw', enquiryType: 'quotation_request', status: 'new', priority: 'high', source: 'website', leadScore: 87, value: 8500, lastContact: '2 hours ago', notes: 'Needs borehole + solar pump. Documents uploaded.' },
  { id: '2', fullName: 'Tendai Dube', companyName: 'Bulawayo Drillers', phone: '+263 77 333 4444', email: 'tendai@bdrillers.co.zw', enquiryType: 'consultation_booking', status: 'contacted', priority: 'medium', source: 'referral', leadScore: 60, value: 15000, lastContact: '5 hours ago', notes: 'Site visit scheduled for Friday.' },
  { id: '3', fullName: 'Simba Ncube', companyName: 'Ncube Holdings', phone: '+263 77 555 6666', email: 'simba@nholdings.co.zw', enquiryType: 'project_brief', status: 'qualified', priority: 'urgent', source: 'direct', leadScore: 92, value: 48000, lastContact: '1 day ago', notes: 'Headgear fabrication. Urgent timeline.' },
  { id: '4', fullName: 'Rutendo Chikosi', companyName: 'Gold Fields ZW', phone: '+263 77 777 8888', email: 'rutendo@gfields.co.zw', enquiryType: 'quotation_request', status: 'proposal_sent', priority: 'high', source: 'google', leadScore: 75, value: 32000, lastContact: '2 days ago', notes: 'Proposal sent. Awaiting board review.' },
  { id: '5', fullName: 'Tafadzwa Zhou', companyName: 'Zhou Mining', phone: '+263 77 999 0000', email: 'tf@zhoumining.co.zw', enquiryType: 'training_enrollment', status: 'negotiating', priority: 'medium', source: 'facebook', leadScore: 55, value: 1200, lastContact: '3 days ago', notes: '5 trainees for blasting cert. Price discussion.' },
  { id: '6', fullName: 'Chipo Moyo', companyName: 'Mazowe Resources', phone: '+263 77 888 1111', email: 'chipo@mazoweres.co.zw', enquiryType: 'quotation_request', status: 'won', priority: 'medium', source: 'referral', leadScore: 82, value: 24500, lastContact: '1 week ago', notes: 'Closed. Shaft rehab project started.' },
  { id: '7', fullName: 'Blessing Dube', companyName: 'Mutare Miners', phone: '+263 77 444 5555', email: 'blessing@mutaremines.co.zw', enquiryType: 'general_inquiry', status: 'lost', priority: 'low', source: 'website', leadScore: 25, value: 0, lastContact: '2 weeks ago', notes: 'Chose competitor. Price-sensitive.' },
  { id: '8', fullName: 'Patience Ndlovu', companyName: 'Gwanda Gold', phone: '+263 77 222 3333', email: 'patience@gwandagold.co.zw', enquiryType: 'quotation_request', status: 'new', priority: 'high', source: 'google', leadScore: 78, value: 6200, lastContact: '3 hours ago', notes: 'Exploration survey for new claim.' },
];

const priorityStyles: Record<string, string> = {
  low: 'bg-gray-100 text-gray-600',
  medium: 'bg-blue-50 text-blue-700',
  high: 'bg-orange-50 text-orange-700',
  urgent: 'bg-red-50 text-red-700',
};

export default function LeadsCRM() {
  const [viewMode, setViewMode] = useState<'table' | 'pipeline'>('pipeline');
  const [search, setSearch] = useState('');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [leads] = useState<Lead[]>(dummyLeads);

  const filtered = leads.filter((l) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return l.fullName.toLowerCase().includes(s) || l.companyName.toLowerCase().includes(s);
  });

  const pipelineTotals = pipelineStages.map((stage) => ({
    ...stage,
    count: filtered.filter((l) => l.status === stage.key).length,
    totalValue: filtered.filter((l) => l.status === stage.key).reduce((sum, l) => sum + l.value, 0),
  }));

  const totalPipeline = pipelineTotals.reduce((sum, s) => sum + s.totalValue, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lead Pipeline</h1>
          <p className="text-gray-500 mt-1">{filtered.length} leads &middot; ${totalPipeline.toLocaleString()} pipeline value</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('pipeline')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${viewMode === 'pipeline' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}
            >
              Pipeline
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${viewMode === 'table' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}
            >
              Table
            </button>
          </div>
          <Button variant="primary">+ Add Lead</Button>
        </div>
      </div>

      <div className="mb-6">
        <Input placeholder="Search leads..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-sm" />
      </div>

      {viewMode === 'pipeline' ? (
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-4 min-w-[1200px]">
            {pipelineStages.map((stage) => {
              const stageLeads = filtered.filter((l) => l.status === stage.key);
              return (
                <div key={stage.key} className="flex-1 min-w-[220px]">
                  <div className={cn('rounded-t-xl px-3 py-2 border-2 border-b-0', stage.color)}>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm">{stage.label}</span>
                      <span className="text-xs font-bold">{stageLeads.length}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      ${stageLeads.reduce((sum, l) => sum + l.value, 0).toLocaleString()}
                    </div>
                  </div>
                  <div className={cn('rounded-b-xl border-2 border-t-0 p-2 space-y-2 min-h-[200px]', stage.color)}>
                    {stageLeads.map((lead) => (
                      <div
                        key={lead.id}
                        onClick={() => setSelectedLead(lead)}
                        className="bg-white rounded-lg p-3 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-sm text-gray-900">{lead.fullName}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded ${priorityStyles[lead.priority]}`}>
                            {lead.priority}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">{lead.companyName}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs font-semibold text-primary-500">${lead.value.toLocaleString()}</span>
                          <div className="flex items-center gap-1">
                            <div className="w-12 bg-gray-200 rounded-full h-1">
                              <div
                                className={`h-1 rounded-full ${lead.leadScore >= 70 ? 'bg-green-500' : lead.leadScore >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                style={{ width: `${lead.leadScore}%` }}
                              />
                            </div>
                            <span className="text-[10px] text-gray-400">{lead.leadScore}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Name</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Company</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Value</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Status</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Priority</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Score</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Last Contact</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((lead) => (
                  <tr key={lead.id} className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedLead(lead)}>
                    <td className="py-3 px-4 font-medium text-gray-900">{lead.fullName}</td>
                    <td className="py-3 px-4 text-gray-600">{lead.companyName}</td>
                    <td className="py-3 px-4 font-medium">${lead.value.toLocaleString()}</td>
                    <td className="py-3 px-4"><Badge>{lead.status.replace('_', ' ')}</Badge></td>
                    <td className="py-3 px-4">
                      <span className={`text-xs px-2 py-0.5 rounded ${priorityStyles[lead.priority]}`}>
                        {lead.priority.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-700">{lead.leadScore}</td>
                    <td className="py-3 px-4 text-gray-500 text-xs">{lead.lastContact}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Modal isOpen={!!selectedLead} onClose={() => setSelectedLead(null)} title="Lead Details" size="lg">
        {selectedLead && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500">Name</label>
                <p className="font-semibold">{selectedLead.fullName}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500">Company</label>
                <p className="font-semibold">{selectedLead.companyName}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500">Phone</label>
                <p className="text-sm">{selectedLead.phone}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500">Email</label>
                <p className="text-sm">{selectedLead.email}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500">Value</label>
                <p className="font-semibold text-primary-500">${selectedLead.value.toLocaleString()}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500">Source</label>
                <p className="text-sm capitalize">{selectedLead.source}</p>
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500">Notes</label>
              <p className="text-sm mt-1 bg-gray-50 rounded-lg p-3">{selectedLead.notes}</p>
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="primary" size="sm">Assign</Button>
              <Button variant="outline" size="sm">Create Quote</Button>
              <Button variant="ghost" size="sm">Add Activity</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
