import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

const stats = [
  { label: 'New Leads Today', value: '12', change: '+18%', trend: 'up' },
  { label: 'Active Projects', value: '24', change: '+4%', trend: 'up' },
  { label: 'Revenue (MTD)', value: '$87,500', change: '+12%', trend: 'up' },
  { label: 'Pending Quotes', value: '8', change: '-3', trend: 'down' },
];

const recentLeads = [
  { name: 'Farai Moyo', company: 'MiningCo Ltd', status: 'new', priority: 'high', date: '2 hours ago' },
  { name: 'Tendai Dube', company: 'Bulawayo Drillers', status: 'qualified', priority: 'medium', date: '5 hours ago' },
  { name: 'Simba Ncube', company: 'Ncube Holdings', status: 'contacted', priority: 'urgent', date: '1 day ago' },
  { name: 'Rutendo Chikosi', company: 'Gold Fields ZW', status: 'new', priority: 'low', date: '2 days ago' },
];

export default function AdminDashboard() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      <p className="text-gray-500 mt-1">Overview of your mining enterprise operations</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        {stats.map((stat) => (
          <Card key={stat.label} padding="md">
            <p className="text-sm text-gray-500">{stat.label}</p>
            <div className="flex items-end justify-between mt-2">
              <span className="text-2xl font-bold text-gray-900">{stat.value}</span>
              <span className={`text-xs font-medium ${stat.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                {stat.change}
              </span>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-8">
        <Card padding="lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Leads</h3>
            <button className="text-sm text-primary-500 font-medium hover:text-primary-600">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 text-gray-500 font-medium">Name</th>
                  <th className="text-left py-3 text-gray-500 font-medium">Company</th>
                  <th className="text-left py-3 text-gray-500 font-medium">Status</th>
                  <th className="text-left py-3 text-gray-500 font-medium">Priority</th>
                  <th className="text-left py-3 text-gray-500 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentLeads.map((lead) => (
                  <tr key={lead.name} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 font-medium text-gray-900">{lead.name}</td>
                    <td className="py-3 text-gray-600">{lead.company}</td>
                    <td className="py-3">
                      <Badge variant={lead.status === 'new' ? 'info' : lead.status === 'qualified' ? 'success' : 'warning'}>
                        {lead.status}
                      </Badge>
                    </td>
                    <td className="py-3">
                      <Badge variant={lead.priority === 'urgent' ? 'error' : lead.priority === 'high' ? 'warning' : 'default'}>
                        {lead.priority}
                      </Badge>
                    </td>
                    <td className="py-3 text-gray-500">{lead.date}</td>
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
