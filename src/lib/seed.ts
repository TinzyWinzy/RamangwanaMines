import { collection, doc, setDoc, writeBatch } from 'firebase/firestore';
import { db } from './firebase';

const services = [
  { id: 'drilling', name: 'Drilling Services', slug: 'drilling', category: 'drilling', shortDescription: 'Borehole drilling, core drilling, reverse circulation for exploration and water supply.', fullDescription: 'Our drilling division provides borehole drilling, core drilling, and reverse circulation drilling for mineral exploration, water supply, and geotechnical investigation. We operate modern rigs capable of depths up to 300m with experienced drillers and geologists.', priceDisplay: 'From $500', features: [], images: ['/boreholedrilling.jpg'], isActive: true, sortOrder: 1 },
  { id: 'exploration', name: 'Exploration & AKS', slug: 'exploration', category: 'exploration', shortDescription: 'Geological surveys, remote sensing, AKS exploration, mineral prospecting.', fullDescription: 'Our exploration team uses advanced ground exploration technology (AKS) combined with traditional geological surveys. We provide remote sensing analysis, soil and rock sampling, geochemical analysis, and 3D mineral modeling to identify and quantify mineral deposits.', priceDisplay: 'From $800', features: [], images: ['/aksexploration.jpg'], isActive: true, sortOrder: 2 },
  { id: 'blasting', name: 'Mine Blasting', slug: 'blasting', category: 'blasting', shortDescription: 'Mine blasting, controlled demolition, explosive handling, and site preparation.', fullDescription: 'Certified blasting team for mine operations, quarry blasting, controlled demolition, and site preparation. We handle all regulatory compliance with the Zimbabwe Mining Authority and maintain strict safety protocols for explosive handling and storage.', priceDisplay: 'Quote-based', features: [], images: ['/mineblasting.jpg'], isActive: true, sortOrder: 3 },
  { id: 'fabrication', name: 'Fabrication & Engineering', slug: 'fabrication', category: 'fabrication', shortDescription: 'Headgear fabrication, steel structures, mining equipment manufacturing and repair.', fullDescription: 'Our fabrication workshop produces headgear structures, steel frameworks, mining equipment components, and custom engineering solutions. We handle everything from design to installation with certified welders and structural engineers.', priceDisplay: 'From $5,000', features: [], images: ['/headgear.jpg'], isActive: true, sortOrder: 4 },
  { id: 'consultancy', name: 'Mining Consultancy', slug: 'consultancy', category: 'consultancy', shortDescription: 'Mining industry consulting, feasibility studies, technical guidance.', fullDescription: 'Expert consultancy for mining operations including feasibility studies, mine design, operational optimization, environmental impact assessments, and regulatory compliance. Our consultants bring 12+ years of industry experience across gold, chrome, platinum, and copper projects.', priceDisplay: 'From $200/hr', features: [], images: ['/consultants.jpg'], isActive: true, sortOrder: 5 },
  { id: 'project-management', name: 'Project Management', slug: 'project_management', category: 'project_management', shortDescription: 'End-to-end mining project management and contractor oversight.', fullDescription: 'Comprehensive project management for mining projects including scheduling, budgeting, procurement, contractor management, quality assurance, and stakeholder reporting. We use modern PM tools to provide real-time visibility into project health.', priceDisplay: 'From $2,000/mo', features: [], images: ['/projectmanagement.jpg'], isActive: true, sortOrder: 6 },
  { id: 'equipment-hire', name: 'Equipment Hire', slug: 'equipment_hire', category: 'equipment_hire', shortDescription: 'Drilling rigs, compressors, generators, and mining equipment for hire.', fullDescription: 'Short and long-term equipment hire including drilling rigs, air compressors, generators, water pumps, and safety equipment. All equipment is regularly maintained and comes with operator options.', priceDisplay: 'From $100/day', features: [], images: ['/machinery.jpg'], isActive: true, sortOrder: 7 },
  { id: 'trade-center', name: 'Trade Center', slug: 'trade_center', category: 'trade_center', shortDescription: 'Pumps, generators, safety gear, and mining consumables supply.', fullDescription: 'One-stop trade center for mining consumables, pumps, generators, safety equipment, and spare parts. We stock major brands and offer delivery to remote sites with maintenance support.', priceDisplay: 'Varies', features: [], images: ['/tradecenter.jpg'], isActive: true, sortOrder: 8 },
  { id: 'recruitment', name: 'Recruitment', slug: 'recruitment', category: 'recruitment', shortDescription: 'Mining workforce recruitment, vetting, and placement services.', fullDescription: 'Specialized mining recruitment for drillers, blasters, geologists, safety officers, and project managers. We vet all candidates for certifications and experience before placement.', priceDisplay: 'Quote-based', features: [], images: ['/issacMugwagwa.jpg'], isActive: true, sortOrder: 9 },
  { id: 'training', name: 'Training Academy', slug: 'training', category: 'training', shortDescription: 'Certified mining training courses — blasting, safety, geology, equipment.', fullDescription: 'Industry-certified training programs for mine blasting, grade control, shaft safety, equipment operation, and project management. All courses include practical assessments and recognized certification upon completion.', priceDisplay: 'From $100', features: [], images: ['/mineblasting.jpg'], isActive: true, sortOrder: 10 },
  { id: 'safety', name: 'Safety Services', slug: 'safety', category: 'consultancy', shortDescription: 'Safety audits, risk assessments, and compliance management.', fullDescription: 'Mining safety services including workplace audits, risk assessments, safety officer placement, incident investigation, and OSHA compliance management.', priceDisplay: 'From $500', features: [], images: ['/closeupworkdone.jpg'], isActive: true, sortOrder: 11 },
];

