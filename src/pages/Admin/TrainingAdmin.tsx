import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { useFirestoreCollection } from '../../hooks/useFirestore';
import { formatCurrency } from '../../lib/utils';
import type { TrainingCourse } from '../../types';

export default function TrainingAdmin() {
  const { data: courses, isLoading } = useFirestoreCollection<TrainingCourse>('trainingCourses');

  const stats = {
    total: courses.length,
    active: courses.filter((c) => c.isActive).length,
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Training Administration</h1>
          <p className="text-gray-500 mt-1">Manage courses, batches, and enrollments</p>
        </div>
        <Button variant="primary">+ New Course</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Courses', value: String(stats.total) },
          { label: 'Active Courses', value: String(stats.active) },
        ].map((s) => (
          <Card key={s.label} padding="md">
            <p className="text-sm text-gray-500">{s.label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{s.value}</p>
          </Card>
        ))}
      </div>

      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Course</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Category</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Duration</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Price</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Seats</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Certification</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Status</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={8} className="py-8 text-center text-gray-400 text-sm">Loading courses...</td></tr>
              ) : courses.length === 0 ? (
                <tr><td colSpan={8} className="py-8 text-center text-gray-400 text-sm">No courses found</td></tr>
              ) : (
                courses.map((c) => (
                  <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-900">{c.title}</td>
                    <td className="py-3 px-4 text-gray-600 capitalize">{c.category}</td>
                    <td className="py-3 px-4 text-gray-600">{c.duration}</td>
                    <td className="py-3 px-4 font-medium text-gray-900">{c.priceUsd === 0 ? 'Free' : formatCurrency(c.priceUsd)}</td>
                    <td className="py-3 px-4 text-gray-600">{c.maxSeats}</td>
                    <td className="py-3 px-4">{c.isCertification ? <Badge variant="success">Yes</Badge> : <span className="text-gray-400">—</span>}</td>
                    <td className="py-3 px-4"><Badge variant={c.isActive ? 'success' : 'error'}>{c.isActive ? 'Active' : 'Inactive'}</Badge></td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">Edit</Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
