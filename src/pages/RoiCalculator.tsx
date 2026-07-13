import { useState, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line,
} from 'recharts';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Select } from '../components/ui/Select';
import { Input } from '../components/ui/Input';
import { formatCurrency } from '../lib/utils';
import { createDoc } from '../lib/db';
import toast from 'react-hot-toast';

const COLORS = ['#f97316', '#2563eb', '#16a34a', '#9333ea', '#dc2626'];

// —————— Geological Engine ——————

interface MineralDeposit {
  name: string;
  price: number;          // per unit
  priceUnit: string;      // kg, tonne, carat, oz
  gradeUnit: string;      // g/t, %, ct/t
  p50Grade: number;       // realistic grade
  p75Grade: number;       // optimistic grade
  p90Grade: number;       // bonanza grade
  density: number;        // t/m³ default
  cipRecovery: number;    // typical CIP recovery %
  byproduct?: string;
}

const MINERALS: Record<string, MineralDeposit> = {
  Gold: {
    name: 'Gold', price: 65000, priceUnit: 'kg', gradeUnit: 'g/t',
    p50Grade: 3, p75Grade: 5, p90Grade: 8, density: 2.7, cipRecovery: 92,
    byproduct: 'Silver',
  },
  Chrome: {
    name: 'Chrome', price: 180, priceUnit: 'tonne', gradeUnit: '% Cr2O3',
    p50Grade: 25, p75Grade: 35, p90Grade: 42, density: 2.8, cipRecovery: 85,
  },
  Platinum: {
    name: 'Platinum', price: 30000, priceUnit: 'kg', gradeUnit: 'g/t',
    p50Grade: 3, p75Grade: 4.5, p90Grade: 6, density: 2.9, cipRecovery: 88,
  },
  Copper: {
    name: 'Copper', price: 9000, priceUnit: 'tonne', gradeUnit: '%',
    p50Grade: 0.8, p75Grade: 1.2, p90Grade: 2, density: 2.6, cipRecovery: 90,
  },
  Diamond: {
    name: 'Diamond', price: 4000, priceUnit: 'carat', gradeUnit: 'ct/t',
    p50Grade: 0.15, p75Grade: 0.3, p90Grade: 0.5, density: 2.5, cipRecovery: 95,
  },
  Lithium: {
    name: 'Lithium', price: 12000, priceUnit: 'tonne', gradeUnit: '% Li2O',
    p50Grade: 1.2, p75Grade: 1.8, p90Grade: 2.5, density: 2.7, cipRecovery: 80,
  },
};

const DEFAULT_OPEX = {
  mining: 25,      // $/t mining cost
  processing: 18,  // $/t processing
  ga: 6,           // $/t G&A
  royalty: 3,      // % of revenue
  tax: 25,         // % corporate tax
  discount: 10,    // % discount rate
};

type Scenario = 'p50' | 'p75' | 'p90';

interface CalcResult {
  scenario: Scenario;
  label: string;
  tonnage: number;
  grade: number;
  recoveredMetal: number;
  grossRevenue: number;
  netRevenue: number;
  opexTotal: number;
  opexPerTonne: number;
  capex: number;
  annualRevenue: number;
  annualCost: number;
  annualProfit: number;
  npv: number;
  irr: number;
  paybackMonths: number;
  cashflow5Year: number[];
}

