import { useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Textarea } from '../components/ui/Textarea';
import { Card } from '../components/ui/Card';
import toast from 'react-hot-toast';
import { createDoc } from '../lib/db';
import { openWhatsApp, getWhatsAppNumber, formatLeadMessage } from '../lib/whatsapp';

const leadFormSchema = z.object({
  serviceType: z.string().min(1, 'Select a service'),
  enquiryType: z.string().min(1, 'Select an enquiry type'),
  projectLocation: z.string().min(1, 'Project location is required'),
  projectDescription: z.string().min(10, 'Please describe your project briefly'),
  targetMineral: z.string().optional(),
  currentChallenges: z.string().optional(),
  budgetRange: z.string().optional(),
  timeline: z.string().optional(),
  investorName: z.string().optional(),
  investmentSize: z.string().optional(),
  diasporaCountry: z.string().optional(),
  referralSource: z.string().optional(),
  fullName: z.string().min(2, 'Name is required'),
  companyName: z.string().optional(),
  phone: z.string().regex(/^(0\d{9}|\+263\d{9})$/, 'Enter a valid Zimbabwe number (e.g. 0771234567)'),
  email: z.string().email('Valid email is required'),
  whatsappNumber: z.string().optional(),
  source: z.string().optional(),
});

type LeadFormData = z.infer<typeof leadFormSchema>;

type Persona = 'mine_operator' | 'investor' | 'training' | 'general';

function detectPersona(data: Partial<LeadFormData>): Persona {
  if (data.serviceType === 'training') return 'training';
  if (data.serviceType === 'consultancy' || data.serviceType === 'borehole' || data.enquiryType === 'investor_info' || data.enquiryType === 'site_assessment') return 'investor';
  if (['drilling', 'blasting', 'fabrication', 'shaft_support', 'project_management', 'trade_center'].includes(data.serviceType || '')) return 'mine_operator';
  return 'general';
}

function calculateLeadScore(data: Partial<LeadFormData>): number {
  let score = 0;

  const budgetScores: Record<string, number> = { '<$10K': 5, '$10K-$50K': 10, '$50K-$200K': 15, '$200K-$500K': 20, '$500K+': 25 };
  score += budgetScores[data.budgetRange || ''] || 0;

  const timelineScores: Record<string, number> = { 'Immediate': 20, '1-3 months': 15, '3-6 months': 10, '6+ months': 5 };
  score += timelineScores[data.timeline || ''] || 0;

  const serviceScores: Record<string, number> = {
    drilling: 18, exploration: 18, shaft_support: 16,
    consultancy: 14, project_management: 14,
    blasting: 12, fabrication: 12, borehole: 12,
    trade_center: 8, training: 8, other: 5,
  };
  score += serviceScores[data.serviceType || ''] || 5;

  if (data.projectLocation && data.projectLocation.length > 2) score += 10;
  if ((data.projectDescription || '').length > 25) score += 10;
  if (data.whatsappNumber && data.whatsappNumber.length > 5) score += 5;
  if (data.targetMineral) score += 5;
  if (data.currentChallenges && data.currentChallenges.length > 10) score += 5;

  return score;
}

const SERVICE_OPTIONS = [
  { value: 'drilling', label: 'Drilling & Exploration', keywords: 'Drilling, core, RC, exploration, resource' },
  { value: 'blasting', label: 'Blasting & Demolition', keywords: 'Blasting, explosives, controlled demo' },
  { value: 'fabrication', label: 'Fabrication & Steel Structures', keywords: 'Headgear, steel, fabrication, structural' },
  { value: 'shaft_support', label: 'Shaft Support & Civil Works', keywords: 'Shaft, reinforcement, civil, weatherproofing' },
  { value: 'consultancy', label: 'Mining Consultancy & Advisory', keywords: 'Consulting, feasibility, valuation, advisory' },
  { value: 'project_management', label: 'Project Management', keywords: 'Management, oversight, scheduling' },
  { value: 'training', label: 'Training & Certification', keywords: 'Training, blasting licence, certification' },
  { value: 'borehole', label: 'Borehole Drilling (Water)', keywords: 'Borehole, water, drilling, diaspora' },
  { value: 'trade_center', label: 'Trade Center / Equipment', keywords: 'Equipment, hire, trade, machinery' },
  { value: 'other', label: 'Other', keywords: '' },
];

