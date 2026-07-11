import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

const services = [
  { icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10', title: 'Drilling', desc: 'Borehole drilling, core drilling, reverse circulation for exploration and water supply.' },
  { icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z', title: 'Exploration', desc: 'Geological surveys, remote sensing, AKS exploration, and mineral prospecting.' },
  { icon: 'M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z', title: 'Blasting', desc: 'Mine blasting, controlled demolition, explosive handling, and site preparation.' },
  { icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z', title: 'Fabrication', desc: 'Headgear fabrication, steel structures, mining equipment manufacturing and repair.' },
  { icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z', title: 'Consultancy', desc: 'Mining industry consulting, project advice, feasibility studies, and technical guidance.' },
  { icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', title: 'Project Management', desc: 'End-to-end mining project management, scheduling, budgeting, and contractor oversight.' },
];

const stats = [
  { value: '150+', label: 'Projects Completed' },
  { value: '12+', label: 'Years Experience' },
  { value: '50+', label: 'Expert Engineers' },
  { value: '98%', label: 'Client Satisfaction' },
];

export default function Home() {
  return (
    <div>
      <section className="relative bg-secondary text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-secondary to-transparent z-10" />
        <img src="/hero.jpg" alt="Mining operations" className="absolute inset-0 w-full h-full object-cover opacity-40" />
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-36">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              Your Trusted <span className="text-primary-400">Mining</span> Partner
            </h1>
            <p className="mt-6 text-lg text-gray-300 leading-relaxed">
              From exploration and drilling to blasting, fabrication, and training — Ramangwana Mining Enterprise
              delivers end-to-end solutions for the mining industry.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/lead-form">
                <Button variant="primary" size="lg">Request a Quote</Button>
              </Link>
              <Link to="/services">
                <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
                  Explore Services
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat) => (
              <div key={stat.label}>
                <div className="text-4xl font-bold text-primary-500">{stat.value}</div>
                <div className="text-gray-600 mt-1 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="section-title">Our Core Services</h2>
            <p className="section-subtitle">Comprehensive mining solutions tailored to your project needs</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((svc) => (
              <Card key={svc.title} padding="lg">
                <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={svc.icon} />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{svc.title}</h3>
                <p className="mt-2 text-gray-600 text-sm leading-relaxed">{svc.desc}</p>
              </Card>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link to="/services">
              <Button variant="outline">View All Services</Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="section-title">Why Choose Ramangwana?</h2>
              <div className="mt-6 space-y-4">
                {[
                  { title: 'Experienced Team', desc: 'Over 12 years of hands-on mining industry expertise' },
                  { title: 'Safety First', desc: 'Rigorous safety protocols and certified safety officers on every project' },
                  { title: 'Modern Equipment', desc: 'State-of-the-art drilling rigs and fabrication facilities' },
                  { title: 'Regulatory Compliant', desc: 'Fully licensed and compliant with Zimbabwe mining regulations' },
                ].map((item) => (
                  <div key={item.title} className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 mt-0.5">
                      <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{item.title}</h4>
                      <p className="text-sm text-gray-600">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <img src="/machinery.jpg" alt="Heavy machinery" className="rounded-2xl shadow-lg w-full h-[400px] object-cover" />
              <div className="absolute -bottom-6 -left-6 bg-primary-500 text-white rounded-xl p-6 shadow-lg hidden md:block">
                <div className="text-3xl font-bold">12+</div>
                <div className="text-sm opacity-90">Years of Excellence</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-secondary text-white">
        <div className="max-w-3xl mx-auto text-center px-4">
          <h2 className="text-3xl md:text-4xl font-bold">Ready to Start Your Project?</h2>
          <p className="mt-4 text-gray-300 text-lg">
            Get in touch with our team for a consultation and customized quotation.
          </p>
          <div className="mt-8">
            <Link to="/lead-form">
              <Button variant="accent" size="lg">Get Your Free Quote</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