const trainingCourses = [
  {
    id: 'mine-blasting-cert',
    title: 'Mine Blasting Certification',
    slug: 'mine-blasting-certification',
    description: 'Comprehensive blasting certification covering explosive handling, safety protocols, blast design, and Zimbabwe mining regulations.',
    shortDescription: 'Complete blasting certification with practical field assessment.',
    category: 'blasting',
    duration: '2 weeks',
    priceUsd: 500,
    maxSeats: 20,
    isCertification: true,
    certificationTitle: 'Certified Mine Blaster - Level 1',
    instructorId: '',
    thumbnailUrl: '/mineblasting.jpg',
    isActive: true,
    prerequisites: ['Basic mining knowledge', 'Physical fitness clearance', 'Minimum 18 years of age'],
    syllabus: [
      { moduleNumber: 1, title: 'Introduction to Blasting', description: 'Overview of blasting in mining, types of explosives, and their properties.', duration: '2 days', contentBlocks: [] },
      { moduleNumber: 2, title: 'Explosive Handling & Storage', description: 'Safe handling, transportation, and storage of explosives per regulatory standards.', duration: '2 days', contentBlocks: [] },
      { moduleNumber: 3, title: 'Blast Design Fundamentals', description: 'Principles of blast design including burden, spacing, stemming, and delay timing.', duration: '3 days', contentBlocks: [] },
      { moduleNumber: 4, title: 'Safety & Risk Management', description: 'Risk assessment, safety protocols, PPE, and emergency response.', duration: '2 days', contentBlocks: [] },
      { moduleNumber: 5, title: 'Regulatory Compliance', description: 'Zimbabwe mining regulations, licensing requirements, and compliance documentation.', duration: '1 day', contentBlocks: [] },
      { moduleNumber: 6, title: 'Practical Field Assessment', description: 'Supervised practical blasting operations and final examination.', duration: '2 days', contentBlocks: [] },
    ],
  },
  {
    id: 'grade-control',
    title: 'Grade Control & Sampling',
    slug: 'grade-control-sampling',
    description: 'Learn grade control methodologies, sampling techniques, and quality assurance in mining operations.',
    shortDescription: 'Master sampling techniques and grade control for mining operations.',
    category: 'geology',
    duration: '3 days',
    priceUsd: 300,
    maxSeats: 25,
    isCertification: true,
    certificationTitle: 'Grade Control Specialist',
    instructorId: '',
    thumbnailUrl: '/minedec.jpg',
    isActive: true,
    prerequisites: ['Basic geology understanding'],
    syllabus: [
      { moduleNumber: 1, title: 'Sampling Fundamentals', description: 'Types of sampling, sample collection, and preparation methods.', duration: '1 day', contentBlocks: [] },
      { moduleNumber: 2, title: 'QA/QC Procedures', description: 'Quality assurance and quality control in sampling programs.', duration: '1 day', contentBlocks: [] },
      { moduleNumber: 3, title: 'Data Interpretation', description: 'Analysis, interpretation, and reporting of grade control data.', duration: '1 day', contentBlocks: [] },
    ],
  },
  {
    id: 'shaft-safety',
    title: 'Shaft Safety & Rescue',
    slug: 'shaft-safety-rescue',
    description: 'Essential safety training for shaft operations, emergency response, and rescue procedures.',
    shortDescription: 'Critical safety training for mine shaft operations.',
    category: 'safety',
    duration: '1 week',
    priceUsd: 400,
    maxSeats: 15,
    isCertification: true,
    certificationTitle: 'Shaft Safety & Rescue Certified',
    instructorId: '',
    thumbnailUrl: '/closeupworkdone.jpg',
    isActive: true,
    prerequisites: ['Prior mining experience', 'Medical fitness certificate'],
    syllabus: [
      { moduleNumber: 1, title: 'Shaft Operations Basics', description: 'Types of shafts, equipment, and standard operating procedures.', duration: '1 day', contentBlocks: [] },
      { moduleNumber: 2, title: 'Hazard Identification', description: 'Identifying and assessing shaft-related hazards.', duration: '1 day', contentBlocks: [] },
      { moduleNumber: 3, title: 'Emergency Response', description: 'Emergency protocols, evacuation, and communication systems.', duration: '2 days', contentBlocks: [] },
      { moduleNumber: 4, title: 'Rescue Operations', description: 'Practical rescue techniques and team coordination.', duration: '2 days', contentBlocks: [] },
    ],
  },
  {
    id: 'equipment-op',
    title: 'Equipment Operation & Maintenance',
    slug: 'equipment-operation',
    description: 'Hands-on training for mining equipment operation, preventive maintenance, and troubleshooting.',
    shortDescription: 'Operate and maintain mining equipment safely and efficiently.',
    category: 'equipment',
    duration: '1 month',
    priceUsd: 800,
    maxSeats: 10,
    isCertification: true,
    certificationTitle: 'Mining Equipment Operator - Level 1',
    instructorId: '',
    thumbnailUrl: '/machinery.jpg',
    isActive: true,
    prerequisites: ['Valid driver\'s license', 'Physical fitness'],
    syllabus: [
      { moduleNumber: 1, title: 'Equipment Familiarization', description: 'Types of mining equipment, controls, and safety features.', duration: '3 days', contentBlocks: [] },
      { moduleNumber: 2, title: 'Operation Techniques', description: 'Practical operation of drills, LHDs, and support equipment.', duration: '2 weeks', contentBlocks: [] },
      { moduleNumber: 3, title: 'Preventive Maintenance', description: 'Daily checks, servicing, and troubleshooting.', duration: '3 days', contentBlocks: [] },
      { moduleNumber: 4, title: 'Safety & Assessment', description: 'Operational safety exam and practical assessment.', duration: '2 days', contentBlocks: [] },
    ],
  },
  {
    id: 'project-mgmt',
    title: 'Mining Project Management',
    slug: 'mining-project-management',
    description: 'Professional project management tailored for the mining industry.',
    shortDescription: 'Manage mining projects from exploration to production.',
    category: 'management',
    duration: '2 weeks',
    priceUsd: 600,
    maxSeats: 30,
    isCertification: false,
    instructorId: '',
    thumbnailUrl: '/projectmanagement.jpg',
    isActive: true,
    prerequisites: ['Basic project management knowledge'],
    syllabus: [
      { moduleNumber: 1, title: 'Mine Project Lifecycle', description: 'Exploration, development, production, and closure phases.', duration: '2 days', contentBlocks: [] },
      { moduleNumber: 2, title: 'Budgeting & Cost Control', description: 'Mine budgeting, CAPEX/OPEX, and cost tracking.', duration: '2 days', contentBlocks: [] },
      { moduleNumber: 3, title: 'Scheduling & Resource Planning', description: 'Gantt charts, critical path, resource allocation.', duration: '2 days', contentBlocks: [] },
      { moduleNumber: 4, title: 'Risk & Safety Management', description: 'Risk registers, safety KPIs, and incident management.', duration: '2 days', contentBlocks: [] },
      { moduleNumber: 5, title: 'Stakeholder Reporting', description: 'Executive dashboards, progress reports, and presentations.', duration: '2 days', contentBlocks: [] },
    ],
  },
  {
    id: 'drilling-tech',
    title: 'Drilling Techniques & Safety',
    slug: 'drilling-techniques-safety',
    description: 'Practical drilling techniques including core drilling, RC drilling, and safety best practices.',
    shortDescription: 'Master drilling operations and safety protocols.',
    category: 'geology',
    duration: '1 week',
    priceUsd: 350,
    maxSeats: 12,
    isCertification: true,
    certificationTitle: 'Certified Drilling Operator',
    instructorId: '',
    thumbnailUrl: '/boreholedrilling.jpg',
    isActive: true,
    prerequisites: ['High school diploma', 'Basic mechanical knowledge'],
    syllabus: [
      { moduleNumber: 1, title: 'Drilling Methods', description: 'Core drilling, RC, auger, and diamond drilling.', duration: '2 days', contentBlocks: [] },
      { moduleNumber: 2, title: 'Drill Rig Operations', description: 'Setup, operation, and troubleshooting of drill rigs.', duration: '2 days', contentBlocks: [] },
      { moduleNumber: 3, title: 'Safety & Environmental', description: 'Drilling safety, environmental protection, and waste management.', duration: '1 day', contentBlocks: [] },
    ],
  },
];

