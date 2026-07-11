import { Card } from '../../components/ui/Card';

export default function Analytics() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
      <p className="text-gray-500 mt-1">Performance metrics and reporting</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <Card padding="lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Lead Conversion</h3>
          <div className="space-y-3">
            {[
              { label: 'New Leads', value: 156, color: 'bg-blue-500' },
              { label: 'Contacted', value: 98, color: 'bg-purple-500' },
              { label: 'Qualified', value: 62, color: 'bg-yellow-500' },
              { label: 'Proposals Sent', value: 38, color: 'bg-indigo-500' },
              { label: 'Won', value: 24, color: 'bg-green-500' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${item.color}`} />
                <span className="flex-1 text-sm text-gray-600">{item.label}</span>
                <span className="text-sm font-semibold text-gray-900">{item.value}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card padding="lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Overview</h3>
          <div className="space-y-3">
            {[
              { label: 'Total Invoiced', value: '$487,250' },
              { label: 'Total Paid', value: '$312,800' },
              { label: 'Outstanding', value: '$174,450' },
              { label: 'Avg. Deal Size', value: '$20,302' },
              { label: 'Win Rate', value: '38.7%' },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between py-2 border-b border-gray-50">
                <span className="text-sm text-gray-600">{item.label}</span>
                <span className="text-sm font-semibold text-gray-900">{item.value}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card padding="lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Lead Sources</h3>
          <div className="space-y-3">
            {[
              { label: 'Website', value: 45, percent: '29%' },
              { label: 'Referral', value: 38, percent: '24%' },
              { label: 'Direct', value: 32, percent: '21%' },
              { label: 'Facebook', value: 24, percent: '15%' },
              { label: 'Google', value: 17, percent: '11%' },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-600">{item.label}</span>
                  <span className="text-sm text-gray-500">{item.percent}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <div className="bg-primary-500 h-1.5 rounded-full" style={{ width: item.percent }} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card padding="lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Services</h3>
          <div className="space-y-3">
            {[
              { label: 'Drilling Services', value: '$156,000' },
              { label: 'Fabrication', value: '$124,500' },
              { label: 'Project Management', value: '$98,200' },
              { label: 'Consultancy', value: '$62,300' },
              { label: 'Training', value: '$46,250' },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between py-2 border-b border-gray-50">
                <span className="text-sm text-gray-600">{item.label}</span>
                <span className="text-sm font-semibold text-gray-900">{item.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
