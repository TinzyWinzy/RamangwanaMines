import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

const consultations = [
  { id: '1', clientName: 'Farai Moyo', company: 'MiningCo Ltd', preferredDate: '2026-07-15', preferredTime: 'Morning', meetingType: 'video_call', status: 'pending' },
  { id: '2', clientName: 'Tendai Dube', company: 'Bulawayo Drillers', preferredDate: '2026-07-18', preferredTime: 'Afternoon', meetingType: 'site_visit', status: 'confirmed' },
  { id: '3', clientName: 'Simba Ncube', company: 'Ncube Holdings', preferredDate: '2026-07-12', preferredTime: 'Any', meetingType: 'office_visit', status: 'completed' },
  { id: '4', clientName: 'Rutendo Chikosi', company: 'Gold Fields ZW', preferredDate: '2026-07-20', preferredTime: 'Morning', meetingType: 'phone_call', status: 'pending' },
];

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-green-100 text-green-800',
  completed: 'bg-blue-100 text-blue-800',
  cancelled: 'bg-red-100 text-red-800',
  no_show: 'bg-gray-100 text-gray-800',
};

export default function Consultations() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Consultations</h1>
          <p className="text-gray-500 mt-1">{consultations.length} bookings</p>
        </div>
      </div>

      <div className="grid gap-4">
        {consultations.map((c) => (
          <Card key={c.id} padding="md" className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h4 className="font-semibold text-gray-900">{c.clientName}</h4>
              <p className="text-sm text-gray-500">{c.company}</p>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-gray-600">
                {new Date(c.preferredDate).toLocaleDateString('en-ZA', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
              <span className="text-gray-600">{c.preferredTime}</span>
              <Badge>{c.meetingType.replace('_', ' ')}</Badge>
              <span className={`inline-flex px-2 py-0.5 text-xs rounded-full ${statusColors[c.status]}`}>
                {c.status}
              </span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