const ENQUIRY_OPTIONS: Record<string, { value: string; label: string }[]> = {
  mine_operator: [
    { value: 'quotation', label: 'Request a Quote' },
    { value: 'site_assessment', label: 'Request Site Assessment' },
    { value: 'consultation', label: 'Book a Consultation' },
    { value: 'general', label: 'General Inquiry' },
  ],
  investor: [
    { value: 'site_assessment', label: 'Claim / Site Assessment' },
    { value: 'investor_info', label: 'Investor Information Pack' },
    { value: 'consultation', label: 'Book a Consultation' },
    { value: 'quotation', label: 'Request a Quote' },
  ],
  training: [
    { value: 'individual_enrollment', label: 'Individual Enrollment' },
    { value: 'group_enrollment', label: 'Group / Company Enrollment' },
    { value: 'course_info', label: 'Request Course Information' },
  ],
  general: [
    { value: 'quotation', label: 'Request a Quote' },
    { value: 'consultation', label: 'Book a Consultation' },
    { value: 'site_assessment', label: 'Request Site Assessment' },
    { value: 'general', label: 'General Inquiry' },
  ],
};

const MINERAL_OPTIONS = [
  { value: 'gold', label: 'Gold' },
  { value: 'chrome', label: 'Chrome' },
  { value: 'lithium', label: 'Lithium' },
  { value: 'coal', label: 'Coal' },
  { value: 'platinum', label: 'Platinum / PGM' },
  { value: 'dimension_stone', label: 'Dimension Stone / Granite' },
  { value: 'other', label: 'Other' },
];

const BUDGET_OPTIONS = [
  { value: '<$10K', label: 'Below $10,000' },
  { value: '$10K-$50K', label: '$10,000 - $50,000' },
  { value: '$50K-$200K', label: '$50,000 - $200,000' },
  { value: '$200K-$500K', label: '$200,000 - $500,000' },
  { value: '$500K+', label: '$500,000+' },
  { value: 'Undisclosed', label: 'Prefer not to say' },
];

const TIMELINE_OPTIONS = [
  { value: 'Immediate', label: 'Immediate — as soon as possible' },
  { value: '1-3 months', label: 'This quarter (1-3 months)' },
  { value: '3-6 months', label: 'Next quarter (3-6 months)' },
  { value: '6+ months', label: 'Planning stage (6+ months)' },
];

const CHALLENGE_OPTIONS = [
  { value: 'valuation', label: 'Claim valuation / proving resource' },
  { value: 'downtime', label: 'Rainy season flooding / shaft collapse' },
  { value: 'equipment', label: 'Equipment breakdown / outdated plant' },
  { value: 'compliance', label: 'Licensing / regulatory compliance' },
  { value: 'training', label: 'Workforce training & certification' },
  { value: 'investment', label: 'Attracting investors / raising capital' },
  { value: 'other', label: 'Other' },
];

