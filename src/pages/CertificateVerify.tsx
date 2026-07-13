import { useParams } from 'react-router-dom';
import { useFirestoreCollection } from '../hooks/useFirestore';
import { where } from '../lib/db';
import { PageSpinner } from '../components/ui/Spinner';
import { Button } from '../components/ui/Button';
import { openWhatsApp } from '../lib/whatsapp';
import { useRef } from 'react';

function formatVerifyDate(ts: any): string {
  if (!ts) return '';
  const d = ts.toDate?.() || new Date(ts);
  return d.toLocaleDateString('en-ZW', { year: 'numeric', month: 'long', day: 'numeric' });
}

function CertificateCard({ cert }: { cert: any }) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleShare = () => {
    const url = window.location.href;
    const msg = `✅ Verified Certificate\n\n${cert.traineeName} has successfully completed *${cert.courseName}*.\n\nCertificate No: ${cert.certificateNumber}\nIssued by: Ramangwana Mining Enterprise\n\nVerify online: ${url}`;
    openWhatsApp('', msg);
  };

  const handlePrint = () => window.print();

  return (
    <div className="space-y-6">
      {/* Certificate Card */}
      <div ref={cardRef} className="relative bg-white rounded-3xl overflow-hidden print:shadow-none" style={{
        boxShadow: '0 25px 60px -12px rgba(0,0,0,0.25), 0 0 0 1px rgba(0,0,0,0.05)',
        background: 'linear-gradient(135deg, #fff 0%, #f9fafb 100%)',
      }}>
        {/* Top accent bar */}
        <div className="h-2 bg-gradient-to-r from-primary-600 via-primary-500 to-accent" />

        {/* Corner ornaments */}
        <div className="absolute top-8 left-8 w-16 h-16 border-t-4 border-l-4 border-primary-200 rounded-tl-xl opacity-60" />
        <div className="absolute top-8 right-8 w-16 h-16 border-t-4 border-r-4 border-primary-200 rounded-tr-xl opacity-60" />
        <div className="absolute bottom-8 left-8 w-16 h-16 border-b-4 border-l-4 border-primary-200 rounded-bl-xl opacity-60" />
        <div className="absolute bottom-8 right-8 w-16 h-16 border-b-4 border-r-4 border-primary-200 rounded-br-xl opacity-60" />

        {/* Content */}
        <div className="px-12 py-10 text-center">
          {/* Header */}
          <div className="flex items-center justify-center gap-3 mb-2">
            <img src="/logo.jpg" alt="Ramangwana" className="h-12 w-12 rounded-lg object-cover" />
            <div className="text-left">
              <div className="text-sm font-bold text-gray-800 tracking-wide">RAMANGWANA</div>
              <div className="text-xs text-gray-500 tracking-wider">MINING ENTERPRISE</div>
            </div>
          </div>

          <div className="mt-6 mb-2">
            <p className="text-xs font-semibold tracking-[0.2em] text-gray-400 uppercase">Certificate of Achievement</p>
          </div>

          <div className="w-24 h-px bg-gradient-to-r from-transparent via-primary-400 to-transparent mx-auto mb-6" />

          <p className="text-gray-500 text-sm mb-1">This is to certify that</p>
          <h2 className="text-4xl font-bold text-secondary mb-4" style={{ fontFamily: 'Georgia, serif', letterSpacing: '-0.5px' }}>
            {cert.traineeName}
          </h2>

          <p className="text-gray-500 text-sm mb-1">has successfully completed</p>
          <h3 className="text-xl font-bold text-primary-600 mb-6">{cert.courseName}</h3>

          {cert.certificationTitle && (
            <div className="inline-flex items-center gap-2 bg-primary-50 border border-primary-200 rounded-full px-5 py-2 mb-6">
              <svg className="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
              <span className="text-sm font-semibold text-primary-700">{cert.certificationTitle}</span>
            </div>
          )}

          <div className="w-24 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent mx-auto mb-6" />

          {/* Footer details */}
          <div className="grid grid-cols-3 gap-6 text-center text-xs text-gray-500 mb-4">
            <div>
              <div className="text-sm font-bold text-gray-700">{formatVerifyDate(cert.issuedAt)}</div>
              <div className="tracking-wide uppercase mt-0.5">Date Issued</div>
            </div>
            <div>
              <div className="text-sm font-bold text-gray-700 font-mono">{cert.certificateNumber}</div>
              <div className="tracking-wide uppercase mt-0.5">Certificate No.</div>
            </div>
            <div>
              <div className="text-sm font-bold text-gray-700">{cert.grade || 'Pass'}</div>
              <div className="tracking-wide uppercase mt-0.5">Grade</div>
            </div>
          </div>

          {/* Seal */}
          <div className="flex items-center justify-center mt-2">
            <div className="w-16 h-16 rounded-full border-4 border-primary-500 flex items-center justify-center bg-primary-50">
              <svg className="w-8 h-8 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Bottom accent bar */}
        <div className="h-1 bg-gradient-to-r from-primary-600 via-accent to-primary-600" />
      </div>

      {/* Verification badge */}
      <div className="flex items-center justify-center gap-3 bg-green-50 border border-green-200 rounded-2xl px-6 py-4">
        <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div>
          <p className="font-bold text-green-800">✅ VERIFIED — Authentic Certificate</p>
          <p className="text-xs text-green-600">This certificate was issued by Ramangwana Mining Enterprise and is digitally verified.</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <Button
          variant="primary"
          className="flex-1"
          leftIcon={
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
          }
          onClick={handleShare}
        >
          Share via WhatsApp
        </Button>
        <Button variant="outline" onClick={handlePrint}>Print / Save PDF</Button>
      </div>

      <p className="text-xs text-center text-gray-400">
        Verify this certificate independently at: <span className="font-mono">{window.location.href}</span>
      </p>
    </div>
  );
}

export default function CertificateVerify() {
  const { certificateNumber } = useParams<{ certificateNumber: string }>();
  const { data: certs, isLoading } = useFirestoreCollection<any>('certificates', [
    where('certificateNumber', '==', certificateNumber || ''),
  ]);

  const cert = certs[0];

  return (
    <div className="py-16 bg-gray-50 min-h-screen">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h1 className="section-title">Certificate Verification</h1>
          <p className="section-subtitle">Independently verifiable — no login required</p>
          {certificateNumber && (
            <p className="text-sm text-gray-400 mt-1 font-mono">#{certificateNumber}</p>
          )}
        </div>

        {isLoading ? (
          <div className="py-16"><PageSpinner /></div>
        ) : cert ? (
          <CertificateCard cert={cert} />
        ) : (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900">Certificate Not Found</h2>
            <p className="text-gray-500 mt-2 text-sm">
              No certificate found for <span className="font-mono font-semibold">{certificateNumber}</span>.
            </p>
            <p className="text-gray-400 text-xs mt-3">If you believe this is an error, contact Ramangwana Mining Enterprise directly.</p>
          </div>
        )}
      </div>
    </div>
  );
}
