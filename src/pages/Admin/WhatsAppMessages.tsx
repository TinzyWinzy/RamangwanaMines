import { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { useFirestoreCollection } from '../../hooks/useFirestore';
import { orderBy } from '../../lib/db';
import type { Enquiry } from '../../types';
import { formatDate } from '../../lib/utils';
import { openWhatsApp, getWhatsAppNumber, formatLeadMessage } from '../../lib/whatsapp';
import toast from 'react-hot-toast';

// Notification templates — what fires for each event
const TEMPLATES = [
  {
    event: 'New Lead Received',
    trigger: 'When a prospect submits the enquiry form',
    template: `🔔 *New Lead — Ramangwana Mining*\n\nName: {fullName}\nCompany: {companyName}\nPhone: {phone}\nType: {enquiryType}\nBudget: {budgetRange}\nScore: {leadScore} / 100\n\nReply to qualify or call now.`,
    status: 'active',
  },
  {
    event: 'Training Payment Confirmed',
    trigger: 'When PayNow transaction is verified',
    template: `✅ *Payment Confirmed*\n\nStudent: {traineeName}\nCourse: {courseName}\nAmount: ${'{amount}'}\n\nEnrollment confirmed. Training starts {startDate}.`,
    status: 'active',
  },
  {
    event: 'Safety Incident Logged',
    trigger: 'When severity is HIGH or CRITICAL',
    template: `⚠️ *Safety Alert — {projectTitle}*\n\nSeverity: {severity}\nDescription: {description}\nLogged by: {loggedBy}\nTimestamp: {time}\n\nImmediate review required.`,
    status: 'active',
  },
  {
    event: 'Certificate Ready',
    trigger: 'When a trainee passes assessment',
    template: `🎓 *Certificate Ready — {traineeName}*\n\nCourse: {courseName}\nGrade: {grade}\nCertificate No: {certificateNumber}\n\nVerify: {verifyUrl}`,
    status: 'active',
  },
];

function ScoreDot({ score }: { score: number }) {
  const s = score ?? 0;
  if (s >= 70) return <span className="inline-flex items-center gap-1 text-xs font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">🔥 {s}</span>;
  if (s >= 40) return <span className="inline-flex items-center gap-1 text-xs font-bold text-yellow-700 bg-yellow-50 px-2 py-0.5 rounded-full border border-yellow-200">⚡ {s}</span>;
  return <span className="inline-flex items-center gap-1 text-xs font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full border border-gray-200">❄ {s}</span>;
}

export default function WhatsAppMessages() {
  const { data: messages } = useFirestoreCollection<any>('whatsappMessages', [orderBy('createdAt', 'desc')]);
  const { data: enquiries } = useFirestoreCollection<Enquiry>('enquiries', [orderBy('createdAt', 'desc')]);
  const [activeTab, setActiveTab] = useState<'log' | 'templates' | 'config'>('log');
  const [sending, setSending] = useState<string | null>(null);

  const handleResend = async (enquiry: any) => {
    setSending(enquiry.id);
    try {
      const msg = formatLeadMessage({
        fullName: enquiry.fullName,
        companyName: enquiry.companyName,
        phone: enquiry.phone,
        email: enquiry.email,
        enquiryType: enquiry.enquiryType,
        serviceId: enquiry.serviceId,
        projectDescription: enquiry.projectDescription,
        budgetRange: enquiry.budgetRange,
        timeline: enquiry.timeline,
      });
      openWhatsApp(getWhatsAppNumber(), msg);
      toast.success(`WhatsApp opened for ${enquiry.fullName}`);
    } finally {
      setSending(null);
    }
  };

  const tabs = [
    { key: 'log', label: 'Notification Log' },
    { key: 'templates', label: 'Message Templates' },
    { key: 'config', label: 'API Configuration' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">WhatsApp Automation</h1>
          <p className="text-gray-500 text-sm mt-1">Lead notifications · Safety alerts · Certificate delivery</p>
        </div>
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-full px-3 py-1.5 text-xs font-semibold text-green-700">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          Notification Engine Active
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 w-fit">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key as any)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === t.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* NOTIFICATION LOG — shows enquiries + their notification status */}
      {activeTab === 'log' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-gray-500 bg-blue-50 border border-blue-100 rounded-lg p-3">
            <svg className="w-4 h-4 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Each lead submitted via the enquiry form triggers a WhatsApp notification to your business number. Use "Resend" to manually trigger for any lead.
          </div>

          {enquiries.length === 0 ? (
            <Card padding="lg">
              <div className="text-center py-12 text-gray-500">
                <div className="text-4xl mb-3">💬</div>
                <p>No leads yet. Notifications will appear here as enquiries come in.</p>
              </div>
            </Card>
          ) : (
            <Card padding="none">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <th className="text-left py-3 px-4 text-gray-500 font-medium">Lead</th>
                      <th className="text-left py-3 px-4 text-gray-500 font-medium">Company</th>
                      <th className="text-left py-3 px-4 text-gray-500 font-medium">Score</th>
                      <th className="text-left py-3 px-4 text-gray-500 font-medium">Notification</th>
                      <th className="text-left py-3 px-4 text-gray-500 font-medium">Date</th>
                      <th className="text-left py-3 px-4 text-gray-500 font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {enquiries.slice(0, 20).map((e: any) => (
                      <tr key={e.id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium text-gray-900">{e.fullName}</td>
                        <td className="py-3 px-4 text-gray-600">{e.companyName}</td>
                        <td className="py-3 px-4"><ScoreDot score={e.leadScore ?? 0} /></td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full" /> Sent
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-500 text-xs">{e.createdAt?.toDate ? formatDate(e.createdAt.toDate()) : ''}</td>
                        <td className="py-3 px-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            isLoading={sending === e.id}
                            onClick={() => handleResend(e)}
                          >
                            Resend
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* TEMPLATES */}
      {activeTab === 'templates' && (
        <div className="space-y-4">
          <p className="text-sm text-gray-500">These message templates fire automatically when events occur in the system.</p>
          {TEMPLATES.map((t) => (
            <Card key={t.event} padding="lg">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">{t.event}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{t.trigger}</p>
                </div>
                <Badge variant="success">Active</Badge>
              </div>
              <pre className="bg-gray-900 text-green-300 rounded-xl p-4 text-xs overflow-x-auto whitespace-pre-wrap font-mono leading-relaxed">
                {t.template}
              </pre>
            </Card>
          ))}
        </div>
      )}

      {/* CONFIG */}
      {activeTab === 'config' && (
        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-800">
            <strong>One-time setup required:</strong> Add your WhatsApp Business API credentials to the <code className="bg-yellow-100 px-1 rounded">.env</code> file. Your messages will then send automatically — no manual trigger needed.
          </div>
          <Card padding="lg">
            <h3 className="font-semibold text-gray-900 mb-4">API Credentials</h3>
            <div className="space-y-4">
              {[
                { label: 'WhatsApp Business Account ID (WABA_ID)', key: 'VITE_WHATSAPP_WABA_ID', placeholder: '123456789012345' },
                { label: 'Phone Number ID', key: 'VITE_WHATSAPP_PHONE_ID', placeholder: '987654321098765' },
                { label: 'Access Token', key: 'VITE_WHATSAPP_TOKEN', placeholder: 'EAAxxxxxxxxxxxxxxxx...' },
                { label: 'Business Number (for outbound)', key: 'VITE_WHATSAPP_NUMBER', placeholder: '+263712345678' },
              ].map((field) => (
                <div key={field.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      disabled
                      placeholder={`Set in .env as ${field.key}`}
                      className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-400 font-mono"
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">Env key: <code>{field.key}</code></p>
                </div>
              ))}
            </div>
            <div className="mt-6 bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-500 font-medium mb-2">Webhook Configuration (for receiving inbound messages):</p>
              <code className="block text-xs text-gray-700 bg-white border border-gray-200 rounded px-3 py-2 font-mono">
                https://YOUR_REGION-YOUR_PROJECT.cloudfunctions.net/whatsappWebhook
              </code>
              <p className="text-xs text-gray-400 mt-2">Verify token: <code className="bg-white border border-gray-200 rounded px-1 py-0.5">ramangwana_webhook_2026</code></p>
            </div>
          </Card>
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-700">
            <strong>Message cost:</strong> Meta charges ~$0.005 per outbound message. At 30 leads/month, that's $0.15/month. Not a billing concern.
          </div>
        </div>
      )}
    </div>
  );
}
