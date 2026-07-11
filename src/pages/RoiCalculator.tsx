import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Select } from '../components/ui/Select';
import { Input } from '../components/ui/Input';
import { formatCurrency } from '../lib/utils';

interface ROIPackage {
  name: string;
  price: number;
  includes: string[];
  yield: string;
  payback: number;
  bestFor: string;
}

function calculateROI(hectares: number, mineral: string, budget: string): ROIPackage & { match: number } | null {
  const packages: (ROIPackage & { match: number })[] = [
    {
      name: 'Remote Sensing Package',
      price: 500,
      includes: ['Satellite imagery analysis', 'Preliminary geological mapping', 'Desktop mineral assessment', 'PDF summary report'],
      yield: mineral === 'Gold' ? '1-3 g/t potential' : mineral === 'Chrome' ? '15-25% Cr2O3 potential' : '2-4 g/t potential',
      payback: 6,
      bestFor: 'Early-stage prospecting or land assessment',
      match: hectares <= 20 || budget === '<$5K' ? 95 : 40,
    },
    {
      name: 'Exploration Survey Package',
      price: 1500,
      includes: ['On-site geological survey', 'Soil & rock sampling (20+ points)', 'Geochemical analysis', '3D terrain modeling', 'Mining method recommendation'],
      yield: mineral === 'Gold' ? '3-6 g/t potential' : mineral === 'Chrome' ? '20-35% Cr2O3 potential' : '3-5 g/t potential',
      payback: 12,
      bestFor: 'Medium-scale exploration with confirmed mineral presence',
      match: (hectares > 10 && hectares <= 100) || budget === '$5K-$20K' ? 92 : 55,
    },
    {
      name: 'Full Scope Mining Assessment',
      price: 5000,
      includes: ['Comprehensive geological survey', 'Drilling program (5+ boreholes)', 'Full geochemical + geophysical analysis', 'Resource estimation report', 'Feasibility study', 'Mine design recommendations', 'Environmental impact pre-assessment'],
      yield: mineral === 'Gold' ? '4-8 g/t proven' : mineral === 'Chrome' ? '25-40% Cr2O3 proven' : '4-7 g/t proven',
      payback: 18,
      bestFor: 'Large-scale mining development and investment decisions',
      match: hectares > 50 || budget === '$20K-$50K' || budget === '$50K+' ? 94 : 50,
    },
    {
      name: 'AKS Exploration + Drilling',
      price: 3500,
      includes: ['Advanced AKS ground exploration', 'Core drilling (3+ boreholes)', 'Detailed mineral grade analysis', '3D resource block model', 'Mine plan draft', 'Investment-grade report'],
      yield: mineral === 'Gold' ? '5-9 g/t confirmed' : mineral === 'Chrome' ? '30-45% Cr2O3 confirmed' : '5-8 g/t confirmed',
      payback: 15,
      bestFor: 'Investors seeking proven reserves before commitment',
      match: (hectares > 20 && hectares <= 200) || budget === '$20K-$50K' ? 90 : 60,
    },
  ];

  const sorted = packages.sort((a, b) => b.match - a.match);
  return sorted[0] || null;
}