function LeadScoreBadge({ score }: { score: number }) {
  if (score >= 50) {
    return (
      <span className="inline-flex items-center gap-1.5 bg-green-500/15 text-green-600 text-xs font-semibold px-3 py-1.5 rounded-full border border-green-200">
        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
        Hot Lead ({score})
      </span>
    );
  }
  if (score >= 30) {
    return (
      <span className="inline-flex items-center gap-1.5 bg-yellow-500/15 text-yellow-600 text-xs font-semibold px-3 py-1.5 rounded-full border border-yellow-200">
        <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full" />
        Warm Lead ({score})
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-500 text-xs font-semibold px-3 py-1.5 rounded-full border border-gray-200">
      New Lead ({score})
    </span>
  );
}

const stepFields: Record<number, (keyof LeadFormData)[]> = {
  1: ['serviceType', 'enquiryType', 'projectLocation', 'projectDescription', 'targetMineral', 'currentChallenges', 'budgetRange', 'timeline', 'investorName', 'investmentSize', 'diasporaCountry', 'referralSource'],
  2: ['fullName', 'companyName', 'phone', 'email', 'whatsappNumber', 'source'],
};

export default function LeadForm() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedData, setSubmittedData] = useState<LeadFormData | null>(null);
  const [enquiryId, setEnquiryId] = useState('');

  const preselectedService = searchParams.get('service') || '';

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    trigger,
  } = useForm<LeadFormData>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: {
      serviceType: preselectedService || '',
      source: 'website',
    },
  });

  const formValues = watch();
  const persona = useMemo(() => detectPersona(formValues), [formValues.serviceType, formValues.enquiryType]);
  const leadScore = useMemo(() => calculateLeadScore(formValues), [formValues]);

  const enquiryOptions = ENQUIRY_OPTIONS[persona] || ENQUIRY_OPTIONS.general;

  const handleNextStep = async () => {
    const fields = stepFields[1];
    const isValid = await trigger(fields);
    if (isValid) setStep(2);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      await handleNextStep();
      return;
    }
    const step2Valid = await trigger(stepFields[2]);
    if (!step2Valid) return;
    const allValid = await trigger();
    if (!allValid) return;
    handleSubmit(onSubmit)(e);
  };

  const onSubmit = async (data: LeadFormData) => {
    setIsSubmitting(true);
    try {
      const detectedPersona = detectPersona(data);
      const score = calculateLeadScore(data);
      const id = await createDoc('enquiries', {
        ...data,
        status: 'new',
        persona: detectedPersona,
        leadScore: score,
        leadTier: score >= 50 ? 'hot' : score >= 30 ? 'warm' : 'cold',
        priority: score >= 50 ? 'high' : score >= 30 ? 'medium' : 'low',
        documents: [],
        budgetRange: data.budgetRange || 'Undisclosed',
      });
      setEnquiryId(id);
      setSubmittedData(data);
      setSubmitted(true);
      toast.success('Enquiry submitted successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to submit enquiry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendWhatsApp = () => {
    if (!submittedData) return;
    const detectedPersona = detectPersona(submittedData);
    const message = formatLeadMessage({
      fullName: submittedData.fullName,
      companyName: submittedData.companyName || '',
      phone: submittedData.phone,
      email: submittedData.email,
      enquiryType: submittedData.enquiryType,
      serviceId: submittedData.serviceType,
      projectDescription: submittedData.projectDescription,
      budgetRange: submittedData.budgetRange,
      timeline: submittedData.timeline,
    });
    const header = `*${detectedPersona === 'investor' ? 'INVESTOR' : detectedPersona === 'training' ? 'TRAINING' : 'MINE OPERATOR'} LEAD — Score: ${calculateLeadScore(submittedData)}*\n\n`;
    openWhatsApp(getWhatsAppNumber(), header + message);
    navigate('/');
  };

  const handleShareOwnCopy = () => {
    if (!submittedData) return;
    const number = submittedData.whatsappNumber || submittedData.phone;
    const detectedPersona = detectPersona(submittedData);

    let nextSteps = 'Our team will contact you within 24 hours.';
    if (detectedPersona === 'investor') nextSteps = 'We will prepare an investor pack and get back to you within 24 hours.';
    if (detectedPersona === 'training') nextSteps = 'We will send course schedules and enrolment details within 24 hours.';

    const message = [
      `Thank you for contacting Ramangwana Mining.`,
      ``,
      `Reference: ${enquiryId.slice(0, 8).toUpperCase()}`,
      `Service: ${submittedData.serviceType.replace(/_/g, ' ')}`,
      `Location: ${submittedData.projectLocation}`,
      ``,
      nextSteps,
      ``,
      `For urgent inquiries, call +263 775 845 795`,
      ``,
      `Ramangwana Mining Enterprise`,
      `No. 4 Cumberland Rd, Eastlea, Harare`,
    ].join('\n');
    openWhatsApp(number, message);
  };

  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  const personaLabel = useMemo(() => {
    const labels: Record<Persona, string> = {
      mine_operator: 'Mine Operator',
      investor: 'Investor / Claim Holder',
      training: 'Training Seeker',
      general: 'General Inquiry',
    };
    return formValues.serviceType ? labels[persona] : '';
  }, [persona, formValues.serviceType]);

  const score = leadScore;

  return (
    <div className="py-16 bg-gray-50 min-h-screen">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h1 className="section-title">Tell Us About Your Project</h1>
          <p className="section-subtitle">We&apos;ll respond within 24 hours with a tailored proposal</p>
        </div>

        {submitted ? (
          <Card padding="lg" className="text-center">
            <div className="w-16 h-16 mx-auto bg-green-50 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Enquiry Received</h2>
            <p className="text-gray-600 mt-2">
              Reference: <span className="font-mono font-semibold">{enquiryId.slice(0, 8).toUpperCase()}</span>
            </p>

            <div className="mt-4 bg-gray-50 rounded-xl p-4 text-left text-sm text-gray-600 space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Service</span>
                <span className="capitalize">{submittedData?.serviceType.replace(/_/g, ' ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Location</span>
                <span>{submittedData?.projectLocation}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Contact</span>
                <span>{submittedData?.phone}</span>
              </div>
              {submittedData && calculateLeadScore(submittedData) > 0 && (
                <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                  <span className="font-medium">Lead Priority</span>
                  <LeadScoreBadge score={calculateLeadScore(submittedData)} />
                </div>
              )}
            </div>

            {(() => {
              const p = submittedData ? detectPersona(submittedData) : 'general';
              return (
                <div className="mt-4 bg-primary-50 border border-primary-100 rounded-xl p-4 text-left text-sm">
                  <p className="font-semibold text-primary-800">What happens next</p>
                  <ul className="mt-2 space-y-1.5 text-primary-700">
                    {p === 'investor' && (
                      <>
                        <li className="flex items-start gap-2">
                          <svg className="w-4 h-4 text-primary-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                          Our advisory team will prepare an investor information pack
                        </li>
                        <li className="flex items-start gap-2">
                          <svg className="w-4 h-4 text-primary-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                          We will schedule a consultation to discuss your investment goals
                        </li>
                      </>
                    )}
                    {p === 'training' && (
                      <>
                        <li className="flex items-start gap-2">
                          <svg className="w-4 h-4 text-primary-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                          Our training coordinator will send course schedules &amp; fees
                        </li>
                        <li className="flex items-start gap-2">
                          <svg className="w-4 h-4 text-primary-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                          Enrollment forms will be shared via WhatsApp or email
                        </li>
                      </>
                    )}
                    {p === 'mine_operator' && (
                      <>
                        <li className="flex items-start gap-2">
                          <svg className="w-4 h-4 text-primary-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                          A project manager will review your requirements
                        </li>
                        <li className="flex items-start gap-2">
                          <svg className="w-4 h-4 text-primary-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                          We will contact you within 24 hours with a preliminary scope
                        </li>
                      </>
                    )}
                    {p === 'general' && (
                      <li className="flex items-start gap-2">
                        <svg className="w-4 h-4 text-primary-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        A team member will respond within 24 hours
                      </li>
                    )}
                  </ul>
                </div>
              );
            })()}

            <p className="text-gray-500 text-xs mt-4">
              For urgent matters, call <strong>+263 775 845 795</strong>
            </p>

            <div className="mt-6 space-y-3">
              <Button
                variant="primary"
                className="w-full"
                leftIcon={
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                }
                onClick={handleSendWhatsApp}
              >
                Forward to Ramangwana on WhatsApp
              </Button>
              <Button variant="outline" className="w-full" onClick={handleShareOwnCopy}>
                Send Confirmation to My WhatsApp
              </Button>
              <Button variant="ghost" className="w-full" onClick={() => setSubmitted(false)}>
                Submit Another Enquiry
              </Button>
            </div>
          </Card>
        ) : (
          <>
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                {[1, 2].map((s) => (
                  <div key={s} className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                      s === step ? 'bg-primary-500 text-white' : s < step ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
                    }`}>
                      {s < step ? '\u2713' : s}
                    </div>
                    {s < 2 && <div className={`w-12 h-1 ${s < step ? 'bg-green-500' : 'bg-gray-200'}`} />}
                  </div>
                ))}
                <span className="text-xs text-gray-400 ml-1">{step === 1 ? 'Project Details' : 'Contact Info'}</span>
              </div>

              {personaLabel && step === 1 && (
                <div className="flex items-center gap-2">
                  <LeadScoreBadge score={score} />
                  <span className="hidden sm:inline text-xs text-gray-400 font-medium uppercase tracking-wider bg-gray-100 px-2 py-1 rounded-full">
                    {personaLabel}
                  </span>
                </div>
              )}
            </div>

            <Card padding="lg">
              <form onSubmit={handleFormSubmit}>
                {step === 1 && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">What can we help you with?</h3>
                      {personaLabel && (
                        <p className="text-xs text-gray-400 mt-1">
                          Detected as: <span className="font-medium text-primary-500">{personaLabel}</span>
                        </p>
                      )}
                    </div>

                    <Select label="Service Needed *" options={SERVICE_OPTIONS} {...register('serviceType')} error={errors.serviceType?.message} />

                    <Select label="Enquiry Type" options={enquiryOptions} {...register('enquiryType')} error={errors.enquiryType?.message} />

                    {persona === 'investor' && (
                      <>
                        <Input label="Investor / Diaspora Name" {...register('investorName')} placeholder="Your name or organisation" />
                        <Select label="Investment Size" options={[
                          { value: '<$10K', label: 'Below $10,000' },
                          { value: '$10K-$50K', label: '$10,000 - $50,000' },
                          { value: '$50K-$200K', label: '$50,000 - $200,000' },
                          { value: '$200K+', label: '$200,000+' },
                        ]} {...register('investmentSize')} />
                        <Select label="Based in (diaspora)" options={[
                          { value: 'uk', label: 'United Kingdom' },
                          { value: 'sa', label: 'South Africa' },
                          { value: 'usa', label: 'United States / Canada' },
                          { value: 'eu', label: 'Europe' },
                          { value: 'au', label: 'Australia / New Zealand' },
                          { value: 'other', label: 'Other' },
                          { value: 'local', label: 'Based in Zimbabwe' },
                        ]} {...register('diasporaCountry')} />
                        <Input label="Project Location *" {...register('projectLocation')} placeholder="e.g. Kadoma, Shurugwi, Mazowe" error={errors.projectLocation?.message} />
                        <Textarea label="Investment Interest / Requirements" placeholder="What type of mining asset or project are you looking to invest in? Any specific requirements?" rows={3} {...register('projectDescription')} error={errors.projectDescription?.message} />
                      </>
                    )}

                    {persona === 'mine_operator' && (
                      <>
                        <Input label="Project Location *" {...register('projectLocation')} placeholder="e.g. Kadoma, Shurugwi, Mazowe, Harare" error={errors.projectLocation?.message} />
                        <Select label="Target Mineral" options={MINERAL_OPTIONS} {...register('targetMineral')} />
                        <Select label="Main Challenge *" options={CHALLENGE_OPTIONS} {...register('currentChallenges')} />
                        <Textarea label="Project Description *" placeholder="Describe your operation, current setup, and what you need help with..." rows={3} {...register('projectDescription')} error={errors.projectDescription?.message} />
                        <div className="grid sm:grid-cols-2 gap-4">
                          <Select label="Budget Range" options={BUDGET_OPTIONS} {...register('budgetRange')} />
                          <Select label="Timeline" options={TIMELINE_OPTIONS} {...register('timeline')} />
                        </div>
                      </>
                    )}

                    {persona === 'training' && (
                      <>
                        <Input label="Course Interested In *" {...register('projectDescription')} placeholder="e.g. Mine Blasting Licence, Grade Control, Shaft Safety" error={errors.projectDescription?.message} />
                        <Input label="Location / Province" {...register('projectLocation')} placeholder="Where are you based?" />
                        <div className="grid sm:grid-cols-2 gap-4">
                          <Select label="Enrolment Type" options={[
                            { value: 'individual', label: 'Just myself' },
                            { value: 'group_2_5', label: 'Small group (2-5 people)' },
                            { value: 'group_6_plus', label: 'Large group (6+ people)' },
                            { value: 'company', label: 'Company / team booking' },
                          ]} {...register('currentChallenges')} />
                          <Select label="Preferred Start" options={[
                            { value: 'Immediate', label: 'As soon as possible' },
                            { value: 'this_month', label: 'Within this month' },
                            { value: 'next_month', label: 'Next month' },
                            { value: 'undecided', label: 'Still deciding' },
                          ]} {...register('timeline')} />
                        </div>
                      </>
                    )}

                    {persona === 'general' && (
                      <>
                        <Input label="Project Location" {...register('projectLocation')} placeholder="e.g. Kadoma, Harare, or N/A" error={errors.projectLocation?.message} />
                        <Textarea label="Your Message *" placeholder="Tell us what you need help with..." rows={4} {...register('projectDescription')} error={errors.projectDescription?.message} />
                      </>
                    )}
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900">Your Contact Details</h3>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <Input label="Full Name *" {...register('fullName')} error={errors.fullName?.message} />
                      <Input label="Company Name (optional)" {...register('companyName')} placeholder="Leave blank if individual" />
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <Input label="Phone Number *" type="tel" {...register('phone')} placeholder="e.g. 077 123 4567" error={errors.phone?.message} />
                      <Input label="Email Address *" type="email" {...register('email')} error={errors.email?.message} />
                    </div>

                    <Input label="WhatsApp Number (recommended)" type="tel" {...register('whatsappNumber')} placeholder="Same or different — we'll use this for quick updates" />

                    <Select label="How did you hear about us?" options={[
                      { value: 'website', label: 'Website / Google Search' },
                      { value: 'facebook', label: 'Facebook' },
                      { value: 'referral', label: 'Referral / Word of Mouth' },
                      { value: 'direct', label: 'Called / Walked In' },
                      { value: 'whatsapp', label: 'WhatsApp' },
                      { value: 'expo', label: 'Business Expo / Event' },
                      { value: 'other', label: 'Other' },
                    ]} {...register('source')} />
                  </div>
                )}

                <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
                  {step > 1 ? (
                    <Button type="button" variant="ghost" onClick={prevStep}>Back</Button>
                  ) : (
                    <div />
                  )}
                  <div className="flex items-center gap-3">
                    {step === 2 && score >= 30 && (
                      <span className="hidden sm:inline text-xs text-gray-400">
                        High-priority enquiry
                      </span>
                    )}
                    <Button type="submit" variant="primary" isLoading={isSubmitting}>
                      {step < 2 ? 'Continue' : 'Submit Enquiry'}
                    </Button>
                  </div>
                </div>
              </form>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
