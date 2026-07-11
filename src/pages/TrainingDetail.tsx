import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { formatCurrency } from '../lib/utils';
import { useState } from 'react';

const demoModuleData: Record<string, { title: string; shortDescription: string; description: string; duration: string; priceUsd: number; isCertification: boolean; certificationTitle?: string; category: string; maxSeats: number; syllabus: { moduleNumber: number; title: string; description: string; duration: string }[]; prerequisites: string[] }> = {
  'mine-blasting-certification': {
    title: 'Mine Blasting Certification',
    shortDescription: 'Comprehensive blasting certification covering explosive handling, safety protocols, and regulatory compliance.',
    description: 'This course provides comprehensive training in mine blasting operations including explosive types, handling procedures, blast design, safety protocols, and Zimbabwe mining regulations. Successful candidates receive an industry-recognized certification.',
    duration: '2 weeks',
    priceUsd: 500,
    isCertification: true,
    certificationTitle: 'Certified Mine Blaster - Level 1',
    category: 'blasting',
    maxSeats: 20,
    syllabus: [
      { moduleNumber: 1, title: 'Introduction to Blasting', description: 'Overview of blasting in mining, types of explosives, and their properties.', duration: '2 days' },
      { moduleNumber: 2, title: 'Explosive Handling & Storage', description: 'Safe handling, transportation, and storage of explosives per regulatory standards.', duration: '2 days' },
      { moduleNumber: 3, title: 'Blast Design Fundamentals', description: 'Principles of blast design including burden, spacing, stemming, and delay timing.', duration: '3 days' },
      { moduleNumber: 4, title: 'Safety & Risk Management', description: 'Risk assessment, safety protocols, personal protective equipment, and emergency response.', duration: '2 days' },
      { moduleNumber: 5, title: 'Regulatory Compliance', description: 'Zimbabwe mining regulations, licensing requirements, and compliance documentation.', duration: '1 day' },
      { moduleNumber: 6, title: 'Practical Field Assessment', description: 'Supervised practical blasting operations and final examination.', duration: '2 days' },
    ],
    prerequisites: ['Basic mining knowledge', 'Physical fitness clearance', 'Minimum 18 years of age'],
  },
  'grade-control-sampling': {
    title: 'Grade Control & Sampling',
    shortDescription: 'Learn grade control methodologies, sampling techniques, and quality assurance.',
    description: 'Master grade control and sampling techniques used in modern mining operations. Covers sampling methods, QA/QC procedures, and data interpretation.',
    duration: '3 days',
    priceUsd: 300,
    isCertification: true,
    certificationTitle: 'Grade Control Specialist',
    category: 'geology',
    maxSeats: 25,
    syllabus: [
      { moduleNumber: 1, title: 'Sampling Fundamentals', description: 'Types of sampling, sample collection, and preparation methods.', duration: '1 day' },
      { moduleNumber: 2, title: 'QA/QC Procedures', description: 'Quality assurance and quality control in sampling programs.', duration: '1 day' },
      { moduleNumber: 3, title: 'Data Interpretation', description: 'Analysis, interpretation, and reporting of grade control data.', duration: '1 day' },
    ],
    prerequisites: ['Basic understanding of geology'],
  },
  'shaft-safety-rescue': {
    title: 'Shaft Safety & Rescue',
    shortDescription: 'Essential safety training for shaft operations, emergency response, and rescue procedures.',
    description: 'Comprehensive shaft safety training covering operational procedures, hazard identification, emergency preparedness, and rescue operations in shaft environments.',
    duration: '1 week',
    priceUsd: 400,
    isCertification: true,
    certificationTitle: 'Shaft Safety & Rescue Certified',
    category: 'safety',
    maxSeats: 15,
    syllabus: [
      { moduleNumber: 1, title: 'Shaft Operations Basics', description: 'Types of shafts, equipment, and standard operating procedures.', duration: '1 day' },
      { moduleNumber: 2, title: 'Hazard Identification', description: 'Identifying and assessing shaft-related hazards and risks.', duration: '1 day' },
      { moduleNumber: 3, title: 'Emergency Response', description: 'Emergency protocols, evacuation procedures, and communication systems.', duration: '2 days' },
      { moduleNumber: 4, title: 'Rescue Operations', description: 'Practical rescue techniques, equipment usage, and team coordination.', duration: '2 days' },
    ],
    prerequisites: ['Prior mining experience', 'Medical fitness certificate'],
  },
  'equipment-operation': {
    title: 'Equipment Operation & Maintenance',
    shortDescription: 'Operate and maintain mining equipment safely and efficiently.',
    description: 'Hands-on training for mining equipment operation, preventive maintenance, and troubleshooting. Covers drill rigs, LHDs, and support equipment with practical exercises.',
    duration: '1 month',
    priceUsd: 800,
    isCertification: true,
    certificationTitle: 'Mining Equipment Operator - Level 1',
    category: 'equipment',
    maxSeats: 10,
    syllabus: [
      { moduleNumber: 1, title: 'Equipment Familiarization', description: 'Types of mining equipment, controls, and safety features.', duration: '3 days' },
      { moduleNumber: 2, title: 'Operation Techniques', description: 'Practical operation of drills, LHDs, and support equipment.', duration: '2 weeks' },
      { moduleNumber: 3, title: 'Preventive Maintenance', description: 'Daily checks, servicing, and troubleshooting.', duration: '3 days' },
      { moduleNumber: 4, title: 'Safety & Assessment', description: 'Operational safety exam and practical assessment.', duration: '2 days' },
    ],
    prerequisites: ['Valid driver\'s license', 'Physical fitness'],
  },
  'mining-project-management': {
    title: 'Mining Project Management',
    shortDescription: 'Manage mining projects from exploration to production.',
    description: 'Professional project management tailored for the mining industry covering the entire mine lifecycle from exploration through to closure.',
    duration: '2 weeks',
    priceUsd: 600,
    isCertification: false,
    category: 'management',
    maxSeats: 30,
    syllabus: [
      { moduleNumber: 1, title: 'Mine Project Lifecycle', description: 'Exploration, development, production, and closure phases.', duration: '2 days' },
      { moduleNumber: 2, title: 'Budgeting & Cost Control', description: 'Mine budgeting, CAPEX/OPEX, and cost tracking.', duration: '2 days' },
      { moduleNumber: 3, title: 'Scheduling & Resource Planning', description: 'Gantt charts, critical path, resource allocation.', duration: '2 days' },
      { moduleNumber: 4, title: 'Risk & Safety Management', description: 'Risk registers, safety KPIs, and incident management.', duration: '2 days' },
      { moduleNumber: 5, title: 'Stakeholder Reporting', description: 'Executive dashboards, progress reports, and presentations.', duration: '2 days' },
    ],
    prerequisites: ['Basic project management knowledge'],
  },
  'drilling-techniques-safety': {
    title: 'Drilling Techniques & Safety',
    shortDescription: 'Master drilling operations and safety protocols.',
    description: 'Practical drilling techniques including core drilling, RC drilling, and safety best practices for mining and exploration.',
    duration: '1 week',
    priceUsd: 350,
    isCertification: true,
    certificationTitle: 'Certified Drilling Operator',
    category: 'geology',
    maxSeats: 12,
    syllabus: [
      { moduleNumber: 1, title: 'Drilling Methods', description: 'Core drilling, RC, auger, and diamond drilling techniques.', duration: '2 days' },
      { moduleNumber: 2, title: 'Drill Rig Operations', description: 'Setup, operation, and troubleshooting of drill rigs.', duration: '2 days' },
      { moduleNumber: 3, title: 'Safety & Environmental', description: 'Drilling safety, environmental protection, and waste management.', duration: '1 day' },
    ],
    prerequisites: ['High school diploma', 'Basic mechanical knowledge'],
  },
};

