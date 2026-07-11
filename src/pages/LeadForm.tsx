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

  const preselectedService = searchParams.get('service') || '';

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
    // TODO: Submit to Firebase Firestore
    console.log('Form data:', data);
    await new Promise((r) => setTimeout(r, 1500));
    setIsSubmitting(false);
    navigate('/');
    alert('Your enquiry has been submitted. Our team will contact you shortly.');
  };

  const nextStep = () => {
    const fieldsToValidate: (keyof LeadFormData)[] =
      step === 1
        ? ['enquiryType']
        : step === 2
        ? ['fullName', 'companyName', 'phone', 'email']
        : [];
    // Simplified step progression
    setStep((s) => Math.min(s + 1, 3));
  };

  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  return (
    <div className="py-16 bg-gray-50 min-h-screen">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h1 className="section-title">Submit an Enquiry</h1>
          <p className="section-subtitle">Tell us about your project and our team will get back to you</p>
        </div>

        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                    s === step
                      ? 'bg-primary-500 text-white'
                      : s < step
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {s < step ? '✓' : s}
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
                <Select
                  label="Enquiry Type"
                  options={[
                    { value: 'quotation_request', label: 'Quotation Request' },
                    { value: 'consultation_booking', label: 'Consultation Booking' },
                    { value: 'project_brief', label: 'Project Brief Submission' },
                    { value: 'document_upload', label: 'Document Upload' },
                    { value: 'general_inquiry', label: 'General Inquiry' },
                    { value: 'training_enrollment', label: 'Training Enrollment' },
                  ]}
                  {...register('enquiryType')}
                  error={errors.enquiryType?.message}
                />
                <Select
                  label="Service Category"
                  options={[
                    { value: 'drilling', label: 'Drilling' },
                    { value: 'exploration', label: 'Exploration' },
                    { value: 'blasting', label: 'Blasting' },
                    { value: 'fabrication', label: 'Fabrication' },
                    { value: 'consultancy', label: 'Consultancy' },
                    { value: 'project_management', label: 'Project Management' },
                    { value: 'equipment_hire', label: 'Equipment Hire' },
                    { value: 'trade_center', label: 'Trade Center' },
                    { value: 'recruitment', label: 'Recruitment' },
                    { value: 'training', label: 'Training' },
                  ]}
                  {...register('serviceCategory')}
                />
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
                <Input label="WhatsApp Number" type="tel" {...register('whatsappNumber')} />
                <Select
                  label="How did you hear about us?"
                  options={[
                    { value: 'website', label: 'Website' },
                    { value: 'facebook', label: 'Facebook' },
                    { value: 'instagram', label: 'Instagram' },
                    { value: 'referral', label: 'Referral' },
                    { value: 'direct', label: 'Direct Contact' },
                    { value: 'google', label: 'Google Search' },
                  ]}
                  {...register('source')}
                />
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Project Details</h3>
                {enquiryType !== 'training_enrollment' && (
                  <>
                    <Input label="Project Location" {...register('projectLocation')} />
                    <Textarea
                      label="Project Description"
                      placeholder="Describe your project requirements, scope, and any specific needs..."
                      rows={4}
                      {...register('projectDescription')}
                    />
                    <div className="grid sm:grid-cols-2 gap-4">
                      <Select
                        label="Budget Range"
                        options={[
                          { value: '<$5K', label: 'Below $5,000' },
                          { value: '$5K-$20K', label: '$5,000 - $20,000' },
                          { value: '$20K-$50K', label: '$20,000 - $50,000' },
                          { value: '$50K+', label: '$50,000+' },
                          { value: 'Undisclosed', label: 'Undisclosed' },
                        ]}
                        {...register('budgetRange')}
                      />
                      <Select
                        label="Timeline"
                        options={[
                          { value: 'Immediate', label: 'Immediate' },
                          { value: '1-3 months', label: '1-3 months' },
                          { value: '3-6 months', label: '3-6 months' },
                          { value: '6+ months', label: '6+ months' },
                        ]}
                        {...register('timeline')}
                      />
                    </div>
                  </>
                )}
                {enquiryType === 'training_enrollment' && (
                  <p className="text-gray-600 text-sm">
                    You will be redirected to the training enrollment page. Please browse our courses first.
                  </p>
                )}
              </div>
            )}

            <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
              {step > 1 ? (
                <Button type="button" variant="ghost" onClick={prevStep}>
                  Back
                </Button>
              ) : (
                <div />
              )}
              {step < 3 ? (
                <Button type="button" variant="primary" onClick={nextStep}>
                  Continue
                </Button>
              ) : (
                <Button type="submit" variant="primary" isLoading={isSubmitting}>
                  Submit Enquiry
                </Button>
              )}
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