const packages = [
  { id: 'pkg-remote', serviceId: 'exploration', name: 'Remote Sensing Package', description: 'Satellite imagery analysis and desktop assessment for early-stage prospecting.', priceUsd: 500, features: ['Satellite imagery', 'Geological mapping', 'PDF report'], isRecommended: false },
  { id: 'pkg-survey', serviceId: 'exploration', name: 'Exploration Survey Package', description: 'On-site geological survey, soil sampling, and 3D terrain modeling.', priceUsd: 1500, features: ['On-site survey', 'Soil sampling', 'Geochemical analysis', '3D modeling'], isRecommended: false },
  { id: 'pkg-full', serviceId: 'exploration', name: 'Full Scope Mining Assessment', description: 'Comprehensive drilling, feasibility study, and mine design.', priceUsd: 5000, features: ['Drilling program', 'Feasibility study', 'Resource estimation', 'Mine design'], isRecommended: true },
  { id: 'pkg-aks', serviceId: 'exploration', name: 'AKS Exploration + Drilling', description: 'Advanced AKS ground exploration with core drilling and resource modeling.', priceUsd: 3500, features: ['AKS exploration', 'Core drilling', '3D block model', 'Investment report'], isRecommended: false },
  { id: 'pkg-fab-5t', serviceId: 'fabrication', name: '5-Tonne Headgear Package', description: 'Complete 5T headgear fabrication, delivery, and installation.', priceUsd: 25000, features: ['Design', 'Steel fabrication', 'Delivery', 'Installation'], isRecommended: false },
  { id: 'pkg-fab-10t', serviceId: 'fabrication', name: '10-Tonne Headgear Package', description: 'Heavy-duty 10T headgear for larger mining operations.', priceUsd: 45000, features: ['Design', 'Steel fabrication', 'Delivery', 'Installation', 'Load testing'], isRecommended: true },
  { id: 'pkg-drill-borehole', serviceId: 'drilling', name: 'Standard Borehole (100m)', description: 'Single borehole drilling up to 100m depth with casing.', priceUsd: 5000, features: ['Drilling', 'Casing', 'Water quality test'], isRecommended: false },
  { id: 'pkg-drill-deep', serviceId: 'drilling', name: 'Deep Borehole (200m+)', description: 'Deep borehole drilling with advanced geophysical logging.', priceUsd: 12000, features: ['Drilling', 'Casing', 'Geophysical logs', 'Pump test'], isRecommended: true },
];

