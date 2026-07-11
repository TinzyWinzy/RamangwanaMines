const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || '263775845795';
const WHATSAPP_API_URL = 'https://graph.facebook.com/v19.0';

export function getWhatsAppNumber(): string {
  return WHATSAPP_NUMBER;
}

export function buildWaLink(phone: string, message: string): string {
  const clean = phone.replace(/[^0-9]/g, '');
  return `https://wa.me/${clean}?text=${encodeURIComponent(message)}`;
}

export function openWhatsApp(phone: string, message: string): void {
  window.open(buildWaLink(phone, message), '_blank');
}

export function formatLeadMessage(data: {
  fullName: string;
  companyName: string;
  phone: string;
  email: string;
  enquiryType: string;
  serviceId?: string;
  projectDescription?: string;
  budgetRange?: string;
  timeline?: string;
}): string {
  const typeLabel = data.enquiryType.replace(/_/g, ' ');
  const lines = [
    `*New Enquiry — Ramangwana Mining*`,
    ``,
    `*From:* ${data.fullName}`,
    `*Company:* ${data.companyName}`,
    `*Phone:* ${data.phone}`,
    `*Email:* ${data.email}`,
    `*Type:* ${typeLabel.toUpperCase()}`,
  ];
  if (data.serviceId) lines.push(`*Service:* ${data.serviceId.replace(/_/g, ' ')}`);
  if (data.projectDescription) lines.push(`*Project:* ${data.projectDescription}`);
  if (data.budgetRange) lines.push(`*Budget:* ${data.budgetRange}`);
  if (data.timeline) lines.push(`*Timeline:* ${data.timeline}`);
  lines.push(``, `_Sent via Ramangwana Portal_`);
  return lines.join('\n');
}

export function formatConsultationReminder(data: {
  clientName: string;
  date: string;
  time: string;
  meetingType: string;
}): string {
  return [
    `*Consultation Reminder — Ramangwana Mining*`,
    ``,
    `Hi ${data.clientName},`,
    ``,
    `This is a reminder for your consultation:`,
    `*Date:* ${data.date}`,
    `*Time:* ${data.time}`,
    `*Type:* ${data.meetingType.replace(/_/g, ' ')}`,
    ``,
    `Please confirm your availability.`,
    ``,
    `_Ramangwana Mining Enterprise_`,
  ].join('\n');
}

export function formatPaymentConfirmation(data: {
  clientName: string;
  invoiceNumber: string;
  amount: string;
}): string {
  return [
    `*Payment Confirmed — Ramangwana Mining*`,
    ``,
    `Hi ${data.clientName},`,
    ``,
    `Payment received for:`,
    `*Invoice:* ${data.invoiceNumber}`,
    `*Amount:* ${data.amount}`,
    ``,
    `Thank you for your business.`,
    ``,
    `_Ramangwana Mining Enterprise_`,
  ].join('\n');
}

export function formatProjectUpdate(data: {
  clientName: string;
  projectTitle: string;
  progress: number;
  update: string;
}): string {
  return [
    `*Project Update — Ramangwana Mining*`,
    ``,
    `*Project:* ${data.projectTitle}`,
    `*Progress:* ${data.progress}%`,
    ``,
    `${data.update}`,
    ``,
    `Log in to your portal for full details.`,
    ``,
    `_Ramangwana Mining Enterprise_`,
  ].join('\n');
}

export async function sendWhatsAppTemplate(
  to: string,
  templateName: string,
  parameters: { type: string; text: string }[]
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const accessToken = import.meta.env.VITE_WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = import.meta.env.VITE_WHATSAPP_PHONE_ID;

  if (!accessToken || !phoneNumberId) {
    return { success: false, error: 'WhatsApp Cloud API not configured. Add VITE_WHATSAPP_ACCESS_TOKEN and VITE_WHATSAPP_PHONE_ID to .env' };
  }

  try {
    const response = await fetch(
      `${WHATSAPP_API_URL}/${phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to,
          type: 'template',
          template: {
            name: templateName,
            language: { code: 'en' },
            components: [
              {
                type: 'body',
                parameters: parameters.map((p) => ({
                  type: p.type,
                  text: p.text,
                })),
              },
            ],
          },
        }),
      }
    );
    const data = await response.json();
    return { success: response.ok, messageId: data.messages?.[0]?.id, error: data.error?.message };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function sendWhatsAppText(
  to: string,
  message: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const accessToken = import.meta.env.VITE_WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = import.meta.env.VITE_WHATSAPP_PHONE_ID;

  if (!accessToken || !phoneNumberId) {
    return { success: false, error: 'WhatsApp Cloud API not configured' };
  }

  try {
    const response = await fetch(
      `${WHATSAPP_API_URL}/${phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to,
          type: 'text',
          text: { preview_url: false, body: message },
        }),
      }
    );
    const data = await response.json();
    return { success: response.ok, messageId: data.messages?.[0]?.id, error: data.error?.message };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
