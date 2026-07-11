import { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Textarea } from '../components/ui/Textarea';

interface DocFile {
  id: string;
  filename: string;
  uploadedBy: string;
  uploadedAt: string;
  version: number;
  status: 'pending_review' | 'approved' | 'revision_requested';
  notes?: string;
}

const demoDocs: DocFile[] = [
  { id: '1', filename: 'Geological_Report_Mazowe_v3.pdf', uploadedBy: 'Tafadzwa M.', uploadedAt: '2026-07-11 14:30', version: 3, status: 'approved' },
  { id: '2', filename: 'Shaft_Structural_Inspection_Jul2026.pdf', uploadedBy: 'Farai C.', uploadedAt: '2026-07-10 09:15', version: 1, status: 'pending_review' },
  { id: '3', filename: 'Borehole_Log_Farm47_Daily.xlsx', uploadedBy: 'Simba N.', uploadedAt: '2026-07-09 16:45', version: 5, status: 'approved' },
  { id: '4', filename: 'Safety_Audit_Q3_Draft.docx', uploadedBy: 'Rutendo C.', uploadedAt: '2026-07-08 11:00', version: 2, status: 'revision_requested', notes: 'Please add incident stats for June' },
  { id: '5', filename: 'Budget_Revision_Headgear.pdf', uploadedBy: 'Tendai D.', uploadedAt: '2026-07-07 08:20', version: 1, status: 'pending_review' },
];

const statusStyles: Record<string, string> = {
  pending_review: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  revision_requested: 'bg-red-100 text-red-800',
};

const statusLabels: Record<string, string> = {
  pending_review: 'Pending Review',
  approved: 'Approved',
  revision_requested: 'Revision Needed',
};

export default function DocumentApproval() {
  const [docs, setDocs] = useState<DocFile[]>(demoDocs);
  const [selectedDoc, setSelectedDoc] = useState<DocFile | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [filter, setFilter] = useState('all');

  const openReview = (doc: DocFile) => {
    setSelectedDoc(doc);
    setReviewNotes('');
    setIsReviewOpen(true);
  };

  const submitReview = (action: 'approved' | 'revision_requested') => {
    if (!selectedDoc) return;
    setDocs(docs.map((d) => (d.id === selectedDoc.id ? { ...d, status: action, notes: reviewNotes || undefined } : d)));
    setIsReviewOpen(false);
    setSelectedDoc(null);
  };

  const filtered = filter === 'all' ? docs : docs.filter((d) => d.status === filter);

  return (
    <div className="py-16 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Document Control</h1>
            <p className="text-gray-500 text-sm">{docs.length} documents &middot; {docs.filter((d) => d.status === 'pending_review').length} pending review</p>
          </div>
          <Button variant="primary">+ Upload Document</Button>
        </div>

        <div className="flex gap-2 mb-6">
          {[
            { value: 'all', label: 'All' },
            { value: 'pending_review', label: 'Pending' },
            { value: 'approved', label: 'Approved' },
            { value: 'revision_requested', label: 'Needs Revision' },
          ].map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filter === f.value ? 'bg-primary-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {filtered.map((doc) => (
            <Card key={doc.id} padding="md" className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">{doc.filename}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                    <span>v{doc.version}</span>
                    <span>&middot;</span>
                    <span>{doc.uploadedBy}</span>
                    <span>&middot;</span>
                    <span>{doc.uploadedAt}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge>{statusLabels[doc.status]}</Badge>
                {doc.status === 'pending_review' && (
                  <Button variant="primary" size="sm" onClick={() => openReview(doc)}>Review</Button>
                )}
                {doc.status === 'revision_requested' && doc.notes && (
                  <span className="text-xs text-red-600 max-w-[150px] truncate hidden md:block">{doc.notes}</span>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>

      <Modal isOpen={isReviewOpen} onClose={() => setIsReviewOpen(false)} title="Document Review" size="md">
        {selectedDoc && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="font-medium text-gray-900">{selectedDoc.filename}</p>
              <p className="text-xs text-gray-500 mt-1">Version {selectedDoc.version} &middot; Uploaded by {selectedDoc.uploadedBy}</p>
            </div>
            <Textarea
              label="Review Notes"
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              placeholder="Add approval notes or revision requirements..."
              rows={3}
            />
            <div className="flex gap-3 pt-2">
              <Button variant="primary" onClick={() => submitReview('approved')}>
                Approve
              </Button>
              <Button variant="danger" onClick={() => submitReview('revision_requested')}>
                Request Revision
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