const tradeItems = [
  { id: 'trade-pump', name: 'Submersible Borehole Pump 5HP', category: 'Pumps', priceUsd: 850, stock: 12, imageUrl: '/tradecenter.jpg', description: 'Heavy-duty submersible pump for boreholes up to 150m. Includes control box.' },
  { id: 'trade-gen', name: 'Diesel Generator 15kVA', category: 'Generators', priceUsd: 3200, stock: 3, imageUrl: '/machinery.jpg', description: 'Silent diesel generator with electric start. Ideal for remote mine sites.' },
  { id: 'trade-ppe', name: 'Mining PPE Kit (Full Set)', category: 'Safety', priceUsd: 180, stock: 50, imageUrl: '/closeupworkdone.jpg', description: 'Hard hat, safety glasses, gloves, boots, and reflective vest. SABS approved.' },
  { id: 'trade-compressor', name: 'Air Compressor 300CFM', category: 'Equipment', priceUsd: 4500, stock: 2, imageUrl: '/machinery.jpg', description: 'Diesel-driven air compressor for drilling and pneumatic tools.' },
  { id: 'trade-pipe', name: 'HDPE Borehole Casing Pipe (per 5m)', category: 'Drilling', priceUsd: 75, stock: 200, imageUrl: '/borehole.jpg', description: 'High-density polyethylene casing pipe. UV resistant. 150mm diameter.' },
  { id: 'trade-explosive', name: 'ANFO Explosive (per tonne)', category: 'Blasting', priceUsd: 1200, stock: 5, imageUrl: '/mineblasting.jpg', description: 'Ammonium nitrate/fuel oil blasting agent. Licensed buyers only.' },
];

