import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Select } from '../components/ui/Select';
import { Input } from '../components/ui/Input';
import { formatCurrency } from '../lib/utils';
import { createDoc } from '../lib/db';
import toast from 'react-hot-toast';

interface ROIPackage {
  name: string;
  price: number;
  includes: string[];
  yield: string;
  payback: number;
  bestFor: string;
  revenueMin: number;
  revenueMax: number;
}

const MINERAL_PRICE: Record<string, number> = {
  Gold: 65000,       // $/kg
  Chrome: 180,       // $/tonne
  Platinum: 30000,   // $/kg
  Copper: 9000,      // $/tonne
  Diamond: 4000,     // $/carat avg
};

const GRADE_MULTIPLIER: Record<string, { min: number; max: number; unit: string }> = {
  Gold: { min: 3, max: 8, unit: 'g/t' },
  Chrome: { min: 20, max: 40, unit: '% Cr2O3' },
  Platinum: { min: 2, max: 6, unit: 'g/t' },
  Copper: { min: 0.5, max: 2, unit: '%' },
  Diamond: { min: 0.1, max: 0.5, unit: 'ct/t' },
};

function calculateROI(hectares: number, mineral: string, budget: string): (ROIPackage & { match: number }) | null {
  const gradeData = GRADE_MULTIPLIER[mineral] || GRADE_MULTIPLIER.Gold;
  const mineralPrice = MINERAL_PRICE[mineral] || MINERAL_PRICE.Gold;

  // Rough projected revenue: hectares * avg depth 30m * 2.7t/m³ density * grade * price
  const tonnesPerHectare = 30 * 2.7 * 10000; // 30m deep, 10000 m²/ha
  const gradeMin = gradeData.min / 1000; // convert g/t to kg/t for gold, etc.
  const gradeMax = gradeData.max / 1000;
  const revenueMin = Math.round(hectares * tonnesPerHectare * gradeMin * mineralPrice / 1e6) * 1e6;
  const revenueMax = Math.round(hectares * tonnesPerHectare * gradeMax * mineralPrice / 1e6) * 1e6;

  const packages: (ROIPackage & { match: number })[] = [
    {
      name: 'Remote Sensing Package',
      price: 500,
      includes: ['Satellite imagery analysis', 'Preliminary geological mapping', 'Desktop mineral assessment', 'PDF summary report'],
      yield: mineral === 'Gold' ? '1-3 g/t potential' : mineral === 'Chrome' ? '15-25% Cr2O3 potential' : `${gradeData.min}–${Math.round(gradeData.min * 1.5)} ${gradeData.unit} potential`,
      payback: 6,
      bestFor: 'Early-stage prospecting or land assessment',
      revenueMin: Math.round(revenueMin * 0.1),
      revenueMax: Math.round(revenueMax * 0.1),
      match: hectares <= 20 || budget === '<$5K' ? 95 : 40,
    },
    {
      name: 'Exploration Survey Package',
      price: 1500,
      includes: ['On-site geological survey', 'Soil & rock sampling (20+ points)', 'Geochemical analysis', '3D terrain modeling', 'Mining method recommendation'],
      yield: mineral === 'Gold' ? '3-6 g/t potential' : mineral === 'Chrome' ? '20-35% Cr2O3 potential' : `${gradeData.min}–${gradeData.max} ${gradeData.unit} potential`,
      payback: 12,
      bestFor: 'Medium-scale exploration with confirmed mineral presence',
      revenueMin: Math.round(revenueMin * 0.25),
      revenueMax: Math.round(revenueMax * 0.3),
      match: (hectares > 10 && hectares <= 100) || budget === '$5K-$20K' ? 92 : 55,
    },
    {
      name: 'AKS Exploration + Drilling',
      price: 3500,
      includes: ['Advanced AKS ground exploration', 'Core drilling (3+ boreholes)', 'Detailed mineral grade analysis', '3D resource block model', 'Mine plan draft', 'Investment-grade report'],
      yield: mineral === 'Gold' ? '5-9 g/t confirmed' : mineral === 'Chrome' ? '30-45% Cr2O3 confirmed' : `${gradeData.max - 1}–${gradeData.max + 1} ${gradeData.unit} confirmed`,
      payback: 15,
      bestFor: 'Investors seeking proven reserves before commitment',
      revenueMin: Math.round(revenueMin * 0.4),
      revenueMax: Math.round(revenueMax * 0.5),
      match: (hectares > 20 && hectares <= 200) || budget === '$20K-$50K' ? 90 : 60,
    },
    {
      name: 'Full Scope Mining Assessment',
      price: 5000,
      includes: ['Comprehensive geological survey', 'Drilling program (5+ boreholes)', 'Full geochemical + geophysical analysis', 'Resource estimation report', 'Feasibility study', 'Mine design recommendations', 'Environmental impact pre-assessment'],
      yield: mineral === 'Gold' ? '4-8 g/t proven' : mineral === 'Chrome' ? '25-40% Cr2O3 proven' : `${gradeData.max} ${gradeData.unit} proven`,
      payback: 18,
      bestFor: 'Large-scale mining development and investment decisions',
      revenueMin: Math.round(revenueMin * 0.6),
      revenueMax: Math.round(revenueMax * 0.8),
      match: hectares > 50 || budget === '$20K-$50K' || budget === '$50K+' ? 94 : 50,
    },
  ];

  return packages.sort((a, b) => b.match - a.match)[0] || null;
}

