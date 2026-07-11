import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { useFirestoreCollection } from '../hooks/useFirestore';
import { orderBy } from '../lib/db';
import { formatCurrency, formatDate } from '../lib/utils';
import { PageSpinner } from '../components/ui/Spinner';

interface Inv {
  id: string;
  invoiceNumber: string;
  projectId: string;
  amountUsd: number;
  amountPaid: number;
  status: string;
  dueDate: Date;
  paidAt?: Date;
}

const statusVariant: Record<string, 'success' | 'error' | 'warning' | 'default'> = { paid: 'success', unpaid: 'warning', partial: 'warning', overdue: 'error', cancelled: 'default' };

export default function Invoices() {
  const { data: invoices, isLoading } = useFirestoreCollection<Inv>('invoices', [orderBy('createdAt', 'desc')]);

  const total = invoices.reduce((s, i) => s + i.amountUsd, 0);
  const paid = invoices.filter((i) => i.status === 'paid').reduce((s, i) => s + i.amountPaid, 0);
  const outstanding = total - paid;

  if (isLoading && invoices.length === 0) return <div className="py-32"><PageSpinner /></div>;

  return (
    <div className="py-16 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8"><h1 className="section-title">Invoices</h1><p className="section-subtitle">Track payments and outstanding balances</p></div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          {[{ label: 'Total Invoiced', value: formatCurrency(total), color: 'text-gray-700' }, { label: 'Total Paid', value: formatCurrency(paid), color: 'text-green-500' }, { label: 'Outstanding', value: formatCurrency(outstanding), color: 'text-red-500' }].map((s) => (
            <Card key={s.label} padding="md"><div className={`text-xl font-bold ${s.color}`}>{s.value}</div><div className="text-xs text-gray-500 mt-1">{s.label}</div></Card>
          ))}
        </div>

        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Invoice #</th><th className="text-left py-3 px-4 text-gray-500 font-medium">Project</th><th className="text-left py-3 px-4 text-gray-500 font-medium">Amount</th><th className="text-left py-3 px-4 text-gray-500 font-medium">Paid</th><th className="text-left py-3 px-4 text-gray-500 font-medium">Status</th><th className="text-left py-3 px-4 text-gray-500 font-medium">Due Date</th><th className="text-left py-3 px-4 text-gray-500 font-medium">Action</th>
              </tr></thead>
              <tbody>
                {invoices.map((inv: any) => (
                  <tr key={inv.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 px-4 font-mono text-xs text-gray-900">{inv.invoiceNumber}</td>
                    <td className="py-3 px-4 text-gray-600">{inv.projectId?.slice(0, 8)}...</td>
                    <td className="py-3 px-4 font-medium">{formatCurrency(inv.amountUsd)}</td>
                    <td className="py-3 px-4 text-gray-600">{formatCurrency(inv.amountPaid || 0)}</td>
                    <td className="py-3 px-4"><Badge variant={statusVariant[inv.status] || 'default'}>{inv.status}</Badge></td>
                    <td className="py-3 px-4 text-gray-500 text-xs">{inv.dueDate?.toDate ? formatDate(inv.dueDate.toDate()) : ''}</td>
                    <td className="py-3 px-4">{inv.status !== 'paid' ? <Button variant="primary" size="sm">Pay Now</Button> : <span className="text-green-500 text-xs">Paid</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {invoices.length === 0 && <div className="text-center py-12 text-gray-500">No invoices yet.</div>}
        </Card>
      </div>
    </div>
  );
}