export async function runSeed() {
  const batch = writeBatch(db);

  for (const svc of services) {
    batch.set(doc(db, 'services', svc.id), { ...svc, createdAt: new Date() });
  }

  for (const course of trainingCourses) {
    batch.set(doc(db, 'trainingCourses', course.id), { ...course, createdAt: new Date() });
  }

  for (const pkg of packages) {
    batch.set(doc(collection(db, 'services', pkg.serviceId, 'servicePackages'), pkg.id), pkg);
  }

  for (const item of tradeItems) {
    batch.set(doc(db, 'tradeInventory', item.id), item);
  }

  const batches = [
    { id: 'batch-blast-q3', courseId: 'mine-blasting-cert', batchName: 'Blasting Q3 2026', startDate: new Date('2026-08-15'), endDate: new Date('2026-08-29'), location: 'Eastlea Office', maxSeats: 20, enrolledCount: 8, status: 'open', instructorId: '', schedule: [] },
    { id: 'batch-blast-q4', courseId: 'mine-blasting-cert', batchName: 'Blasting Q4 2026', startDate: new Date('2026-11-03'), endDate: new Date('2026-11-17'), location: 'On-site (Mutare)', maxSeats: 20, enrolledCount: 2, status: 'open', instructorId: '', schedule: [] },
    { id: 'batch-grade-q3', courseId: 'grade-control', batchName: 'Geology Q3 2026', startDate: new Date('2026-09-01'), endDate: new Date('2026-09-03'), location: 'Eastlea Office', maxSeats: 25, enrolledCount: 12, status: 'open', instructorId: '', schedule: [] },
    { id: 'batch-safety-q3', courseId: 'shaft-safety', batchName: 'Safety Q3 2026', startDate: new Date('2026-08-01'), endDate: new Date('2026-08-07'), location: 'On-site (Mazowe)', maxSeats: 15, enrolledCount: 15, status: 'full', instructorId: '', schedule: [] },
  ];

  for (const b of batches) {
    batch.set(doc(db, 'trainingBatches', b.id), { ...b, createdAt: new Date() });
  }

  const enquiries = [
    { id: 'lead-1', fullName: 'Farai Moyo', companyName: 'MiningCo Ltd', phone: '+263771112222', email: 'farai@miningco.co.zw', enquiryType: 'quotation_request', serviceId: 'drilling', status: 'new', priority: 'high', source: 'website', leadScore: 87, budgetRange: '$5K-$20K', timeline: 'Immediate', projectDescription: 'Need 2 boreholes for water supply at Mazowe mine. Depth approx 80m each. Solar pump required.', notes: 'Documents uploaded — site survey and water quality requirements.' },
    { id: 'lead-2', fullName: 'Tendai Dube', companyName: 'Bulawayo Drillers', phone: '+263773334444', email: 'tendai@bdrillers.co.zw', enquiryType: 'consultation_booking', serviceId: 'exploration', status: 'contacted', priority: 'medium', source: 'referral', leadScore: 60, budgetRange: '$20K-$50K', timeline: '1-3 months', projectDescription: 'Exploration survey for new chrome claim in Midlands. 50 hectare property.', notes: 'Site visit scheduled for Friday.' },
    { id: 'lead-3', fullName: 'Simba Ncube', companyName: 'Ncube Holdings', phone: '+263775556666', email: 'simba@nholdings.co.zw', enquiryType: 'project_brief', serviceId: 'fabrication', status: 'qualified', priority: 'urgent', source: 'direct', leadScore: 92, budgetRange: '$50K+', timeline: 'Immediate', projectDescription: '10T headgear fabrication for Trojan Mine. Urgent — existing structure failed inspection.', notes: 'Engineering drawings provided. Needs fast-track delivery.' },
    { id: 'lead-4', fullName: 'Rutendo Chikosi', companyName: 'Gold Fields ZW', phone: '+263777778888', email: 'rutendo@gfields.co.zw', enquiryType: 'quotation_request', serviceId: 'project_management', status: 'proposal_sent', priority: 'high', source: 'google', leadScore: 75, budgetRange: '$50K+', timeline: '3-6 months', projectDescription: 'Project management for new gold mine development in Kadoma area.', notes: 'Proposal sent. Awaiting board review.' },
    { id: 'lead-5', fullName: 'Tafadzwa Zhou', companyName: 'Zhou Mining', phone: '+263779990000', email: 'tf@zhoumining.co.zw', enquiryType: 'training_enrollment', serviceId: 'training', status: 'negotiating', priority: 'medium', source: 'facebook', leadScore: 55, budgetRange: '<$5K', timeline: '1-3 months', projectDescription: '5 team members need Mine Blasting Certification.', notes: 'Price discussion ongoing. Batch Q3 2026 preferred.' },
    { id: 'lead-6', fullName: 'Chipo Moyo', companyName: 'Mazowe Resources', phone: '+263778881111', email: 'chipo@mazoweres.co.zw', enquiryType: 'quotation_request', serviceId: 'project_management', status: 'won', priority: 'medium', source: 'referral', leadScore: 82, budgetRange: '$20K-$50K', timeline: 'Immediate', notes: 'Closed. Shaft rehab project started. $24,500 budget approved.' },
    { id: 'lead-7', fullName: 'Blessing Dube', companyName: 'Mutare Miners', phone: '+263774445555', email: 'blessing@mutaremines.co.zw', enquiryType: 'general_inquiry', serviceId: 'drilling', status: 'lost', priority: 'low', source: 'website', leadScore: 25, notes: 'Chose competitor. Price-sensitive.' },
    { id: 'lead-8', fullName: 'Patience Ndlovu', companyName: 'Gwanda Gold', phone: '+263772223333', email: 'patience@gwandagold.co.zw', enquiryType: 'quotation_request', serviceId: 'exploration', status: 'new', priority: 'high', source: 'google', leadScore: 78, budgetRange: '$5K-$20K', timeline: '3-6 months', projectDescription: 'Exploration survey for new claim in Gwanda. Gold target.', notes: 'Claims documentation verified.' },
  ];

  for (const enq of enquiries) {
    batch.set(doc(db, 'enquiries', enq.id), { ...enq, documents: [], activities: [], createdAt: new Date('2026-07-' + (11 - parseInt(enq.id.split('-')[1])).toString().padStart(2, '0')), updatedAt: new Date() });
  }

  const projects = [
    {
      id: 'proj-1', enquiryId: 'lead-6', clientId: '', serviceId: 'project_management', title: 'Shaft Rehabilitation — Mazowe Mine', description: 'Comprehensive shaft rehab including structural inspection, rock support, and lining replacement at Mazowe gold mine.', status: 'in_progress', startDate: new Date('2026-06-15'), targetCompletion: new Date('2026-09-15'), budgetUsd: 50000, invoicedUsd: 38000, paidUsd: 28500, healthScore: 87,
      dailyLogs: [
        { id: 'log-1', date: new Date('2026-07-11'), depthMeters: 8.5, rockType: 'hard', waterIngress: 'none', notes: 'Steady progress through granite layer.', photos: [], voiceNotes: [], loggedBy: '', synced: true, createdAt: new Date('2026-07-11') },
        { id: 'log-2', date: new Date('2026-07-10'), depthMeters: 7.2, rockType: 'hard', waterIngress: 'none', notes: 'No issues. Rock slightly fractured at 6.8m.', photos: [], voiceNotes: [], loggedBy: '', synced: true, createdAt: new Date('2026-07-10') },
        { id: 'log-3', date: new Date('2026-07-09'), depthMeters: 6.0, rockType: 'medium', waterIngress: 'minor', notes: 'Hit transition zone. Minor seepage.', photos: [], voiceNotes: [], loggedBy: '', synced: true, createdAt: new Date('2026-07-09') },
      ],
      milestones: [
        { id: 'ms-1', name: 'Site Assessment', targetDate: new Date('2026-06-15'), completedDate: new Date('2026-06-16'), status: 'completed', weight: 20 },
        { id: 'ms-2', name: 'Structural Inspection', targetDate: new Date('2026-07-15'), status: 'in_progress', weight: 30 },
        { id: 'ms-3', name: 'Rock Support Installation', targetDate: new Date('2026-08-15'), status: 'pending', weight: 30 },
        { id: 'ms-4', name: 'Final Commissioning', targetDate: new Date('2026-09-15'), status: 'pending', weight: 20 },
      ],
      safetyObservations: [
        { id: 'safe-1', type: 'hazard', description: 'Loose scaffolding on north face. Risk of falling objects.', severity: 'high', status: 'open', location: 'Shaft B', reportedBy: '', createdAt: new Date('2026-07-11') },
      ],
      procurementItems: [],
      activityFeed: [
        { id: 'act-1', type: 'document', content: 'Geological report approved by engineer', timestamp: new Date('2026-07-11T10:00:00'), userId: '' },
        { id: 'act-2', type: 'log', content: 'Daily progress logged: 8.5m depth', timestamp: new Date('2026-07-11T08:00:00'), userId: '' },
        { id: 'act-3', type: 'payment', content: 'Invoice #RMG-2026-0126 paid — $4,500', timestamp: new Date('2026-07-10T14:00:00'), userId: '' },
      ],
    },
    {
      id: 'proj-2', enquiryId: '', clientId: '', serviceId: 'drilling', title: 'Borehole Drilling — Farm 47', description: '120m borehole with casing and pump installation for irrigation.', status: 'completed', startDate: new Date('2026-05-01'), targetCompletion: new Date('2026-06-30'), actualCompletion: new Date('2026-07-05'), budgetUsd: 8500, invoicedUsd: 8500, paidUsd: 8500, healthScore: 100,
      dailyLogs: [],
      milestones: [
        { id: 'ms-5', name: 'Mobilization', targetDate: new Date('2026-05-01'), completedDate: new Date('2026-05-02'), status: 'completed', weight: 10 },
        { id: 'ms-6', name: 'Drilling Complete', targetDate: new Date('2026-06-15'), completedDate: new Date('2026-06-20'), status: 'completed', weight: 40 },
        { id: 'ms-7', name: 'Pump Installation', targetDate: new Date('2026-06-25'), completedDate: new Date('2026-06-28'), status: 'completed', weight: 30 },
        { id: 'ms-8', name: 'Water Quality Report', targetDate: new Date('2026-07-05'), completedDate: new Date('2026-07-05'), status: 'completed', weight: 20 },
      ],
      safetyObservations: [],
      procurementItems: [],
      activityFeed: [
        { id: 'act-4', type: 'document', content: 'Final drilling report and water quality certificate issued', timestamp: new Date('2026-07-05T16:00:00'), userId: '' },
      ],
    },
    {
      id: 'proj-3', enquiryId: 'lead-3', clientId: '', serviceId: 'fabrication', title: 'Headgear Fabrication — Trojan Mine', description: '10-tonne headgear fabrication and installation.', status: 'in_progress', startDate: new Date('2026-06-01'), targetCompletion: new Date('2026-09-01'), budgetUsd: 85000, invoicedUsd: 52000, paidUsd: 52000, healthScore: 55,
      dailyLogs: [],
      milestones: [
        { id: 'ms-9', name: 'Design Approval', targetDate: new Date('2026-06-10'), completedDate: new Date('2026-06-10'), status: 'completed', weight: 10 },
        { id: 'ms-10', name: 'Steel Delivery', targetDate: new Date('2026-07-20'), status: 'delayed', weight: 30 },
        { id: 'ms-11', name: 'Fabrication Complete', targetDate: new Date('2026-08-01'), status: 'pending', weight: 30 },
        { id: 'ms-12', name: 'Installation & Commissioning', targetDate: new Date('2026-09-01'), status: 'pending', weight: 30 },
      ],
      safetyObservations: [
        { id: 'safe-2', type: 'incident', description: 'Minor cut from unguarded tool. First aid applied.', severity: 'medium', status: 'resolved', location: 'Fabrication bay', reportedBy: '', resolvedBy: '', resolvedAt: new Date('2026-07-08'), createdAt: new Date('2026-07-08') },
      ],
      procurementItems: [
        {
          id: 'proc-1', name: 'Structural Steel (25 tonnes)', vendor: 'ZimSteel Ltd', poNumber: 'PO-2026-0042',
          stages: [
            { name: 'Ordered', completedAt: new Date('2026-06-02') },
            { name: 'Manufactured', completedAt: new Date('2026-06-25') },
            { name: 'Inspected', completedAt: new Date('2026-06-28') },
            { name: 'Shipped' },
            { name: 'Delivered' },
          ],
          currentStage: 'Inspected', expectedDelivery: new Date('2026-07-15'),
        },
      ],
      activityFeed: [
        { id: 'act-5', type: 'note', content: 'Steel inspection completed at factory. Shipping delayed — ETA Jul 22', timestamp: new Date('2026-07-10T09:00:00'), userId: '' },
      ],
    },
  ];

  for (const proj of projects) {
    batch.set(doc(db, 'projects', proj.id), { ...proj, createdAt: new Date('2026-06-01') });
  }

  const invoices = [
    { id: 'inv-1', quotationId: '', projectId: 'proj-1', invoiceNumber: 'RMG-2026-0126', amountUsd: 4500, amountPaid: 4500, status: 'paid', dueDate: new Date('2026-07-10'), paidAt: new Date('2026-07-10'), createdAt: new Date('2026-06-30') },
    { id: 'inv-2', quotationId: '', projectId: 'proj-1', invoiceNumber: 'RMG-2026-0134', amountUsd: 4200, amountPaid: 0, status: 'unpaid', dueDate: new Date('2026-08-01'), createdAt: new Date('2026-07-01') },
    { id: 'inv-3', quotationId: '', projectId: 'proj-3', invoiceNumber: 'RMG-2026-0145', amountUsd: 32000, amountPaid: 32000, status: 'paid', dueDate: new Date('2026-07-05'), paidAt: new Date('2026-07-04'), createdAt: new Date('2026-06-20') },
    { id: 'inv-4', quotationId: '', projectId: 'proj-3', invoiceNumber: 'RMG-2026-0151', amountUsd: 20000, amountPaid: 20000, status: 'paid', dueDate: new Date('2026-08-01'), paidAt: new Date('2026-07-25'), createdAt: new Date('2026-07-05') },
  ];

  for (const inv of invoices) {
    batch.set(doc(db, 'invoices', inv.id), inv);
  }

  const cmsPages = [
    { id: 'about', slug: 'about', title: 'About Us', content: [{ type: 'paragraph', data: { text: 'Ramangwana Mining Enterprise has been serving the Zimbabwe mining industry for over 12 years.' } }], isPublished: true, updatedBy: '' },
    { id: 'careers', slug: 'careers', title: 'Careers', content: [], isPublished: false, updatedBy: '' },
  ];

  for (const page of cmsPages) {
    batch.set(doc(db, 'cmsPages', page.id), { ...page, updatedAt: new Date() });
  }

  await batch.commit();
  return { success: true, services: services.length, courses: trainingCourses.length, packages: packages.length, tradeItems: tradeItems.length, enquiries: enquiries.length, projects: projects.length, invoices: invoices.length, batches: batches.length };
}
