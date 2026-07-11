import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

const certificates = [
  { id: '1', number: 'RMG-CERT-2026-0001', trainee: 'Farai Moyo', course: 'Mine Blasting Certification', issuedAt: '2026-06-30', status: 'issued' },
  { id: '2', number: 'RMG-CERT-2026-0002', trainee: 'Tendai Dube', course: 'Grade Control & Sampling', issuedAt: '2026-07-05', status: 'issued' },
  { id: '3', number: 'RMG-CERT-2026-0003', trainee: 'Simba Ncube', course: 'Shaft Safety & Rescue', issuedAt: '2026-07-08', status: 'pending' },
];

export default function Certificates() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Certificates</h1>
          <p className="text-gray-500 mt-1">{certificates.length} certificates issued</p>
        </div>
        <Button variant="primary">Issue Certificate</Button>
      </div>

      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Certificate No.</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Trainee</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Course</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Issued Date</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Status</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {certificates.map((cert) => (
                <tr key={cert.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 px-4 font-mono text-gray-900 text-xs">{cert.number}</td>
                  <td className="py-3 px-4 font-medium text-gray-900">{cert.trainee}</td>
                  <td className="py-3 px-4 text-gray-600">{cert.course}</td>
                  <td className="py-3 px-4 text-gray-500">{cert.issuedAt}</td>
                  <td className="py-3 px-4">
                    <Badge variant={cert.status === 'issued' ? 'success' : 'warning'}>
                      {cert.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">View</Button>
                      <Button variant="ghost" size="sm">Download</Button>
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
