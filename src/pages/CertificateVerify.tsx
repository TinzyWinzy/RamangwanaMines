import { useParams } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

export default function CertificateVerify() {
  const { certificateNumber } = useParams<{ certificateNumber: string }>();

  const isValid = certificateNumber?.startsWith('RMG-CERT-') || false;

  return (
    <div className="py-16 bg-gray-50 min-h-screen">
      <div className="max-w-lg mx-auto px-4">
        <Card padding="lg">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-primary-50 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isValid ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                )}
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              {isValid ? 'Certificate Verified' : 'Invalid Certificate'}
            </h2>
            <p className="text-gray-600 mt-2">
              {isValid
                ? `Certificate ${certificateNumber} is valid and authentic.`
                : `Certificate "${certificateNumber}" was not found in our records.`}
            </p>
            {isValid && (
              <div className="mt-6 text-left bg-gray-50 rounded-lg p-4 text-sm space-y-2">
                <div className="flex justify-between"><span className="text-gray-500">Certificate No.</span><span className="font-medium">{certificateNumber}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Issued By</span><span className="font-medium">Ramangwana Mining Enterprise</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Status</span><Badge variant="success">Valid</Badge></div>
              </div>
            )}
            {!isValid && (
              <p className="text-sm text-gray-500 mt-4">
                Please check the certificate number and try again. Contact us if you believe this is an error.
              </p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
