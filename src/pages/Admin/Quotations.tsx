import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { useFirestoreCollection } from '../../hooks/useFirestore';
import { orderBy } from '../../lib/db';
import { formatCurrency } from '../../lib/utils';

interface Quotation {
  id: string;
  quotationNumber: string;
  enquiryId: string;
  status: string;
  total: number;
  items: any[];
  createdAt: Date;
}

const fallbackQuotes: any[] = [
  { id: 'q1', quotationNumber: 'RMG-2026-0001', enquiryId: 'MiningCo Ltd', items: [{}, {}, {}, {}, {}], total: 12750, status: 'draft' },
  { id: 'q2', quotationNumber: 'RMG-2026-0002', enquiryId: 'Gold Fields ZW', items: [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}], total: 45000, status: 'sent' },
  { id: 'q3', quotationNumber: 'RMG-2026-0003', enquiryId: 'Bulawayo Drillers', items: [{}, {}, {}], total: 8900, status: 'accepted' },
  { id: 'q4', quotationNumber: 'RMG-2026-0004', enquiryId: 'Ncube Holdings', items: [{}, {}, {}, {}, {}, {}, {}, {}], total: 32000, status: 'sent' },
];

const statusColors: Record<string, string> = { draft: 'bg-gray-100 text-gray-800', sent: 'bg-blue-100 text-blue-800', accepted: 'bg-green-100 text-green-800', rejected: 'bg-red-100 text-red-800', expired: 'bg-yellow-100 text-yellow-800' };

export default function Quotations() {
  const { data: firestoreQuotes } = useFirestoreCollection<Quotation>('quotations', [orderBy('createdAt', 'desc')]);
  const quotes = firestoreQuotes.length > 0 ? firestoreQuotes : fallbackQuotes;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold text-gray-900">Quotations</h1><p className="text-gray-500 mt-1">{quotes.length} quotations</p></div>
        <Button variant="primary">+ New Quotation</Button>
      </div>
      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left py-3 px-4 text-gray-500 font-medium">Number</th><th className="text-left py-3 px-4 text-gray-500 font-medium">Client</th><th className="text-left py-3 px-4 text-gray-500 font-medium">Items</th><th className="text-left py-3 px-4 text-gray-500 font-medium">Total</th><th className="text-left py-3 px-4 text-gray-500 font-medium">Status</th>
            </tr></thead>
            <tbody>
              {quotes.map((q: any) => (
                <tr key={q.id} className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer">
                  <td className="py-3 px-4 font-medium text-gray-900">{q.quotationNumber}</td>
                  <td className="py-3 px-4 text-gray-600">{q.enquiryId?.slice(0, 20) || q.client || ''}</td>
                  <td className="py-3 px-4 text-gray-600">{(q.items || []).length}</td>
                  <td className="py-3 px-4 font-medium text-gray-900">{formatCurrency(q.total || 0)}</td>
                  <td className="py-3 px-4"><span className={`inline-flex px-2 py-0.5 text-xs rounded-full ${statusColors[q.status] || ''}`}>{q.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
