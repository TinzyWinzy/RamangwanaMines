import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useFirestoreCollection } from '../../hooks/useFirestore';
import type { CmsPage } from '../../types';
import { useState, useEffect } from 'react';

const fallbackPages: any[] = [
  { id: 'about', slug: 'about', title: 'About Us', isPublished: true, updatedAt: new Date('2026-07-01') },
  { id: 'careers', slug: 'careers', title: 'Careers', isPublished: false, updatedAt: new Date('2026-06-28') },
  { id: 'privacy', slug: 'privacy', title: 'Privacy Policy', isPublished: true, updatedAt: new Date('2026-06-15') },
  { id: 'terms', slug: 'terms', title: 'Terms & Conditions', isPublished: true, updatedAt: new Date('2026-06-15') },
];

export default function CMS() {
  const { data: firestorePages } = useFirestoreCollection<CmsPage>('cmsPages', []);
  const pages = firestorePages.length > 0 ? firestorePages : fallbackPages;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold text-gray-900">CMS Pages</h1><p className="text-gray-500 mt-1">{pages.length} pages</p></div>
        <Button variant="primary">+ New Page</Button>
      </div>
      <div className="grid gap-4">
        {pages.map((page: any) => (
          <Card key={page.id || page.slug} padding="md" className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-gray-900">{page.title}</h4>
              <p className="text-xs text-gray-500">/{page.slug}</p>
            </div>
            <div className="flex items-center gap-4">
              <span className={`text-xs px-2 py-1 rounded-full ${page.isPublished ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                {page.isPublished ? 'published' : 'draft'}
              </span>
              <span className="text-xs text-gray-400">{page.updatedAt?.toDate ? page.updatedAt.toDate().toISOString().split('T')[0] : typeof page.updatedAt === 'string' ? page.updatedAt.split('T')[0] : ''}</span>
              <Button variant="ghost" size="sm">Edit</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
