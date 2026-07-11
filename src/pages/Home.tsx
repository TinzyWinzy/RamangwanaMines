import { Link } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useFirestoreCollection } from '../hooks/useFirestore';
import { where, orderBy, limit } from '../lib/db';
import type { Service, Project } from '../types';
import { PageSpinner } from '../components/ui/Spinner';

const fallbackServices = [
  { id: '1', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10', title: 'Drilling', desc: 'Borehole drilling, core drilling, reverse circulation for exploration and water supply.' },
  { id: '2', icon: 'M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z', title: 'Blasting', desc: 'Mine blasting, controlled demolition, explosive handling, and site preparation.' },
  { id: '3', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z', title: 'Fabrication', desc: 'Headgear fabrication, steel structures, mining equipment manufacturing and repair.' },
  { id: '4', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z', title: 'Consultancy', desc: 'Mining industry consulting, project advice, feasibility studies, and technical guidance.' },
  { id: '5', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253', title: 'Training', desc: 'Mine blasting certification, grade control, shaft safety, equipment operation courses.' },
  { id: '6', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', title: 'Project Mgmt', desc: 'End-to-end mining project management, scheduling, budgeting, and contractor oversight.' },
];

const stats = [
  { value: '150+', label: 'Projects Completed' },
  { value: '50+', label: 'Hectares Surveyed' },
  { value: '3', label: 'Offices Nationwide' },
  { value: '98%', label: 'Client Satisfaction' },
];

const projectShowcaseFallback = [
  { title: 'Shaft Rehab — Mazowe Mine', status: '78% Complete', img: '/hero.jpg' },
  { title: 'Borehole Drilling — Farm 47', status: 'Completed', img: '/boreholedrilling.jpg' },
  { title: 'Headgear — Trojan Mine', status: 'In Progress', img: '/headgear.jpg' },
];

export default function Home() {
  const { data: services } = useFirestoreCollection<Service>('services', [where('isActive', '==', true), orderBy('sortOrder'), limit(6)]);
  const { data: projects } = useFirestoreCollection<Project>('projects', [where('status', 'in', ['in_progress', 'completed']), orderBy('createdAt', 'desc'), limit(3)]);

  const displayServices = services.length > 0 ? services : [];
  const displayProjects = projects.length > 0 ? projects : [];
  const showcase = displayProjects.length > 0
    ? displayProjects.map((p) => ({ title: p.title, status: p.status === 'completed' ? 'Completed' : `${p.healthScore}% Health`, img: '/hero.jpg' }))
    : projectShowcaseFallback;

  const serviceIcons: Record<string, string> = {
    drilling: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10',
    blasting: 'M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z',
    fabrication: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z',
    consultancy: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
    training: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
    project_management: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
    exploration: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
    default: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10',
  };

  return (
    <div>
      <section className="relative bg-secondary text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-secondary via-secondary/90 to-transparent z-10" />
        <img src="/hero.jpg" alt="Mining operations" className="absolute inset-0 w-full h-full object-cover opacity-40" />
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-36">
          <div className="max-w-2xl">
            <span className="text-primary-400 text-sm font-semibold uppercase tracking-wider">Mining Enterprise</span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mt-2">
              Strength Above<br /><span className="text-primary-400">Ground</span>
            </h1>
            <p className="mt-6 text-lg text-gray-300 leading-relaxed max-w-lg">
              From exploration and drilling to blasting, fabrication, and certified training — Ramangwana delivers end-to-end mining solutions with real-time project visibility.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/roi-calculator"><Button variant="accent" size="lg">Calculate Your ROI &#8594;</Button></Link>
              <Link to="/lead-form"><Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10">Request a Quote</Button></Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat) => (
              <div key={stat.label}><div className="text-4xl font-bold text-primary-500">{stat.value}</div><div className="text-gray-600 mt-1 text-sm">{stat.label}</div></div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12"><h2 className="section-title">What's Your Mine Worth?</h2><p className="section-subtitle">Use our ROI calculator to find the right exploration package in 60 seconds</p></div>
          <div className="max-w-2xl mx-auto">
            <Card padding="lg" className="text-center bg-gradient-to-br from-primary-50 to-white border border-primary-100">
              <div className="text-4xl mb-3">&#9971;</div>
              <h3 className="text-xl font-bold text-gray-900">Exploration ROI Calculator</h3>
              <p className="text-gray-600 mt-2 text-sm">Input your property size, target mineral, and budget — we'll recommend the optimal exploration package with expected yield and payback timeline.</p>
              <Link to="/roi-calculator" className="inline-block mt-6"><Button variant="accent" size="lg">Start Calculating &#8594;</Button></Link>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12"><h2 className="section-title">Core Services</h2><p className="section-subtitle">Comprehensive mining solutions tailored to your project needs</p></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(displayServices.length > 0 ? displayServices : fallbackServices).map((svc: any) => (
              <Link key={svc.id || svc.slug} to={`/services/${svc.slug || ''}`}>
                <Card padding="lg">
                  <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={(serviceIcons as any)[svc.category] || serviceIcons.default} />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">{svc.name || svc.title}</h3>
                  <p className="mt-2 text-gray-600 text-sm leading-relaxed">{svc.shortDescription || svc.desc}</p>
                </Card>
              </Link>
            ))}
          </div>
          <div className="text-center mt-10"><Link to="/services"><Button variant="outline">View All Services</Button></Link></div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12"><h2 className="section-title">Active Projects</h2><p className="section-subtitle">Real-time visibility into ongoing operations</p></div>
          <div className="grid md:grid-cols-3 gap-6">
            {showcase.map((p) => (
              <Card key={p.title} padding="none">
                <img src={p.img} alt={p.title} className="w-full h-48 object-cover" />
                <div className="p-4"><h4 className="font-semibold text-gray-900">{p.title}</h4><span className="text-sm text-primary-500 font-medium">{p.status}</span></div>
              </Card>
            ))}
          </div>
          <div className="text-center mt-8"><Link to="/client-dashboard"><Button variant="primary">View Project Command Center</Button></Link></div>
        </div>
      </section>

      <section className="py-20 bg-secondary text-white">
        <div className="max-w-3xl mx-auto text-center px-4">
          <h2 className="text-3xl md:text-4xl font-bold">Ready to De-Risk Your Mine?</h2>
          <p className="mt-4 text-gray-300 text-lg">Get an exploration ROI estimate, book a consultation, or enroll your team in certified training — all in one place.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link to="/roi-calculator"><Button variant="accent" size="lg">Calculate ROI</Button></Link>
            <Link to="/lead-form"><Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10">Get Quote</Button></Link>
          </div>
        </div>
      </section>
    </div>
  );
}
