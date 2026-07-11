import { useParams, Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { PageSpinner } from '../components/ui/Spinner';

export default function ServiceDetail() {
  const { slug } = useParams<{ slug: string }>();

  if (!slug) return <PageSpinner />;

  const serviceName = slug
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  return (
    <div className="py-16 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          to="/services"
          className="inline-flex items-center text-sm text-gray-500 hover:text-primary-500 mb-6 transition-colors"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Services
        </Link>

        <h1 className="section-title">{serviceName}</h1>
        <p className="section-subtitle max-w-2xl">
          Professional {serviceName.toLowerCase()} services tailored to mining and industrial projects.
        </p>

        <div className="mt-10 grid gap-6">
          <Card padding="lg">
            <h3 className="text-xl font-semibold">Service Overview</h3>
            <p className="mt-3 text-gray-600 leading-relaxed">
              Our {serviceName.toLowerCase()} division provides comprehensive solutions including expert personnel,
              modern equipment, and proven methodologies. We serve clients across Zimbabwe and the SADC region with
              a commitment to safety, quality, and on-time delivery.
            </p>
          </Card>

          <Card padding="lg">
            <h3 className="text-xl font-semibold">Key Features</h3>
            <div className="mt-4 grid sm:grid-cols-2 gap-3">
              {[
                'Experienced certified professionals',
                'Modern specialized equipment',
                'Safety-first approach',
                'Regulatory compliance',
                'Customizable service packages',
                'Competitive pricing',
              ].map((f) => (
                <div key={f} className="flex items-center gap-2 text-gray-700">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm">{f}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="mt-10 text-center">
          <Link to={`/lead-form?service=${slug}`}>
            <Button variant="primary" size="lg">Request a Quote for {serviceName}</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