function runModel(
  hectares: number,
  depth: number,
  mineral: MineralDeposit,
  grade: number,
  stripRatio: number,
  recoveryPct: number,
  opex: typeof DEFAULT_OPEX,
  dailyThroughput: number,
): CalcResult {
  const tonnesPerHa = depth * mineral.density * 10000;
  const totalTonnes = hectares * tonnesPerHa;
  const wasteTonnes = totalTonnes * stripRatio;
  const mineableTonnes = totalTonnes;
  const gradeDecimal = mineral.gradeUnit.includes('%') ? grade / 100 : grade / 1000;
  const containedMetal = mineableTonnes * gradeDecimal;
  const recoveredMetal = containedMetal * (recoveryPct / 100);
  const grossRevenue = recoveredMetal * mineral.price;
  const royaltyCost = grossRevenue * (opex.royalty / 100);
  const miningCost = mineableTonnes * opex.mining + wasteTonnes * opex.mining;
  const processingCost = mineableTonnes * opex.processing;
  const gaCost = mineableTonnes * opex.ga;
  const opexTotal = miningCost + processingCost + gaCost + royaltyCost;
  const opexPerTonne = opexTotal / mineableTonnes;
  const netRevenue = grossRevenue - opexTotal;
  const mineLifeYears = mineableTonnes / (dailyThroughput * 330);
  const annualRevenue = grossRevenue / Math.max(mineLifeYears, 1);
  const annualCost = opexTotal / Math.max(mineLifeYears, 1);
  const annualProfit = netRevenue / Math.max(mineLifeYears, 1);
  const capex = hectares <= 20 ? 50000 : hectares <= 50 ? 150000 : hectares <= 200 ? 350000 : 750000;

  // DCF: 5-year NPV
  const cashflow5Year: number[] = [];
  for (let y = 1; y <= 5; y++) {
    const cf = annualProfit;
    cashflow5Year.push(Math.round(cf));
  }
  const npv = cashflow5Year.reduce((sum, cf, i) => {
    return sum + cf / Math.pow(1 + opex.discount / 100, i + 1);
  }, 0);

  // IRR approximation
  const inv = capex;
  const avgCf = annualProfit;
  const irr = avgCf > inv ? ((avgCf / inv) * 0.5 + 0.05) * 100 : 0;

  const paybackMonths = avgCf > 0 ? Math.ceil((capex / avgCf) * 12) : 999;

  return {
    scenario: grade === mineral.p50Grade ? 'p50' : grade === mineral.p75Grade ? 'p75' : 'p90',
    label: grade === mineral.p50Grade ? 'P50 — Realistic' : grade === mineral.p75Grade ? 'P75 — Optimistic' : 'P90 — Bonanza',
    tonnage: Math.round(mineableTonnes),
    grade,
    recoveredMetal: Math.round(recoveredMetal),
    grossRevenue: Math.round(grossRevenue),
    netRevenue: Math.round(netRevenue),
    opexTotal: Math.round(opexTotal),
    opexPerTonne: Math.round(opexPerTonne),
    capex,
    annualRevenue: Math.round(annualRevenue),
    annualCost: Math.round(annualCost),
    annualProfit: Math.round(annualProfit),
    npv: Math.round(npv),
    irr: Math.round(irr),
    paybackMonths,
    cashflow5Year,
  };
}

// —————— PDF Generator ——————

async function generatePDF(elementId: string) {
  const el = document.getElementById(elementId);
  if (!el) return;
  try {
    const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfW = pdf.internal.pageSize.getWidth();
    const pdfH = (canvas.height * pdfW) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfW, pdfH);
    pdf.save('Ramangwana-Investment-Summary.pdf');
    toast.success('Investment Summary PDF downloaded');
  } catch {
    toast.error('Could not generate PDF');
  }
}

// —————— Components ——————

function ScenarioCard({ result, mineral }: { result: CalcResult; mineral: MineralDeposit }) {
  const colorMap: Record<string, string> = { p50: '#2563eb', p75: '#f97316', p90: '#16a34a' };
  const color = colorMap[result.scenario] || '#6b7280';

  return (
    <div className="border rounded-xl p-4" style={{ borderColor: color + '40' }}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-bold" style={{ color }}>{result.label}</span>
        <span className="text-xs text-gray-400">{result.scenario.toUpperCase()}</span>
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <span className="text-gray-400">Grade</span>
          <p className="font-semibold text-gray-900">{result.grade} {mineral.gradeUnit}</p>
        </div>
        <div>
          <span className="text-gray-400">Recovered</span>
          <p className="font-semibold text-gray-900">
            {result.recoveredMetal.toLocaleString()} {mineral.priceUnit === 'carat' ? 'ct' : mineral.priceUnit === 'tonne' ? 't' : 'kg'}
          </p>
        </div>
        <div>
          <span className="text-gray-400">Gross Revenue</span>
          <p className="font-semibold text-gray-900">{formatCurrency(result.grossRevenue)}</p>
        </div>
        <div>
          <span className="text-gray-400">Net Revenue</span>
          <p className="font-semibold text-gray-900">{formatCurrency(result.netRevenue)}</p>
        </div>
        <div>
          <span className="text-gray-400">NPV (5yr)</span>
          <p className={`font-semibold ${result.npv >= 0 ? 'text-green-600' : 'text-red-500'}`}>
            {formatCurrency(result.npv)}
          </p>
        </div>
        <div>
          <span className="text-gray-400">IRR</span>
          <p className="font-semibold text-gray-900">{result.irr}%</p>
        </div>
        <div>
          <span className="text-gray-400">Payback</span>
          <p className="font-semibold text-gray-900">{result.paybackMonths > 120 ? 'N/A' : `${result.paybackMonths} mo`}</p>
        </div>
        <div>
          <span className="text-gray-400">Capex</span>
          <p className="font-semibold text-gray-900">{formatCurrency(result.capex)}</p>
        </div>
      </div>
    </div>
  );
}

