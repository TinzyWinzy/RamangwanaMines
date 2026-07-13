export interface Service {
  id: string;
  name: string;
  slug: string;
  category: ServiceCategory;
  shortDescription: string;
  fullDescription: string;
  priceDisplay: string;
  features: ServiceFeature[];
  images: string[];
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
}

export type ServiceCategory =
  | 'drilling'
  | 'exploration'
  | 'fabrication'
  | 'blasting'
  | 'consultancy'
  | 'project_management'
  | 'equipment_hire'
  | 'trade_center'
  | 'recruitment'
  | 'training';

export interface ServiceFeature {
  icon: string;
  title: string;
  description: string;
}

export interface ServicePackage {
  id: string;
  serviceId: string;
  name: string;
  description: string;
  priceUsd: number;
  features: string[];
  isRecommended: boolean;
}

export type EnquiryType =
  | 'quotation_request'
  | 'consultation_booking'
  | 'document_upload'
  | 'project_brief'
  | 'general_inquiry'
  | 'training_enrollment';

export type LeadStatus =
  | 'new'
  | 'contacted'
  | 'qualified'
  | 'proposal_sent'
  | 'negotiating'
  | 'won'
  | 'lost'
  | 'archived';

export type LeadPriority = 'low' | 'medium' | 'high' | 'urgent';
export type LeadTier = 'hot' | 'warm' | 'cold';
export type LeadPersona = 'mine_operator' | 'investor' | 'training' | 'general';

export interface Enquiry {
  id: string;
  enquiryType: EnquiryType;
  serviceId: string;
  servicePackageId?: string;
  status: LeadStatus;
  priority: LeadPriority;
  fullName: string;
  companyName: string;
  phone: string;
  email: string;
  whatsappNumber?: string;
  projectLocation?: string;
  projectDescription?: string;
  budgetRange?: string;
  timeline?: 'Immediate' | '1-3 months' | '3-6 months' | '6+ months';
  documents: EnquiryDocument[];
  assignedTo?: string;
  source: string;
  leadScore: number;
  leadTier?: LeadTier;
  persona?: LeadPersona;
  notes?: string;
  followUpDate?: Date;
  trainingCourseId?: string;
  preferredBatchId?: string;
  createdAt: Date;
  updatedAt: Date;
  convertedToProjectId?: string;
  roiCalculation?: ROICalculation;
}

export interface ROICalculation {
  propertySize: number;
  targetMineral: string;
  budgetRange: string;
  recommendedPackage: string;
  recommendedPackageName: string;
  expectedYield: string;
  paybackMonths: number;
  estimatedCost: number;
  generatedAt: Date;
}

export interface EnquiryDocument {
  filename: string;
  url: string;
  type: string;
  uploadedAt: Date;
  reviewedBy?: string;
  reviewedAt?: Date;
  status: 'pending_review' | 'approved' | 'revision_requested';
  revisionNotes?: string;
  version: number;
  previousVersions?: { url: string; version: number; uploadedAt: Date }[];
}

export interface ConsultationBooking {
  id: string;
  enquiryId: string;
  preferredDate: Date;
  preferredTime: 'Morning' | 'Afternoon' | 'Any';
  meetingType: 'video_call' | 'phone_call' | 'site_visit' | 'office_visit';
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  confirmationSent: boolean;
  reminderSent: boolean;
  notes?: string;
  createdAt: Date;
}

export interface Project {
  id: string;
  enquiryId: string;
  clientId: string;
  serviceId: string;
  title: string;
  description: string;
  status: 'planning' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled';
  startDate: Date;
  targetCompletion: Date;
  actualCompletion?: Date;
  budgetUsd: number;
  invoicedUsd: number;
  paidUsd: number;
  projectManagerId: string;
  siteLocation?: { address: string; lat: number; lng: number };
  documents: EnquiryDocument[];
  createdAt: Date;
  healthScore: number;
  dailyLogs: DailyLog[];
  milestones: Milestone[];
  safetyObservations: SafetyObservation[];
  procurementItems: ProcurementItem[];
  activityFeed: ActivityFeedItem[];
}

export interface DailyLog {
  id: string;
  date: Date;
  depthMeters: number;
  rockType: string;
  waterIngress: string;
  photos: string[];
  voiceNotes: string[];
  notes: string;
  loggedBy: string;
  synced: boolean;
  createdAt: Date;
}

export interface Milestone {
  id: string;
  name: string;
  targetDate: Date;
  completedDate?: Date;
  status: 'pending' | 'in_progress' | 'completed' | 'delayed';
  weight: number;
}

export interface SafetyObservation {
  id: string;
  type: 'hazard' | 'near_miss' | 'incident' | 'observation';
  description: string;
  photoUrl?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'resolved' | 'escalated';
  location: string;
  reportedBy: string;
  resolvedBy?: string;
  resolutionNotes?: string;
  createdAt: Date;
  resolvedAt?: Date;
}

export interface ProcurementItem {
  id: string;
  name: string;
  vendor: string;
  poNumber: string;
  stages: ProcurementStage[];
  currentStage: string;
  expectedDelivery: Date;
  actualDelivery?: Date;
}

export interface ProcurementStage {
  name: string;
  completedAt?: Date;
  photoUrl?: string;
  notes?: string;
}

export interface ActivityFeedItem {
  id: string;
  type: 'log' | 'document' | 'milestone' | 'safety' | 'payment' | 'note';
  content: string;
  timestamp: Date;
  userId: string;
}