const demoBatches = [
  { id: 'b1', batchName: 'Blasting Q3 2026', startDate: new Date('2026-08-15'), endDate: new Date('2026-08-29'), location: 'Eastlea Office', maxSeats: 20, enrolledCount: 8, status: 'open' as const, courseId: '', instructorId: '', schedule: [], createdAt: new Date() },
  { id: 'b2', batchName: 'Blasting Q4 2026', startDate: new Date('2026-11-03'), endDate: new Date('2026-11-17'), location: 'On-site (Mutare)', maxSeats: 20, enrolledCount: 2, status: 'open' as const, courseId: '', instructorId: '', schedule: [], createdAt: new Date() },
  { id: 'b3', batchName: 'Blasting Q2 2027', startDate: new Date('2027-03-10'), endDate: new Date('2027-03-24'), location: 'Virtual', maxSeats: 20, enrolledCount: 0, status: 'open' as const, courseId: '', instructorId: '', schedule: [], createdAt: new Date() },
];

export default function TrainingDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [expandedModule, setExpandedModule] = useState<number | null>(null);
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState('');

  if (!slug || !demoModuleData[slug]) {
    return (
      <div className="py-16 text-center text-gray-500">
        Course not found. <Link to="/training" className="text-primary-500">Browse courses</Link>
      </div>
    );
  }

  const course = demoModuleData[slug];

  const handleEnroll = () => {
    setIsEnrollModalOpen(false);
    alert(`Enrollment confirmed for batch: ${selectedBatch}. You will receive a confirmation email.`);
    navigate('/my-training');
  };

  return (
    <div className="py-16 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/training" className="inline-flex items-center text-sm text-gray-500 hover:text-primary-500 mb-6">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Courses
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Badge>{course.category}</Badge>
                <Badge variant="info">{course.duration}</Badge>
                {course.isCertification && <Badge variant="success">Certification</Badge>}
              </div>
              <h1 className="text-3xl font-bold text-gray-900">{course.title}</h1>
              <p className="mt-3 text-gray-600 leading-relaxed">{course.description}</p>
            </div>

            {course.isCertification && (
              <Card padding="md">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <svg className="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                  {course.certificationTitle}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Upon successful completion and passing the final assessment, you will receive this industry-recognized certification.
                </p>
              </Card>
            )}

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Course Syllabus</h3>
              <div className="space-y-3">
                {course.syllabus.map((mod) => (
                  <div key={mod.moduleNumber} className="border border-gray-200 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setExpandedModule(expandedModule === mod.moduleNumber ? null : mod.moduleNumber)}
                      className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 bg-primary-50 text-primary-600 rounded-full flex items-center justify-center text-sm font-semibold">
                          {mod.moduleNumber}
                        </span>
                        <div className="text-left">
                          <span className="font-medium text-gray-900">{mod.title}</span>
                          <span className="text-xs text-gray-500 block">{mod.duration}</span>
                        </div>
                      </div>
                      <svg
                        className={`w-5 h-5 text-gray-400 transition-transform ${expandedModule === mod.moduleNumber ? 'rotate-180' : ''}`}
                        fill="none" stroke="currentColor" viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {expandedModule === mod.moduleNumber && (
                      <div className="p-4 bg-gray-50 border-t border-gray-200">
                        <p className="text-sm text-gray-600">{mod.description}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Prerequisites</h3>
              <ul className="space-y-2">
                {course.prerequisites.map((p) => (
                  <li key={p} className="flex items-center gap-2 text-gray-700">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="space-y-6">
            <Card padding="lg" className="sticky top-24">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-500">
                  {course.priceUsd === 0 ? 'Free' : formatCurrency(course.priceUsd)}
                </div>
                <p className="text-sm text-gray-500">per participant</p>
              </div>

              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {course.duration}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857" />
                  </svg>
                  Max {course.maxSeats} seats per batch
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Multiple locations
                </div>
              </div>

              <Button
                variant="primary"
                className="w-full mt-6"
                onClick={() => setIsEnrollModalOpen(true)}
              >
                Enroll Now
              </Button>
            </Card>
          </div>
        </div>
      </div>

      <Modal isOpen={isEnrollModalOpen} onClose={() => setIsEnrollModalOpen(false)} title="Select Batch" size="md">
        <div className="space-y-4">
          {demoBatches.map((batch) => (
            <label
              key={batch.id}
              className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-colors ${
                selectedBatch === batch.id
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="batch"
                  value={batch.id}
                  checked={selectedBatch === batch.id}
                  onChange={(e) => setSelectedBatch(e.target.value)}
                  className="text-primary-500"
                />
                <div>
                  <p className="font-medium text-gray-900">{batch.batchName}</p>
                  <p className="text-sm text-gray-500">{batch.location} &middot; {batch.enrolledCount}/{batch.maxSeats} enrolled</p>
                </div>
              </div>
              <span className="text-sm text-gray-500">
                {batch.startDate.toLocaleDateString('en-ZA', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </label>
          ))}
          <Button
            variant="primary"
            className="w-full"
            disabled={!selectedBatch}
            onClick={handleEnroll}
          >
            Confirm Enrollment
          </Button>
        </div>
      </Modal>
    </div>
  );
}