// —————— Main Page ——————

export default function RoiCalculator() {
  const [step, setStep] = useState(1);
  const reportRef = useRef<HTMLDivElement>(null);

  // Step 1 — Geology
  const [hectares, setHectares] = useState('');
  const [depth, setDepth] = useState('30');
  const [mineralKey, setMineralKey] = useState('Gold');
  const [gradeCustom, setGradeCustom] = useState('');
  const [useCustomGrade, setUseCustomGrade] = useState(false);
  const [stripRatio, setStripRatio] = useState('1.5');
  const [recoveryPct, setRecoveryPct] = useState('');
  const [throughput, setThroughput] = useState('500');

  // Step 2 — Costs (advanced toggle)
  const [useAdvancedCosts, setUseAdvancedCosts] = useState(false);
  const [miningCost, setMiningCost] = useState(String(DEFAULT_OPEX.mining));
  const [processingCost, setProcessingCost] = useState(String(DEFAULT_OPEX.processing));
  const [gaCost, setGaCost] = useState(String(DEFAULT_OPEX.ga));
  const [royaltyPct, setRoyaltyPct] = useState(String(DEFAULT_OPEX.royalty));
  const [taxPct, setTaxPct] = useState(String(DEFAULT_OPEX.tax));
  const [discountRate, setDiscountRate] = useState(String(DEFAULT_OPEX.discount));

  // Step 3 — Results
  const [results, setResults] = useState<CalcResult[]>([]);
  const [email, setEmail] = useState('');
  const [emailName, setEmailName] = useState('');
  const [emailSending, setEmailSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const mineral = MINERALS[mineralKey] || MINERALS.Gold;

  const recoveryValue = useCustomGrade && recoveryPct ? parseFloat(recoveryPct) : mineral.cipRecovery;

  const opex = useAdvancedCosts
    ? { mining: parseFloat(miningCost) || 0, processing: parseFloat(processingCost) || 0, ga: parseFloat(gaCost) || 0, royalty: parseFloat(royaltyPct) || 0, tax: parseFloat(taxPct) || 0, discount: parseFloat(discountRate) || 0 }
    : DEFAULT_OPEX;

  const handleCalculate = () => {
    const ha = parseFloat(hectares) || 10;
    const dep = parseFloat(depth) || 30;
    const sr = parseFloat(stripRatio) || 0;
    const tp = parseFloat(throughput) || 500;

    const grades = useCustomGrade && gradeCustom
      ? [parseFloat(gradeCustom)]
      : [mineral.p50Grade, mineral.p75Grade, mineral.p90Grade];

    const scenarios = grades.map((g) => runModel(ha, dep, mineral, g, sr, recoveryValue, opex, tp));
    setResults(scenarios);
    setStep(3);
  };

  const handleEmailReport = async () => {
    if (!email || results.length === 0) return;
    setEmailSending(true);
    try {
      const best = results.sort((a, b) => b.npv - a.npv)[0];
      await createDoc('enquiries', {
        fullName: emailName || 'ROI Calculator User',
        email,
        companyName: 'Unknown',
        phone: '',
        enquiryType: 'quotation_request',
        serviceId: 'exploration',
        projectDescription: `${hectares}ha ${mineralKey} at ${depth}m depth — P50 NPV ${formatCurrency(best.npv)}`,
        budgetRange: best.capex <= 50000 ? '<$5K' : best.capex <= 150000 ? '$5K-$20K' : best.capex <= 350000 ? '$20K-$50K' : '$50K+',
        status: 'new',
        priority: best.npv > 0 ? 'high' : 'medium',
        leadScore: best.npv > 0 ? 75 : 30,
        source: 'roi_calculator',
        documents: [],
        roiCalculation: {
          propertySize: parseFloat(hectares) || 0,
          targetMineral: mineralKey,
          budgetRange: '',
          recommendedPackage: '',
          recommendedPackageName: '',
          expectedYield: `${best.grade} ${mineral.gradeUnit}`,
          paybackMonths: best.paybackMonths,
          estimatedCost: best.capex,
          generatedAt: new Date(),
        },
      });
      setEmailSent(true);
      toast.success('Report saved! Our team will follow up shortly.');
    } catch {
      toast.error('Could not save report.');
    } finally {
      setEmailSending(false);
    }
  };

  const reset = () => {
    setStep(1); setResults([]); setEmail(''); setEmailName(''); setEmailSent(false);
  };

  // Charts data
  const npvChartData = useMemo(() => results.map((r) => ({
    name: r.scenario.toUpperCase(), NPV: r.npv, Revenue: r.grossRevenue, Cost: r.opexTotal,
  })), [results]);

  const costBreakdown = results[0] ? [
    { name: 'Mining', value: results[0].opexTotal * (opex.mining / (opex.mining + opex.processing + opex.ga)) },
    { name: 'Processing', value: results[0].opexTotal * (opex.processing / (opex.mining + opex.processing + opex.ga)) },
    { name: 'G&A', value: results[0].opexTotal * (opex.ga / (opex.mining + opex.processing + opex.ga)) },
    { name: 'Royalty', value: results[0].opexTotal * (opex.royalty / 100) },
  ] : [];

  return (
    <div className="py-8 md:py-16 bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Intelligent Exploration ROI Engine</h1>
          <p className="text-gray-500 mt-2">Multi-scenario DCF model with CIP recovery curves, grade sensitivity, and automated investment summary</p>
        </div>

        {/* Steps */}
        <div className="flex justify-center mb-8 gap-0.5">
          {['Geology & Grade', 'Cost Model', 'Results Dashboard'].map((label, i) => (
            <button key={label}
              onClick={() => i < step - 1 ? setStep(i + 1) : null}
              className={`px-4 py-2 text-xs font-semibold transition-colors ${i + 1 === step ? 'bg-primary-500 text-white' : i + 1 < step ? 'bg-green-500 text-white cursor-pointer' : 'bg-gray-200 text-gray-400'}`}
            >
              {i + 1}. {label}
            </button>
          ))}
        </div>

        <Card padding="lg" className="mb-6">
          {/* ——— Step 1: Geology ——— */}
          {step === 1 && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-gray-900">Geological Parameters</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <Input label="Claim Size (hectares) *" type="number" value={hectares} onChange={(e) => setHectares(e.target.value)} placeholder="e.g. 50" />
                <Input label="Estimated Depth (meters)" type="number" value={depth} onChange={(e) => setDepth(e.target.value)} placeholder="Default 30m" />
                <Select label="Target Mineral" value={mineralKey} onChange={(e) => setMineralKey(e.target.value)}
                  options={Object.keys(MINERALS).map((k) => ({ value: k, label: MINERALS[k].name }))} />
                <Input label="Strip Ratio (waste:ore)" type="number" step="0.1" value={stripRatio} onChange={(e) => setStripRatio(e.target.value)} placeholder="1.5" />
                <Input label="Daily Throughput (tpd)" type="number" value={throughput} onChange={(e) => setThroughput(e.target.value)} placeholder="500" />
              </div>

              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <input type="checkbox" checked={useCustomGrade} onChange={() => setUseCustomGrade(!useCustomGrade)} className="text-primary-500" />
                  Use custom assay grade (skip for multi-scenario P50/P75/P90)
                </label>
                {useCustomGrade && (
                  <div className="grid md:grid-cols-2 gap-4">
                    <Input label={`Assay Grade (${mineral.gradeUnit})`} type="number" step="0.01" value={gradeCustom} onChange={(e) => setGradeCustom(e.target.value)} placeholder={`e.g. ${mineral.p50Grade}`} />
                    <Input label={`CIP Recovery Rate (%)`} type="number" value={recoveryPct} onChange={(e) => setRecoveryPct(e.target.value)} placeholder={`Default ${mineral.cipRecovery}%`} />
                  </div>
                )}
                {!useCustomGrade && (
                  <p className="text-xs text-gray-400">
                    Using {mineral.name} defaults — P50 {mineral.p50Grade}{mineral.gradeUnit}, P75 {mineral.p75Grade}{mineral.gradeUnit}, P90 {mineral.p90Grade}{mineral.gradeUnit} · CIP recovery {mineral.cipRecovery}%
                  </p>
                )}
              </div>

              <div className="flex justify-end">
                <Button variant="primary" onClick={() => setStep(2)} disabled={!hectares}>Continue to Costs →</Button>
              </div>
            </div>
          )}

          {/* ——— Step 2: Costs ——— */}
          {step === 2 && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-gray-900">Operating Cost Model</h3>
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700">
                Defaults reflect Zimbabwean small-to-medium mining operations. Toggle advanced to customize.
              </div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <input type="checkbox" checked={useAdvancedCosts} onChange={() => setUseAdvancedCosts(!useAdvancedCosts)} className="text-primary-500" />
                Customize operating costs
              </label>
              {useAdvancedCosts && (
                <div className="grid md:grid-cols-3 gap-4">
                  <Input label="Mining Cost ($/t)" type="number" value={miningCost} onChange={(e) => setMiningCost(e.target.value)} />
                  <Input label="Processing Cost ($/t)" type="number" value={processingCost} onChange={(e) => setProcessingCost(e.target.value)} />
                  <Input label="G&A ($/t)" type="number" value={gaCost} onChange={(e) => setGaCost(e.target.value)} />
                  <Input label="Royalty (%)" type="number" step="0.1" value={royaltyPct} onChange={(e) => setRoyaltyPct(e.target.value)} />
                  <Input label="Corporate Tax (%)" type="number" value={taxPct} onChange={(e) => setTaxPct(e.target.value)} />
                  <Input label="Discount Rate (%)" type="number" step="0.1" value={discountRate} onChange={(e) => setDiscountRate(e.target.value)} />
                </div>
              )}
              <p className="text-xs text-gray-400">
                Capex estimated from claim size: ≤20ha=$50K · ≤50ha=$150K · ≤200ha=$350K · &gt;200ha=$750K
              </p>
              <div className="flex justify-between pt-2">
                <Button variant="ghost" onClick={() => setStep(1)}>← Back</Button>
                <Button variant="accent" onClick={handleCalculate}>Run Model →</Button>
              </div>
            </div>
          )}

          {/* ——— Step 3: Results ——— */}
          {step === 3 && results.length > 0 && (
            <div ref={reportRef} id="roi-report" className="space-y-8">
              {/* Summary */}
              <div className="text-center">
                <div className="w-14 h-14 mx-auto bg-green-50 rounded-full flex items-center justify-center mb-3">
                  <svg className="w-7 h-7 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900">Investment Analysis Dashboard</h3>
                <p className="text-sm text-gray-500 mt-1">{hectares}ha {mineralKey} · {depth}m depth · {throughput}tpd throughput</p>
              </div>

              {/* Scenario cards */}
              <div className={`grid ${results.length === 1 ? 'grid-cols-1' : 'md:grid-cols-3'} gap-4`}>
                {results.map((r) => <ScenarioCard key={r.scenario} result={r} mineral={mineral} />)}
              </div>

              {/* NPV Comparison Chart */}
              <Card padding="md">
                <h4 className="text-sm font-bold text-gray-700 mb-3">Economic Comparison by Scenario</h4>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={npvChartData}>
                    <XAxis dataKey="name" fontSize={12} />
                    <YAxis fontSize={12} tickFormatter={(v) => `$${(v / 1e6).toFixed(0)}M`} />
                    <Tooltip formatter={(v: number) => formatCurrency(v)} />
                    <Bar dataKey="NPV" fill="#16a34a" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Revenue" fill="#2563eb" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Cost" fill="#dc2626" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>

              {/* Cost Breakdown + Cashflow */}
              <div className="grid md:grid-cols-2 gap-4">
                <Card padding="md">
                  <h4 className="text-sm font-bold text-gray-700 mb-3">Cost Breakdown</h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={costBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                        {costBreakdown.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip formatter={(v: number) => formatCurrency(v)} />
                    </PieChart>
                  </ResponsiveContainer>
                </Card>
                <Card padding="md">
                  <h4 className="text-sm font-bold text-gray-700 mb-3">5-Year Cashflow (P50)</h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={(results[0]?.cashflow5Year || []).map((v, i) => ({ year: `Year ${i + 1}`, cashflow: v }))}>
                      <XAxis dataKey="year" fontSize={12} />
                      <YAxis fontSize={12} tickFormatter={(v) => `$${(v / 1e3).toFixed(0)}K`} />
                      <Tooltip formatter={(v: number) => formatCurrency(v)} />
                      <Line type="monotone" dataKey="cashflow" stroke="#f97316" strokeWidth={2} dot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </Card>
              </div>

              {/* Capex vs Payback summary */}
              <Card padding="md" className="bg-gray-50">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  {[
                    { label: 'Estimated Capex', value: formatCurrency(results[0].capex) },
                    { label: 'Best Case NPV', value: formatCurrency(Math.max(...results.map((r) => r.npv))), color: 'text-green-600' },
                    { label: 'OPEX / Tonne', value: formatCurrency(results[0].opexPerTonne) },
                    { label: 'Min Payback', value: Math.min(...results.map((r) => r.paybackMonths)) <= 120 ? `${Math.min(...results.map((r) => r.paybackMonths))} mo` : 'N/A' },
                  ].map((s) => (
                    <div key={s.label}>
                      <p className="text-xs text-gray-500">{s.label}</p>
                      <p className={`text-lg font-bold ${s.color || 'text-gray-900'}`}>{s.value}</p>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Lead capture */}
              {!emailSent ? (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
                  <p className="text-sm font-medium text-gray-700">📧 Receive this investment summary — our team follows up within 24 hours</p>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <Input label="Your Name" value={emailName} onChange={(e) => setEmailName(e.target.value)} placeholder="Isaac Mugwagwa" />
                    <Input label="Email Address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" />
                  </div>
                  <div className="flex gap-2">
                    <Button variant="primary" className="flex-1" onClick={handleEmailReport} isLoading={emailSending} disabled={!email}>
                      Save & Send Report
                    </Button>
                    <Button variant="outline" onClick={() => generatePDF('roi-report')}>
                      Download PDF
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center text-green-700 text-sm font-medium">
                  ✓ Report saved. Our team will contact you within 24 hours.
                </div>
              )}

              <div className="flex flex-wrap gap-3 pt-2">
                <Link to={`/lead-form?service=exploration`} className="flex-1">
                  <Button variant="accent" className="w-full">Get Full Exploration Quote →</Button>
                </Link>
                <Button variant="ghost" onClick={reset}>Recalculate</Button>
              </div>
            </div>
          )}
        </Card>

        {/* Mineral price reference */}
        <details className="text-xs text-gray-400 cursor-pointer">
          <summary className="font-medium">Current mineral prices used for modeling</summary>
          <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2">
            {Object.values(MINERALS).map((m) => (
              <div key={m.name} className="bg-white border rounded-lg px-3 py-2">
                <span className="font-semibold text-gray-700">{m.name}</span>
                <span className="ml-2">{formatCurrency(m.price)}/{m.priceUnit}</span>
              </div>
            ))}
          </div>
        </details>

        <div className="mt-6 text-center">
          <Link to="/" className="text-sm text-primary-500 hover:underline">← Back to Home</Link>
        </div>
      </div>
    </div>
  );
}
