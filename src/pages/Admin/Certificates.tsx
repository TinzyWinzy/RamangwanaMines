import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { useFirestoreCollection } from '../../hooks/useFirestore';
import { orderBy } from '../../lib/db';
import type { TrainingEnrollment } from '../../types';

const fallbackCerts: any[] = [
  { id: 'c1', certificateNumber: 'RMG-CERT-2026-0001', userId: 'Farai Moyo', courseId: 'Mine Blasting Certification', certificateIssuedAt: new Date('2026-06-30') },
  { id: 'c2', certificateNumber: 'RMG-CERT-2026-0002', userId: 'Tendai Dube', courseId: 'Grade Control & Sampling', certificateIssuedAt: new Date('2026-07-05') },
];

export default function Certificates() {
  const { data: firestoreEnrollments } = useFirestoreCollection<TrainingEnrollment>('trainingEnrollments', [orderBy('createdAt', 'desc')]);
  const certs = firestoreEnrollments.filter((e: any) => e.certificateNumber).length > 0
    ? firestoreEnrollments.filter((e: any) => e.certificateNumber)
    : fallbackCerts;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold text-gray-900">Certificates</h1><p className="text-gray-500 mt-1">{certs.length} certificates</p></div>
        <Button variant="primary">Issue Certificate</Button>
      </div>
      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left py-3 px-4 text-gray-500 font-medium">Certificate No.</th><th className="text-left py-3 px-4 text-gray-500 font-medium">Trainee</th><th className="text-left py-3 px-4 text-gray-500 font-medium">Course</th><th className="text-left py-3 px-4 text-gray-500 font-medium">Issued</th><th className="text-left py-3 px-4 text-gray-500 font-medium">Actions</th>
            </tr></thead>
            <tbody>
              {certs.map((cert: any) => (
                <tr key={cert.id || cert.certificateNumber} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 px-4 font-mono text-xs text-gray-900">{cert.certificateNumber}</td>
                  <td className="py-3 px-4 font-medium text-gray-900">{cert.userId || cert.trainee || ''}</td>
                  <td className="py-3 px-4 text-gray-600">{cert.courseId || cert.course || ''}</td>
                  <td className="py-3 px-4 text-gray-500 text-xs">{cert.certificateIssuedAt?.toDate ? cert.certificateIssuedAt.toDate().toISOString().split('T')[0] : cert.issuedAt || ''}</td>
                  <td className="py-3 px-4"><div className="flex gap-2"><Button variant="ghost" size="sm">View</Button><Button variant="ghost" size="sm">Download</Button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
