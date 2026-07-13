import { Link } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

const pillars = [
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    title: 'Offline-First Geological Sync',
    tagline: 'Bankable data starts in the field — not the office.',
    problem: 'Field teams drilling in Kadoma or Shurugwi lose network for hours. Core samples, depths, and tonnage get written on paper and entered days later — if at all.',
    solution: 'Geologists log every drilling run, sample depth, and assay result fully offline. The PWA queues data locally via IndexedDB and auto-syncs via Background Sync API the moment Econet or NetOne signal returns. No lost data. No delayed reports.',
    impact: 'Investor-ready geological reports generated in hours, not weeks. Every meter drilled becomes a bankable data point.',
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: 'Rainy-Season Risk Tracker',
    tagline: 'If your production stops when the clouds come out, you are not running a mine — you are running a hobby.',
    problem: 'Small-scale mines lose months to shaft flooding and structural collapse every rainy season. Reactive repairs cost more than prevention.',
    solution: 'A real-time dashboard linked to localized weather alerts. Teams log daily shaft water levels and shuttering inspection checkmarks. When thresholds cross danger levels, Web Push Notifications alert supervisors instantly — even with the browser closed.',
    impact: 'Zero unplanned downtime from weather. Civil works scheduled proactively. Ramangwana becomes the contractor that keeps you running through the storm.',
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    title: 'Speculative-to-Asset Valuation',
    tagline: 'From $30K speculative claim to $200K+ investment-grade asset.',
    problem: 'Small-scale miners cannot prove resource value to investors. Without professional drilling data, fire assays, and tonnage verification, claims sit undervalued.',
    solution: 'A client-facing financial modelling module built into the portal. Enter fire assay results, sulphur test percentages, and verified tonnage. The engine generates a "Resource Valuation Curve" and a download-ready PDF investment summary showing projected returns for CIP or leach plant upgrades.',
    impact: 'Ramangwana mathematically proves a claim\'s worth. Investors see clear growth patterns. Capital flows into bankable assets.',
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'Diaspora Project Tracker',
    tagline: 'Distance should not mean doubt.',
    problem: 'Diaspora investors in the UK and South Africa fund borehole drilling and mine development but lack visibility. Trust erodes when progress is invisible.',
    solution: 'Drilling operators use the PWA camera to snap on-site photos and short videos of water yields, plant installations, or shaft sinking. Media auto-compresses client-side before upload to a dedicated Diaspora Investor Portal. Investors see real progress from 8,000 km away.',
    impact: 'A new revenue stream opens. Diaspora clients invest with confidence because they can see every milestone. Ramangwana becomes the trusted partner for international capital.',
  },
];

