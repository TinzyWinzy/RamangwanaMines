import { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useFirestoreCollection } from '../hooks/useFirestore';
import { orderBy } from '../lib/db';
import { formatCurrency } from '../lib/utils';
import { PageSpinner } from '../components/ui/Spinner';

interface TradeItem {
  id: string;
  name: string;
  category: string;
  priceUsd: number;
  stock: number;
  imageUrl: string;
  description: string;
}

export default function TradeCenter() {
  const { data: items, isLoading } = useFirestoreCollection<TradeItem>('tradeInventory', [orderBy('name')]);
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');

  const categories = ['All', ...new Set(items.map((i) => i.category))];
  const filtered = items.filter((i) => {
    if (category !== 'All' && i.category !== category) return false;
    if (search && !i.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  if (isLoading && items.length === 0) return <div className="py-32"><PageSpinner /></div>;

  return (
    <div className="py-16 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10"><h1 className="section-title">Trade Center</h1><p className="section-subtitle">Mining equipment, consumables, and supplies — order online</p></div>

        <div className="flex flex-wrap gap-3 mb-6 items-center">
          <Input placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" />
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <button key={c} onClick={() => setCategory(c)} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${category === c ? 'bg-primary-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>{c}</button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((item) => (
            <Card key={item.id} padding="none">
              <div className="relative h-48"><img src={item.imageUrl || '/tradecenter.jpg'} alt={item.name} className="w-full h-full object-cover" /></div>
              <div className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <Badge>{item.category}</Badge>
                  <span className={`text-xs font-medium ${item.stock > 5 ? 'text-green-600' : item.stock > 0 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {item.stock > 5 ? `${item.stock} in stock` : item.stock > 0 ? `Only ${item.stock} left` : 'Out of stock'}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900">{item.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                  <span className="text-xl font-bold text-primary-500">{formatCurrency(item.priceUsd)}</span>
                  <Button variant="primary" size="sm" disabled={item.stock === 0}>Order Now</Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
        {filtered.length === 0 && <div className="text-center py-16 text-gray-500">No products found.</div>}
      </div>
    </div>
  );
}
