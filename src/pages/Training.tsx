import { Link } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { PageSpinner } from '../components/ui/Spinner';
import { useFirestoreCollection } from '../hooks/useFirestore';
import { where, orderBy } from '../lib/db';
import type { TrainingCourse } from '../types';
import { formatCurrency } from '../lib/utils';
import { useState } from 'react';

const fallbackCourses: any[] = [
  { id: 'mine-blasting-cert', title: 'Mine Blasting Certification', slug: 'mine-blasting-certification', shortDescription: 'Complete blasting certification with practical field assessment.', category: 'blasting', duration: '2 weeks', priceUsd: 500, maxSeats: 20, isCertification: true, certificationTitle: 'Certified Mine Blaster - Level 1', thumbnailUrl: '/mineblasting.jpg', isActive: true, prerequisites: ['Basic mining knowledge', 'Physical fitness clearance', 'Minimum 18 years of age'] },
  { id: 'grade-control', title: 'Grade Control & Sampling', slug: 'grade-control-sampling', shortDescription: 'Master sampling techniques and grade control for mining operations.', category: 'geology', duration: '3 days', priceUsd: 300, maxSeats: 25, isCertification: true, certificationTitle: 'Grade Control Specialist', thumbnailUrl: '/minedec.jpg', isActive: true, prerequisites: ['Basic geology understanding'] },
  { id: 'shaft-safety', title: 'Shaft Safety & Rescue', slug: 'shaft-safety-rescue', shortDescription: 'Critical safety training for mine shaft operations.', category: 'safety', duration: '1 week', priceUsd: 400, maxSeats: 15, isCertification: true, certificationTitle: 'Shaft Safety & Rescue Certified', thumbnailUrl: '/closeupworkdone.jpg', isActive: true, prerequisites: ['Prior mining experience', 'Medical fitness certificate'] },
  { id: 'equipment-op', title: 'Equipment Operation & Maintenance', slug: 'equipment-operation', shortDescription: 'Operate and maintain mining equipment safely and efficiently.', category: 'equipment', duration: '1 month', priceUsd: 800, maxSeats: 10, isCertification: true, certificationTitle: 'Mining Equipment Operator - Level 1', thumbnailUrl: '/machinery.jpg', isActive: true, prerequisites: ['Valid driver\'s license', 'Physical fitness'] },
  { id: 'project-mgmt', title: 'Mining Project Management', slug: 'mining-project-management', shortDescription: 'Manage mining projects from exploration to production.', category: 'management', duration: '2 weeks', priceUsd: 600, maxSeats: 30, isCertification: false, thumbnailUrl: '/projectmanagement.jpg', isActive: true, prerequisites: ['Basic project management knowledge'] },
  { id: 'drilling-tech', title: 'Drilling Techniques & Safety', slug: 'drilling-techniques-safety', shortDescription: 'Master drilling operations and safety protocols.', category: 'geology', duration: '1 week', priceUsd: 350, maxSeats: 12, isCertification: true, certificationTitle: 'Certified Drilling Operator', thumbnailUrl: '/boreholedrilling.jpg', isActive: true, prerequisites: ['High school diploma', 'Basic mechanical knowledge'] },
];

const categories = ['All', 'blasting', 'safety', 'geology', 'equipment', 'management'];

export default function Training() {
  const { data: firestoreCourses, isLoading } = useFirestoreCollection<TrainingCourse>('trainingCourses', [where('isActive', '==', true), orderBy('createdAt', 'desc')]);
  const courses = firestoreCourses.length > 0 ? firestoreCourses : fallbackCourses;
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = courses.filter((c: any) => {
    if (activeCategory !== 'All' && c.category !== activeCategory) return false;
    if (searchTerm && !c.title.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="py-16 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10"><h1 className="section-title">Training Courses</h1><p className="section-subtitle">Industry-certified training programs to advance your mining career</p></div>

        <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
          {categories.map((cat) => (
            <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeCategory === cat ? 'bg-primary-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}>
              {cat === 'All' ? 'All Courses' : cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>

        <div className="max-w-md mx-auto mb-10">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input type="text" placeholder="Search courses..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((course: any) => (
            <Link key={course.id} to={`/training/${course.slug}`}>
              <Card padding="none" className="h-full flex flex-col">
                <div className="relative h-48">
                  <img src={course.thumbnailUrl || '/mineblasting.jpg'} alt={course.title} className="w-full h-full object-cover" />
                  {course.isCertification && <div className="absolute top-3 left-3"><Badge variant="success">Certification</Badge></div>}
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                    <span className="capitalize">{course.category}</span><span className="w-1 h-1 bg-gray-300 rounded-full" /><span>{course.duration}</span>
                  </div>
                  <h3 className="font-semibold text-gray-900">{course.title}</h3>
                  <p className="text-sm text-gray-600 mt-1 flex-1">{course.shortDescription}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-lg font-bold text-primary-500">{course.priceUsd === 0 ? 'Free' : formatCurrency(course.priceUsd)}</span>
                    <span className="text-sm text-primary-500 font-medium">View Details →</span>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
        {filtered.length === 0 && <div className="text-center py-16 text-gray-500">No courses found.</div>}
      </div>
    </div>
  );
}
