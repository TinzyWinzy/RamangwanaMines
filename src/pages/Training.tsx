import { Link } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { PageSpinner } from '../components/ui/Spinner';
import { useTraining } from '../hooks/useTraining';
import { formatCurrency } from '../lib/utils';

const demoCourses = [
  {
    id: '1',
    title: 'Mine Blasting Certification',
    slug: 'mine-blasting-certification',
    shortDescription: 'Comprehensive blasting certification covering explosive handling, safety protocols, and regulatory compliance.',
    category: 'blasting',
    duration: '2 weeks',
    priceUsd: 500,
    isCertification: true,
    certificationTitle: 'Certified Mine Blaster - Level 1',
    thumbnailUrl: '/mineblasting.jpg',
    maxSeats: 20,
    instructorId: '',
    prerequisites: [],
    syllabus: [],
    isActive: true,
    description: '',
    createdAt: new Date(),
  },
  {
    id: '2',
    title: 'Grade Control & Sampling',
    slug: 'grade-control-sampling',
    shortDescription: 'Learn grade control methodologies, sampling techniques, and quality assurance in mining operations.',
    category: 'geology',
    duration: '3 days',
    priceUsd: 300,
    isCertification: true,
    certificationTitle: 'Grade Control Specialist',
    thumbnailUrl: '/minedec.jpg',
    maxSeats: 25,
    instructorId: '',
    prerequisites: [],
    syllabus: [],
    isActive: true,
    description: '',
    createdAt: new Date(),
  },
  {
    id: '3',
    title: 'Shaft Safety & Rescue',
    slug: 'shaft-safety-rescue',
    shortDescription: 'Essential safety training for shaft operations, emergency response, and rescue procedures.',
    category: 'safety',
    duration: '1 week',
    priceUsd: 400,
    isCertification: true,
    certificationTitle: 'Shaft Safety & Rescue Certified',
    thumbnailUrl: '/closeupworkdone.jpg',
    maxSeats: 15,
    instructorId: '',
    prerequisites: [],
    syllabus: [],
    isActive: true,
    description: '',
    createdAt: new Date(),
  },
  {
    id: '4',
    title: 'Equipment Operation & Maintenance',
    slug: 'equipment-operation',
    shortDescription: 'Hands-on training for mining equipment operation, preventive maintenance, and troubleshooting.',
    category: 'equipment',
    duration: '1 month',
    priceUsd: 800,
    isCertification: true,
    certificationTitle: 'Mining Equipment Operator - Level 1',
    thumbnailUrl: '/machinery.jpg',
    maxSeats: 10,
    instructorId: '',
    prerequisites: [],
    syllabus: [],
    isActive: true,
    description: '',
    createdAt: new Date(),
  },
  {
    id: '5',
    title: 'Mining Project Management',
    slug: 'mining-project-management',
    shortDescription: 'Professional project management tailored for the mining industry — planning, budgeting, and execution.',
    category: 'management',
    duration: '2 weeks',
    priceUsd: 600,
    isCertification: false,
    thumbnailUrl: '/projectmanagement.jpg',
    maxSeats: 30,
    instructorId: '',
    prerequisites: [],
    syllabus: [],
    isActive: true,
    description: '',
    createdAt: new Date(),
  },
  {
    id: '6',
    title: 'Drilling Techniques & Safety',
    slug: 'drilling-techniques-safety',
    shortDescription: 'Practical drilling techniques including core drilling, RC drilling, and safety best practices.',
    category: 'geology',
    duration: '1 week',
    priceUsd: 350,
    isCertification: true,
    certificationTitle: 'Certified Drilling Operator',
    thumbnailUrl: '/boreholedrilling.jpg',
    maxSeats: 12,
    instructorId: '',
    prerequisites: [],
    syllabus: [],
    isActive: true,
    description: '',
    createdAt: new Date(),
  },
];

const categories = ['All', 'blasting', 'safety', 'geology', 'equipment', 'management'];

export default function Training() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = demoCourses.filter((c) => {
    if (activeCategory !== 'All' && c.category !== activeCategory) return false;
    if (searchTerm && !c.title.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="py-16 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h1 className="section-title">Training Courses</h1>
          <p className="section-subtitle">Industry-certified training programs to advance your mining career</p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeCategory === cat
                  ? 'bg-primary-500 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {cat === 'All' ? 'All Courses' : cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>

        <div className="max-w-md mx-auto mb-10">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((course) => (
            <Link key={course.id} to={`/training/${course.slug}`}>
              <Card padding="none" className="h-full flex flex-col">
                <div className="relative h-48">
                  <img
                    src={course.thumbnailUrl}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 flex gap-2">
                    {course.isCertification && (
                      <Badge variant="success">Certification</Badge>
                    )}
                  </div>
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                    <span className="capitalize">{course.category}</span>
                    <span className="w-1 h-1 bg-gray-300 rounded-full" />
                    <span>{course.duration}</span>
                  </div>
                  <h3 className="font-semibold text-gray-900">{course.title}</h3>
                  <p className="text-sm text-gray-600 mt-1 flex-1">{course.shortDescription}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-lg font-bold text-primary-500">
                      {course.priceUsd === 0 ? 'Free' : formatCurrency(course.priceUsd)}
                    </span>
                    <span className="text-sm text-primary-500 font-medium">
                      View Details →
                    </span>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-gray-500">
            No courses found matching your criteria.
          </div>
        )}
      </div>
    </div>
  );
}

import { useState } from 'react';