export default function OperationalEfficiency() {
  return (
    <div>
      {/* HERO */}
      <section className="relative bg-secondary text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-secondary via-secondary/95 to-secondary/80 z-10" />
        <img src="/hero.jpg" alt="Ramangwana Mining operation" className="absolute inset-0 w-full h-full object-cover opacity-30" />
        <div className="relative z-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="max-w-3xl">
            <span className="text-primary-400 text-sm font-semibold uppercase tracking-wider mb-2 block">Ramangwana Mining Enterprise</span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              Bankable Data.<br />
              <span className="text-primary-400">Zero Downtime.</span><br />
              <span className="text-white">Investment-Ready Assets.</span>
            </h1>
            <p className="mt-6 text-lg text-gray-300 leading-relaxed">
              Ramangwana is not just a mining contractor. We are a technology-enabled mining services firm that delivers precision engineering, technical resource analysis, and investor-grade documentation — all through a purpose-built digital platform that sets a new standard for Zimbabwean mining.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/lead-form"><Button variant="accent" size="lg">Request a Consultation →</Button></Link>
              <Link to="/services"><Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10">View Our Services</Button></Link>
            </div>
          </div>
        </div>
      </section>

      {/* INTRO: THE STANDARD */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-primary-500 text-sm font-semibold uppercase tracking-wider">The New Standard</span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">Technology That Matches Our Engineering</h2>
          <p className="text-gray-600 text-lg mt-4 max-w-3xl mx-auto leading-relaxed">
            Ramangwana has always de-risked mining capital through precision engineering and technical analysis. But in a world where investors expect real-time data, verifiable certifications, and digital transparency — the old ways are no longer enough.
          </p>
          <p className="text-gray-600 text-lg mt-3 max-w-3xl mx-auto leading-relaxed">
            This platform transforms how we deliver every service — from geological drilling in remote fields to shaft rehabilitation in the rainy season — by making every data point bankable and every risk visible.
          </p>
          <div className="mt-8 grid grid-cols-4 gap-6 border-t border-gray-100 pt-8">
            {[
              { value: '150+', label: 'Projects' },
              { value: '50+', label: 'Hectares Surveyed' },
              { value: '12+', label: 'Years Experience' },
              { value: '98%', label: 'Client Satisfaction' },
            ].map((s) => (
              <div key={s.label}>
                <div className="text-3xl font-bold text-primary-500">{s.value}</div>
                <div className="text-gray-500 text-xs mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* THE FOUR PILLARS */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-primary-500 text-sm font-semibold uppercase tracking-wider">Four Pillars of the Platform</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">How We Deliver the Leading Standard</h2>
            <p className="text-gray-500 text-lg mt-3">Every feature solves a real operational bottleneck that costs Zimbabwean mining operations time, money, and credibility.</p>
          </div>

          <div className="space-y-20">
            {pillars.map((pillar, i) => (
              <div key={pillar.title} className={`grid md:grid-cols-2 gap-8 md:gap-16 items-center ${i % 2 === 1 ? 'md:grid-flow-dense' : ''}`}>
                <div className={i % 2 === 1 ? 'md:col-start-2' : ''}>
                  <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center text-primary-500 mb-4">
                    {pillar.icon}
                  </div>
                  <span className="text-xs font-semibold text-primary-500 uppercase tracking-wider">Pillar {i + 1}</span>
                  <h3 className="text-2xl font-bold text-gray-900 mt-1">{pillar.title}</h3>
                  <p className="text-primary-600 font-semibold text-sm mt-2 italic">&ldquo;{pillar.tagline}&rdquo;</p>
                  <div className="mt-6 space-y-4">
                    <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                      <span className="text-xs font-semibold text-red-500 uppercase">The Bottleneck</span>
                      <p className="text-sm text-red-700 mt-1">{pillar.problem}</p>
                    </div>
                    <div className="bg-green-50 border border-green-100 rounded-xl p-4">
                      <span className="text-xs font-semibold text-green-600 uppercase">The Solution</span>
                      <p className="text-sm text-green-800 mt-1">{pillar.solution}</p>
                    </div>
                    <div className="bg-primary-50 border border-primary-100 rounded-xl p-4">
                      <span className="text-xs font-semibold text-primary-600 uppercase">The Impact</span>
                      <p className="text-sm text-primary-800 mt-1">{pillar.impact}</p>
                    </div>
                  </div>
                </div>
                <div className={`bg-secondary rounded-2xl p-8 text-white ${i % 2 === 1 ? 'md:col-start-1 md:row-start-1' : ''}`}>
                  <div className="text-6xl font-bold text-primary-400 mb-2">0{i + 1}</div>
                  <h4 className="text-xl font-bold mb-3">{pillar.title}</h4>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {i === 0 && 'Field teams never lose data. Every drill run syncs automatically when connectivity returns. Geological reports compile in hours, not weeks.'}
                    {i === 1 && 'Shaft water levels monitored in real time. Push alerts sent before structural failure. Rainy season becomes productive season.'}
                    {i === 2 && 'Fire assays and tonnage data feed directly into a valuation engine. Investment summaries generated as PDFs ready for investor presentations.'}
                    {i === 3 && 'Diaspora investors watch their borehole being drilled from London or Johannesburg. Photos and videos auto-upload with minimal data usage.'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT FITS TOGETHER */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-primary-500 text-sm font-semibold uppercase tracking-wider">Unified Platform</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">One System. Every Operation.</h2>
            <p className="text-gray-500 text-lg mt-3 max-w-2xl mx-auto">These four pillars are not separate tools. They are a single, unified PWA that connects field teams, office staff, clients, and investors into one transparent workflow.</p>
          </div>

          <Card padding="lg" className="bg-gradient-to-br from-secondary to-gray-800 text-white">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-bold">For Ramangwana&apos;s Operations</h3>
                <ul className="mt-4 space-y-3">
                  {[
                    'Field data captured once, never re-entered',
                    'Real-time visibility from Harare to every site',
                    'Automated compliance and regulatory reporting',
                    'Reduced admin overhead — more time on engineering',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-gray-300">
                      <svg className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-bold">For Ramangwana&apos;s Image</h3>
                <ul className="mt-4 space-y-3">
                  {[
                    'Positioned as Zimbabwe\'s most technologically advanced mining services firm',
                    'Investor-ready documentation built into every project',
                    'Diaspora trust through transparent remote monitoring',
                    'Sets the benchmark competitors will have to match',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-gray-300">
                      <svg className="w-4 h-4 text-primary-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* WHY RAMANGWANA */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-primary-500 text-sm font-semibold uppercase tracking-wider">The Vision</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">From Raw Potential to World-Class Assets</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card padding="lg" className="text-center">
              <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              </div>
              <h3 className="font-bold text-gray-900">Precision Engineering</h3>
              <p className="text-sm text-gray-600 mt-2">From diamond drilling to shaft support, every meter is executed with technical excellence and documented digitally.</p>
            </Card>
            <Card padding="lg" className="text-center">
              <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
              </div>
              <h3 className="font-bold text-gray-900">Bankable Data</h3>
              <p className="text-sm text-gray-600 mt-2">Every assay, tonnage, and inspection becomes part of an investment-grade documentation package.</p>
            </Card>
            <Card padding="lg" className="text-center">
              <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </div>
              <h3 className="font-bold text-gray-900">Risk Mitigation</h3>
              <p className="text-sm text-gray-600 mt-2">Real-time monitoring, push alerts, and proactive civil works eliminate weather-related downtime and structural risk.</p>
            </Card>
          </div>
        </div>
      </section>

      {/* ABOUT THE BUILDER */}
      <section className="py-16 bg-white border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Built by</span>
          <h3 className="text-xl font-bold text-gray-900 mt-1">Brandon — Radbit Studios, Harare</h3>
          <p className="text-gray-500 text-sm mt-2 max-w-2xl mx-auto">
            Zimbabwe-based developer with expertise in AI-powered RAG systems, PWA architecture, and enterprise platform development. Radbit Studios builds tools that work in African conditions — offline-first, data-efficient, and built for impact.
          </p>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-20 bg-secondary text-white">
        <div className="max-w-3xl mx-auto text-center px-4">
          <h2 className="text-3xl md:text-4xl font-bold">Ready to Own the Standard?</h2>
          <p className="mt-4 text-gray-300 text-lg max-w-2xl mx-auto">
            This platform positions Ramangwana as Zimbabwe&apos;s leading technology-enabled mining services firm — delivering bankable data, zero-downtime operations, and investment-ready assets. The question is not whether mining is going digital. It is who will lead.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link to="/lead-form"><Button variant="accent" size="lg">Start the Conversation →</Button></Link>
            <Link to="/services"><Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10">Explore Our Capabilities</Button></Link>
          </div>
        </div>
      </section>
    </div>
  );
}
