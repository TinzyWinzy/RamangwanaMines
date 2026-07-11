import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

const pages = [
  { slug: 'about', title: 'About Us', status: 'published', updatedAt: '2026-07-01' },
  { slug: 'careers', title: 'Careers', status: 'draft', updatedAt: '2026-06-28' },
  { slug: 'privacy', title: 'Privacy Policy', status: 'published', updatedAt: '2026-06-15' },
  { slug: 'terms', title: 'Terms & Conditions', status: 'published', updatedAt: '2026-06-15' },
];

export default function CMS() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">CMS Pages</h1>
          <p className="text-gray-500 mt-1">{pages.length} pages</p>
        </div>
        <Button variant="primary">+ New Page</Button>
      </div>

      <div className="grid gap-4">
        {pages.map((page) => (
          <Card key={page.slug} padding="md" className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-gray-900">{page.title}</h4>
              <p className="text-xs text-gray-500">/{page.slug}</p>
            </div>
            <div className="flex items-center gap-4">
              <span className={`text-xs px-2 py-1 rounded-full ${
                page.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
              }`}>
                {page.status}
              </span>
              <span className="text-xs text-gray-400">{page.updatedAt}</span>
              <Button variant="ghost" size="sm">Edit</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
