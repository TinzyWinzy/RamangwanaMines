import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

const courseAdmin = [
  { id: '1', title: 'Mine Blasting Certification', batches: 3, enrollments: 35, revenue: 17500, status: 'active' },
  { id: '2', title: 'Grade Control & Sampling', batches: 1, enrollments: 18, revenue: 5400, status: 'active' },
  { id: '3', title: 'Shaft Safety & Rescue', batches: 2, enrollments: 12, revenue: 4800, status: 'active' },
  { id: '4', title: 'Equipment Operation', batches: 1, enrollments: 8, revenue: 6400, status: 'active' },
  { id: '5', title: 'Mining Project Management', batches: 1, enrollments: 22, revenue: 13200, status: 'active' },
];

export default function TrainingAdmin() {
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
          { label: 'Total Courses', value: '5' },
          { label: 'Active Batches', value: '8' },
          { label: 'Total Enrollments', value: '95' },
          { label: 'Total Revenue', value: '$47,300' },
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
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Batches</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Enrollments</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Revenue</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Status</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {courseAdmin.map((c) => (
                <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-gray-900">{c.title}</td>
                  <td className="py-3 px-4 text-gray-600">{c.batches}</td>
                  <td className="py-3 px-4 text-gray-600">{c.enrollments}</td>
                  <td className="py-3 px-4 font-medium text-gray-900">${c.revenue.toLocaleString()}</td>
                  <td className="py-3 px-4"><Badge variant="success">{c.status}</Badge></td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">Edit</Button>
                      <Button variant="ghost" size="sm">Batches</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