function PaybackBar({ months }: { months: number }) {
  const max = 24;
  const pct = Math.min((months / max) * 100, 100);
  const color = months <= 6 ? 'bg-green-500' : months <= 12 ? 'bg-yellow-500' : 'bg-orange-500';
  return (
    <div>
      <div className="flex justify-between text-xs text-gray-500 mb-1">
        <span>Payback Timeline</span>
        <span className="font-semibold text-gray-700">{months} months</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-3">
        <div className={`${color} h-3 rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
      </div>
      <div className="flex justify-between text-xs text-gray-400 mt-1">
        <span>Fast</span><span>24 months</span>
      </div>
    </div>
  );
}

export default function RoiCalculator() {
  const [step, setStep] = useState(1);
  const [hectares, setHectares] = useState('');
  const [mineral, setMineral] = useState('Gold');
  const [budget, setBudget] = useState('');
  const [result, setResult] = useState<ROIPackage | null>(null);
  const [email, setEmail] = useState('');
  const [emailName, setEmailName] = useState('');
  const [emailSending, setEmailSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleCalculate = () => {
    const hectaresNum = parseFloat(hectares) || 10;
    const rec = calculateROI(hectaresNum, mineral, budget);
    if (rec) {
      const { match, ...pkg } = rec;
      setResult(pkg);
    }
    setStep(3);
  };

  const handleEmailReport = async () => {
    if (!email || !result) return;
    setEmailSending(true);
    try {
      await createDoc('enquiries', {
        fullName: emailName || 'ROI Calculator User',
        email,
        companyName: 'Unknown',
        phone: '',
        enquiryType: 'quotation_request',
        serviceId: 'exploration',
        projectDescription: `ROI Calc: ${hectares}ha ${mineral}, budget ${budget} → recommended ${result.name} at $${result.price}`,
        budgetRange: budget,
        status: 'new',
        priority: budget === '$50K+' ? 'high' : 'medium',
        leadScore: budget === '$50K+' ? 60 : budget === '$20K-$50K' ? 42 : 20,
        source: 'roi_calculator',
        documents: [],
      });
      setEmailSent(true);
      toast.success('Report saved! Our team will follow up shortly.');
    } catch (e) {
      toast.error('Could not save report. Please try again.');
    } finally {
      setEmailSending(false);
    }
  };

  const reset = () => {
    setStep(1); setHectares(''); setMineral('Gold'); setBudget('');
    setResult(null); setEmail(''); setEmailName(''); setEmailSent(false);
  };

  return (
    <div className="py-16 bg-gray-50 min-h-screen">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h1 className="section-title">Mining ROI Calculator</h1>
          <p className="section-subtitle">Find the right exploration package for your property in 60 seconds</p>
        </div>

        {/* Step indicator */}
        <div className="flex justify-center mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${s === step ? 'bg-primary-500 text-white' : s < step ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                {s < step ? '✓' : s}
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
              {/* Mineral price context */}
              {mineral && (
                <div className="bg-primary-50 border border-primary-100 rounded-lg p-3 text-sm text-primary-700 flex items-center gap-2">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  Current {mineral} market price: <strong>{formatCurrency(MINERAL_PRICE[mineral] || 0)}/{mineral === 'Chrome' || mineral === 'Copper' ? 'tonne' : mineral === 'Diamond' ? 'carat' : 'kg'}</strong>
                </div>
              )}
              <div className="pt-4 flex justify-end">
                <Button variant="primary" onClick={() => setStep(2)} disabled={!hectares}>Continue</Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Your Budget</h3>
              <div className="grid gap-3">
                {[
                  { value: '<$5K', label: 'Below $5,000', desc: 'Quick desktop assessment' },
                  { value: '$5K-$20K', label: '$5,000 – $20,000', desc: 'Standard exploration survey' },
                  { value: '$20K-$50K', label: '$20,000 – $50,000', desc: 'Comprehensive ground + drilling' },
                  { value: '$50K+', label: '$50,000+', desc: 'Full feasibility & mine design' },
                ].map((opt) => (
                  <label
                    key={opt.value}
                    className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${budget === opt.value ? 'border-primary-500 bg-primary-50 shadow-sm' : 'border-gray-200 hover:bg-gray-50'}`}
                  >
                    <input type="radio" name="budget" value={opt.value} checked={budget === opt.value} onChange={(e) => setBudget(e.target.value)} className="text-primary-500 mr-3" />
                    <div>
                      <span className="font-medium text-gray-900">{opt.label}</span>
                      <span className="text-sm text-gray-500 ml-2">{opt.desc}</span>
                    </div>
                  </label>
                ))}
              </div>
              <div className="pt-4 flex justify-between">
                <Button variant="ghost" onClick={() => setStep(1)}>Back</Button>
                <Button variant="accent" onClick={handleCalculate} disabled={!budget}>Calculate My ROI →</Button>
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

              <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl p-6 text-white">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-lg font-bold">{result.name}</h4>
                  <span className="text-2xl font-bold">{formatCurrency(result.price)}</span>
                </div>
                <p className="text-primary-200 text-sm mb-4">Best for: {result.bestFor}</p>
                <div className="space-y-1.5 mb-5">
                  {result.includes.map((item) => (
                    <div key={item} className="flex items-center gap-2 text-sm text-primary-100">
                      <svg className="w-4 h-4 text-green-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {item}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-white/10 rounded-xl p-3 text-center">
                    <div className="text-xs text-primary-200">Expected Grade</div>
                    <div className="font-bold text-white mt-0.5">{result.yield}</div>
                  </div>
                  <div className="bg-white/10 rounded-xl p-3 text-center">
                    <div className="text-xs text-primary-200">Projected Revenue</div>
                    <div className="font-bold text-white mt-0.5">
                      ${(result.revenueMin / 1e6).toFixed(1)}M – ${(result.revenueMax / 1e6).toFixed(1)}M
                    </div>
                  </div>
                </div>
                <PaybackBar months={result.payback} />
              </div>

              {/* Lead capture */}
              {!emailSent ? (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
                  <p className="text-sm font-medium text-gray-700">📧 Email this report to yourself — our team follows up within 24 hours</p>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <Input label="Your Name" value={emailName} onChange={(e) => setEmailName(e.target.value)} placeholder="Isaac Mugwagwa" />
                    <Input label="Email Address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" />
                  </div>
                  <Button variant="primary" className="w-full" onClick={handleEmailReport} isLoading={emailSending} disabled={!email}>
                    Send My ROI Report
                  </Button>
                </div>
              ) : (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center text-green-700 text-sm font-medium">
                  ✓ Report saved. Our team will contact you within 24 hours.
                </div>
              )}

              <div className="flex flex-wrap gap-3 pt-2">
                <Link to={`/lead-form?service=exploration&package=${encodeURIComponent(result.name)}`} className="flex-1">
                  <Button variant="accent" className="w-full">Get Full Quote →</Button>
                </Link>
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
