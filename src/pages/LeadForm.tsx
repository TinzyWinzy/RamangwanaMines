import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Textarea } from '../components/ui/Textarea';
import { Card } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { createDoc } from '../lib/db';
import { openWhatsApp, getWhatsAppNumber, formatLeadMessage } from '../lib/whatsapp';

const leadFormSchema = z.object({
  enquiryType: z.string().min(1, 'Select an inquiry type'),
  serviceCategory: z.string().optional(),
  fullName: z.string().min(2, 'Name is required'),
  companyName: z.string().min(1, 'Company name is required'),
  phone: z.string().min(8, 'Phone number is required'),
  email: z.string().email('Valid email is required'),
  whatsappNumber: z.string().optional(),
  projectLocation: z.string().optional(),
  projectDescription: z.string().optional(),
  budgetRange: z.string().optional(),
  timeline: z.string().optional(),
  source: z.string().optional(),
});

type LeadFormData = z.infer<typeof leadFormSchema>;

export default function LeadForm() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedData, setSubmittedData] = useState<LeadFormData | null>(null);
  const [enquiryId, setEnquiryId] = useState('');

  const preselectedService = searchParams.get('service') || '';
  const preselectedPackage = searchParams.get('package') || '';

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<LeadFormData>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: {
      enquiryType: preselectedService ? 'quotation_request' : '',
      serviceCategory: preselectedService,
      source: 'website',
    },
  });

  const enquiryType = watch('enquiryType');

  const onSubmit = async (data: LeadFormData) => {
    setIsSubmitting(true);
    try {
      const id = await createDoc('enquiries', {
        ...data,
        status: 'new',
        priority: data.budgetRange === '$50K+' ? 'high' : 'medium',
        leadScore: 0,
        documents: [],
        budgetRange: data.budgetRange || 'Undisclosed',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      setEnquiryId(id);
      setSubmittedData(data);
      setSubmitted(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendWhatsApp = () => {
    if (!submittedData) return;
    const message = formatLeadMessage({
      fullName: submittedData.fullName,
      companyName: submittedData.companyName,
      phone: submittedData.phone,
      email: submittedData.email,
      enquiryType: submittedData.enquiryType,
      serviceCategory: submittedData.serviceCategory,
      projectDescription: submittedData.projectDescription,
      budgetRange: submittedData.budgetRange,
      timeline: submittedData.timeline,
    });
    const clientWhatsApp = submittedData.whatsappNumber || submittedData.phone;
    openWhatsApp(getWhatsAppNumber(), message);
    navigate('/');
  };

  const handleShareOwnCopy = () => {
    if (!submittedData) return;
    const message = `Thank you for your enquiry to Ramangwana Mining! We have received your request and will contact you shortly.\n\nEnquiry summary: ${submittedData.enquiryType.replace(/_/g, ' ')} - ${submittedData.serviceCategory?.replace(/_/g, ' ') || ''}\n\nYour reference: ${enquiryId.slice(0, 8)}`;
    const clientWhatsApp = submittedData.whatsappNumber || submittedData.phone;
    openWhatsApp(clientWhatsApp, message);
  };

  const nextStep = () => setStep((s) => Math.min(s + 1, 3));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  return (
    <div className="py-16 bg-gray-50 min-h-screen">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h1 className="section-title">Submit an Enquiry</h1>
          <p className="section-subtitle">Tell us about your project — we'll respond within 24 hours</p>
        </div>

        {submitted ? (
          <Card padding="lg" className="text-center">
            <div className="w-16 h-16 mx-auto bg-green-50 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Enquiry Submitted!</h2>
            <p className="text-gray-600 mt-2">Reference: <span className="font-mono font-semibold">{enquiryId.slice(0, 8)}</span></p>
            <p className="text-gray-500 text-sm mt-1">Our team will contact you shortly.</p>

            <div className="mt-8 space-y-3">
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
                Send Enquiry via WhatsApp
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={handleShareOwnCopy}
              >
                Get Copy on My WhatsApp
              </Button>
              <Button variant="ghost" className="w-full" onClick={() => setSubmitted(false)}>
                Submit Another Enquiry
              </Button>
            </div>
          </Card>
        ) : (
          <>
            <div className="flex justify-center mb-8">
              <div className="flex items-center gap-2">
                {[1, 2, 3].map((s) => (
                  <div key={s} className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                      s === step ? 'bg-primary-500 text-white' : s < step ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
                    }`}>
                      {s < step ? '\u2713' : s}
                    </div>
                    {s < 3 && <div className={`w-12 h-1 ${s < step ? 'bg-green-500' : 'bg-gray-200'}`} />}
                  </div>
                ))}
              </div>
            </div>

            <Card padding="lg">
              <form onSubmit={handleSubmit(onSubmit)}>
                {step === 1 && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900">What do you need?</h3>
                    <Select label="Enquiry Type" options={[
                      { value: 'quotation_request', label: 'Quotation Request' },
                      { value: 'consultation_booking', label: 'Consultation Booking' },
                      { value: 'project_brief', label: 'Project Brief Submission' },
                      { value: 'document_upload', label: 'Document Upload' },
                      { value: 'general_inquiry', label: 'General Inquiry' },
                      { value: 'training_enrollment', label: 'Training Enrollment' },
                    ]} {...register('enquiryType')} error={errors.enquiryType?.message} />
                    <Select label="Service Category" options={[
                      { value: 'drilling', label: 'Drilling' }, { value: 'exploration', label: 'Exploration' },
                      { value: 'blasting', label: 'Blasting' }, { value: 'fabrication', label: 'Fabrication' },
                      { value: 'consultancy', label: 'Consultancy' }, { value: 'project_management', label: 'Project Management' },
                      { value: 'equipment_hire', label: 'Equipment Hire' }, { value: 'trade_center', label: 'Trade Center' },
                      { value: 'recruitment', label: 'Recruitment' }, { value: 'training', label: 'Training' },
                    ]} {...register('serviceCategory')} />
                    {preselectedPackage && (
                      <div className="bg-primary-50 border border-primary-200 rounded-lg p-3 text-sm text-primary-700">
                        Selected package: <strong>{preselectedPackage}</strong>
                      </div>
                    )}
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900">Your Contact Details</h3>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <Input label="Full Name *" {...register('fullName')} error={errors.fullName?.message} />
                      <Input label="Company Name *" {...register('companyName')} error={errors.companyName?.message} />
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <Input label="Phone Number *" type="tel" {...register('phone')} error={errors.phone?.message} />
                      <Input label="Email Address *" type="email" {...register('email')} error={errors.email?.message} />
                    </div>
                    <Input label="WhatsApp Number (optional)" type="tel" {...register('whatsappNumber')} placeholder="We'll use this for faster communication" />
                    <Select label="How did you hear about us?" options={[
                      { value: 'website', label: 'Website' }, { value: 'facebook', label: 'Facebook' },
                      { value: 'instagram', label: 'Instagram' }, { value: 'referral', label: 'Referral' },
                      { value: 'direct', label: 'Direct Contact' }, { value: 'google', label: 'Google Search' },
                      { value: 'whatsapp', label: 'WhatsApp' },
                    ]} {...register('source')} />
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900">Project Details</h3>
                    {enquiryType !== 'training_enrollment' && (
                      <>
                        <Input label="Project Location" {...register('projectLocation')} />
                        <Textarea label="Project Description" placeholder="Describe your project requirements, scope, and any specific needs..." rows={4} {...register('projectDescription')} />
                        <div className="grid sm:grid-cols-2 gap-4">
                          <Select label="Budget Range" options={[
                            { value: '<$5K', label: 'Below $5,000' }, { value: '$5K-$20K', label: '$5,000 - $20,000' },
                            { value: '$20K-$50K', label: '$20,000 - $50,000' }, { value: '$50K+', label: '$50,000+' },
                            { value: 'Undisclosed', label: 'Undisclosed' },
                          ]} {...register('budgetRange')} />
                          <Select label="Timeline" options={[
                            { value: 'Immediate', label: 'Immediate' }, { value: '1-3 months', label: '1-3 months' },
                            { value: '3-6 months', label: '3-6 months' }, { value: '6+ months', label: '6+ months' },
                          ]} {...register('timeline')} />
                        </div>
                      </>
                    )}
                    {enquiryType === 'training_enrollment' && (
                      <p className="text-gray-600 text-sm">You'll be redirected to course selection after submission.</p>
                    )}
                  </div>
                )}

                <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
                  {step > 1 ? <Button type="button" variant="ghost" onClick={prevStep}>Back</Button> : <div />}
                  {step < 3 ? (
                    <Button type="button" variant="primary" onClick={nextStep}>Continue</Button>
                  ) : (
                    <Button type="submit" variant="primary" isLoading={isSubmitting}>Submit Enquiry</Button>
                  )}
                </div>
              </form>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
