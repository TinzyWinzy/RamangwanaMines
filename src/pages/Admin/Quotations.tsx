import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

const quotations = [
  { id: '1', number: 'RMG-2026-0001', client: 'MiningCo Ltd', items: 5, total: 12750, status: 'draft', date: '2026-07-10' },
  { id: '2', number: 'RMG-2026-0002', client: 'Gold Fields ZW', items: 12, total: 45000, status: 'sent', date: '2026-07-08' },
  { id: '3', number: 'RMG-2026-0003', client: 'Bulawayo Drillers', items: 3, total: 8900, status: 'accepted', date: '2026-07-05' },
  { id: '4', number: 'RMG-2026-0004', client: 'Ncube Holdings', items: 8, total: 32000, status: 'sent', date: '2026-07-01' },
  { id: '5', number: 'RMG-2026-0005', client: 'Zhou Mining', items: 2, total: 5150, status: 'rejected', date: '2026-06-28' },
];

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-800',
  sent: 'bg-blue-100 text-blue-800',
  accepted: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  expired: 'bg-yellow-100 text-yellow-800',
};

export default function Quotations() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quotations</h1>
          <p className="text-gray-500 mt-1">{quotations.length} quotations</p>
        </div>
        <Button variant="primary">+ New Quotation</Button>
      </div>

      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Number</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Client</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Items</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Total</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Status</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {quotations.map((q) => (
                <tr key={q.id} className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer">
                  <td className="py-3 px-4 font-medium text-gray-900">{q.number}</td>
                  <td className="py-3 px-4 text-gray-600">{q.client}</td>
                  <td className="py-3 px-4 text-gray-600">{q.items}</td>
                  <td className="py-3 px-4 font-medium text-gray-900">${q.total.toLocaleString()}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex px-2 py-0.5 text-xs rounded-full ${statusColors[q.status]}`}>
                      {q.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-500 text-xs">{q.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