export default function RoiCalculator() {
  const [step, setStep] = useState(1);
  const [hectares, setHectares] = useState('');
  const [mineral, setMineral] = useState('Gold');
  const [budget, setBudget] = useState('');
  const [result, setResult] = useState<ROIPackage | null>(null);
  const [email, setEmail] = useState('');

  const handleCalculate = () => {
    const hectaresNum = parseFloat(hectares) || 10;
    const rec = calculateROI(hectaresNum, mineral, budget);
    if (rec) {
      const { match, ...pkg } = rec;
      setResult(pkg);
    }
    setStep(3);
  };

  const reset = () => {
    setStep(1);
    setHectares('');
    setMineral('Gold');
    setBudget('');
    setResult(null);
    setEmail('');
  };

  return (
    <div className="py-16 bg-gray-50 min-h-screen">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h1 className="section-title">Mining ROI Calculator</h1>
          <p className="section-subtitle">Find the right exploration package for your property in 60 seconds</p>
        </div>

        <div className="flex justify-center mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                s === step ? 'bg-primary-500 text-white' : s < step ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                {s < step ? '\u2713' : s}
              </div>
              {s < 3 && <div className={`w-12 h-1 ${s < step ? 'bg-green-500' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>

        <Card padding="lg">
          {step === 1 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Property Details</h3>
              <Input
                label="Property Size (hectares)"
                type="number"
                value={hectares}
                onChange={(e) => setHectares(e.target.value)}
                placeholder="e.g. 50"
              />
              <Select
                label="Target Mineral"
                value={mineral}
                onChange={(e) => setMineral(e.target.value)}
                options={[
                  { value: 'Gold', label: 'Gold' },
                  { value: 'Chrome', label: 'Chrome' },
                  { value: 'Platinum', label: 'Platinum' },
                  { value: 'Copper', label: 'Copper' },
                  { value: 'Diamond', label: 'Diamond' },
                ]}
              />
              <div className="pt-4 flex justify-end">
                <Button variant="primary" onClick={() => setStep(2)} disabled={!hectares}>
                  Continue
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Your Budget</h3>
              <div className="grid gap-3">
                {[
                  { value: '<$5K', label: 'Below $5,000', desc: 'Quick assessment' },
                  { value: '$5K-$20K', label: '$5,000 - $20,000', desc: 'Standard exploration' },
                  { value: '$20K-$50K', label: '$20,000 - $50,000', desc: 'Comprehensive analysis' },
                  { value: '$50K+', label: '$50,000+', desc: 'Full-scale development' },
                ].map((opt) => (
                  <label
                    key={opt.value}
                    className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                      budget === opt.value ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="budget"
                      value={opt.value}
                      checked={budget === opt.value}
                      onChange={(e) => setBudget(e.target.value)}
                      className="text-primary-500 mr-3"
                    />
                    <div>
                      <span className="font-medium text-gray-900">{opt.label}</span>
                      <span className="text-sm text-gray-500 ml-2">{opt.desc}</span>
                    </div>
                  </label>
                ))}
              </div>
              <div className="pt-4 flex justify-between">
                <Button variant="ghost" onClick={() => setStep(1)}>Back</Button>
                <Button variant="accent" onClick={handleCalculate} disabled={!budget}>
                  Calculate My ROI
                </Button>
              </div>
            </div>
          )}

          {step === 3 && result && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto bg-green-50 rounded-full flex items-center justify-center mb-3">
                  <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900">Your Recommended Package</h3>
              </div>

              <div className="bg-primary-50 border border-primary-200 rounded-xl p-6">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-lg font-bold text-primary-700">{result.name}</h4>
                  <span className="text-2xl font-bold text-primary-500">{formatCurrency(result.price)}</span>
                </div>
                <p className="text-sm text-gray-600 mb-4">Best for: {result.bestFor}</p>
                <div className="space-y-2">
                  {result.includes.map((item) => (
                    <div key={item} className="flex items-center gap-2 text-sm text-gray-700">
                      <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {item}
                    </div>
                  ))}
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="bg-white rounded-lg p-3 text-center">
                    <div className="text-xs text-gray-500">Expected Yield</div>
                    <div className="font-semibold text-gray-900">{result.yield}</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 text-center">
                    <div className="text-xs text-gray-500">Est. Payback</div>
                    <div className="font-semibold text-gray-900">{result.payback} months</div>
                  </div>
                </div>
              </div>

              <Input
                label="Email this report to"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
              />

              <div className="flex flex-wrap gap-3 pt-2">
                <Link to={`/lead-form?service=exploration&package=${encodeURIComponent(result.name)}`}>
                  <Button variant="primary">Get Quote</Button>
                </Link>
                <Button variant="outline" onClick={() => alert('Report emailed!')} disabled={!email}>
                  Email Report
                </Button>
                <Button variant="ghost" onClick={reset}>Recalculate</Button>
              </div>
            </div>
          )}
        </Card>

        <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center text-sm text-gray-500">
          {[
            { value: '150+', label: 'Projects Done' },
            { value: '50+', label: 'Hectares Surveyed' },
            { value: '12+', label: 'Years Experience' },
            { value: '24h', label: 'Response Time' },
          ].map((s) => (
            <div key={s.label}>
              <div className="text-2xl font-bold text-gray-700">{s.value}</div>
              <div>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