export interface Quotation {
  id: string;
  enquiryId: string;
  projectId?: string;
  quotationNumber: string;
  items: QuotationItem[];
  subtotal: number;
  vatAmount: number;
  total: number;
  terms: string;
  validUntil: Date;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
  pdfUrl?: string;
  createdAt: Date;
}

export interface QuotationItem {
  description: string;
  qty: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  id: string;
  quotationId: string;
  projectId: string;
  invoiceNumber: string;
  amountUsd: number;
  amountPaid: number;
  paynowPollUrl?: string;
  paynowStatus?: 'pending' | 'paid' | 'failed';
  status: 'unpaid' | 'partial' | 'paid' | 'overdue' | 'cancelled';
  dueDate: Date;
  paidAt?: Date;
  createdAt: Date;
}

export type UserRole = 'client' | 'project_manager' | 'sales_rep' | 'trainer' | 'trainee' | 'admin' | 'super_admin';

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  trainee: 0,
  client: 1,
  sales_rep: 2,
  trainer: 2,
  project_manager: 3,
  admin: 4,
  super_admin: 5,
};

export const ADMIN_ROLES: UserRole[] = ['admin', 'super_admin'];
export const STAFF_ROLES: UserRole[] = ['project_manager', 'sales_rep', 'trainer', 'admin', 'super_admin'];

export function hasMinRole(userRole: UserRole | null | undefined, minimumRole: UserRole): boolean {
  if (!userRole) return false;
  const userLevel = ROLE_HIERARCHY[userRole] ?? -1;
  const requiredLevel = ROLE_HIERARCHY[minimumRole] ?? 0;
  return userLevel >= requiredLevel;
}

export function isAdminRole(userRole: UserRole | null | undefined): boolean {
  return userRole === 'admin' || userRole === 'super_admin';
}

export interface AppUser {
  uid: string;
  name: string;
  phone: string;
  email: string;
  companyName?: string;
  role: UserRole;
  isActive: boolean;
  addresses: { label: string; address: string }[];
  createdAt: Date;
  certifications: UserCertification[];
}

export interface UserCertification {
  certificateNumber: string;
  courseTitle: string;
  issuedAt: Date;
  expiresAt: Date;
  certificateUrl: string;
  status: 'active' | 'expired' | 'revoked';
}

export interface TrainingCourse {
  id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription: string;
  category: string;
  duration: string;
  priceUsd: number;
  maxSeats: number;
  isCertification: boolean;
  certificationTitle?: string;
  syllabus: SyllabusModule[];
  prerequisites: string[];
  instructorId: string;
  thumbnailUrl: string;
  isActive: boolean;
  createdAt: Date;
}

export interface SyllabusModule {
  moduleNumber: number;
  title: string;
  description: string;
  duration: string;
  contentBlocks: ContentBlock[];
}

export interface ContentBlock {
  type: string;
  content: string;
  mediaUrl?: string;
}

export interface TrainingBatch {
  id: string;
  courseId: string;
  batchName: string;
  startDate: Date;
  endDate: Date;
  location: string;
  maxSeats: number;
  enrolledCount: number;
  status: 'open' | 'full' | 'in_progress' | 'completed' | 'cancelled';
  instructorId: string;
  schedule: BatchSchedule[];
  createdAt: Date;
}

export interface BatchSchedule {
  date: Date;
  moduleNumber: number;
  startTime: string;
  endTime: string;
  venue: string;
}

export interface TrainingEnrollment {
  id: string;
  userId: string;
  courseId: string;
  batchId: string;
  enquiryId?: string;
  status: 'enrolled' | 'in_progress' | 'completed' | 'dropped' | 'cancelled';
  progress: number;
  completedModules: number[];
  assessmentScores: AssessmentScore[];
  finalScore?: number;
  passed?: boolean;
  certificateUrl?: string;
  certificateIssuedAt?: Date;
  certificateNumber?: string;
  certificateExpiresAt?: Date;
  paymentStatus: 'pending' | 'paid' | 'waived';
  createdAt: Date;
  updatedAt: Date;
}

export interface AssessmentScore {
  moduleNumber: number;
  score: number;
  maxScore: number;
  passed: boolean;
  attemptedAt: Date;
}

export interface TrainingAssessment {
  id: string;
  courseId: string;
  moduleNumber: number;
  title: string;
  questions: AssessmentQuestion[];
  passingScore: number;
  timeLimit: number;
  createdAt: Date;
}

export interface AssessmentQuestion {
  question: string;
  type: 'multiple_choice' | 'true_false' | 'short_answer';
  options: string[];
  correctAnswer: string | number;
  points: number;
}

export interface ActivityLog {
  id: string;
  enquiryId?: string;
  projectId?: string;
  userId: string;
  type: string;
  direction: 'inbound' | 'outbound';
  content: string;
  createdAt: Date;
}

export interface CmsPage {
  id: string;
  slug: string;
  title: string;
  content: { type: string; data: object }[];
  isPublished: boolean;
  updatedAt: Date;
  updatedBy: string;
}

export interface ProjectHealth {
  score: number;
  status: 'on_track' | 'at_risk' | 'delayed' | 'critical';
  scheduleIndex: number;
  costIndex: number;
  qualityIndex: number;
  safetyIndex: number;
  lastCalculated: Date;
}
