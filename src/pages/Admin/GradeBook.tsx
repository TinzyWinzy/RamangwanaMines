import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { useFirestoreCollection } from '../../hooks/useFirestore';
import { orderBy } from '../../lib/db';
import type { TrainingEnrollment, TrainingBatch, TrainingCourse } from '../../types';
import { formatDate } from '../../lib/utils';
import { useState } from 'react';
import { PageSpinner } from '../../components/ui/Spinner';

export default function GradeBook() {
  const { data: enrollments } = useFirestoreCollection<TrainingEnrollment>('trainingEnrollments', [orderBy('updatedAt', 'desc')]);
  const { data: batches } = useFirestoreCollection<TrainingBatch>('trainingBatches', []);
  const { data: courses } = useFirestoreCollection<TrainingCourse>('trainingCourses', []);
  const [selectedBatch, setSelectedBatch] = useState('all');

  const batchOptions = [{ value: 'all', label: 'All Batches' }, ...batches.map((b) => ({ value: b.id, label: b.batchName }))];
  const filtered = selectedBatch === 'all' ? enrollments : enrollments.filter((e) => (e as any).batchId === selectedBatch);

  const passRate = filtered.length > 0 ? Math.round((filtered.filter((e) => (e as any).passed).length / filtered.length) * 100) : 0;
  const avgScore = filtered.length > 0 ? Math.round(filtered.reduce((s, e) => s + ((e as any).finalScore || 0), 0) / filtered.length) : 0;

  return (
    <div className="py-16 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div><h1 className="text-2xl font-bold text-gray-900">Grade Book</h1><p className="text-gray-500 text-sm">{filtered.length} enrollments</p></div>
          <Button variant="outline" size="sm">Export CSV</Button>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          {[{ label: 'Enrollments', value: filtered.length }, { label: 'Pass Rate', value: `${passRate}%` }, { label: 'Avg Score', value: `${avgScore}%` }].map((s) => (
            <Card key={s.label} padding="md"><div className="text-2xl font-bold text-gray-900">{s.value}</div><div className="text-xs text-gray-500 mt-1">{s.label}</div></Card>
          ))}
        </div>

        <div className="flex gap-3 mb-6">
          <Select value={selectedBatch} onChange={(e) => setSelectedBatch(e.target.value)} options={batchOptions} />
        </div>

        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Trainee</th><th className="text-left py-3 px-4 text-gray-500 font-medium">Course</th><th className="text-left py-3 px-4 text-gray-500 font-medium">Batch</th><th className="text-left py-3 px-4 text-gray-500 font-medium">Progress</th><th className="text-left py-3 px-4 text-gray-500 font-medium">Final Score</th><th className="text-left py-3 px-4 text-gray-500 font-medium">Status</th><th className="text-left py-3 px-4 text-gray-500 font-medium">Certificate</th>
              </tr></thead>
              <tbody>
                {filtered.map((e: any) => (
                  <tr key={e.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-600 text-xs">{e.userId?.slice(0, 10)}...</td>
                    <td className="py-3 px-4 text-gray-600 text-xs">{(courses.find((c) => c.id === e.courseId) as any)?.title || e.courseId?.slice(0, 15)}</td>
                    <td className="py-3 px-4 text-gray-600 text-xs">{(batches.find((b) => b.id === e.batchId) as any)?.batchName || '-'}</td>
                    <td className="py-3 px-4"><div className="w-16 bg-gray-200 rounded-full h-1.5"><div className="bg-primary-500 h-1.5 rounded-full" style={{ width: `${e.progress || 0}%` }} /></div></td>
                    <td className="py-3 px-4 font-medium">{e.finalScore ? `${e.finalScore}%` : '-'}</td>
                    <td className="py-3 px-4"><Badge variant={e.passed ? 'success' : e.status === 'completed' ? 'error' : 'info'}>{(e.status || 'enrolled').replace(/_/g, ' ')}</Badge></td>
                    <td className="py-3 px-4">{e.certificateNumber ? <span className="text-green-500 text-xs font-mono">Issued</span> : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
