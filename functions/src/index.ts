// Firebase Cloud Functions — Functions Index
// Deploy to: firebase deploy --only functions
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();
const db = admin.firestore();

// F7: Generate ROI Report
export const generateROIReport = functions.https.onCall(async (data: {
  propertySize: number;
  targetMineral: string;
  budgetRange: string;
  email: string;
}) => {
  const { propertySize, targetMineral, budgetRange, email } = data;

  const packages: Record<string, { name: string; price: number; includes: string[] }> = {
    small: { name: 'Remote Sensing Package', price: 500, includes: ['Satellite analysis', 'Desktop assessment'] },
    medium: { name: 'Exploration Survey Package', price: 1500, includes: ['On-site survey', 'Soil sampling', '3D modeling'] },
    large: { name: 'Full Scope Mining Assessment', price: 5000, includes: ['Drilling', 'Feasibility', 'Mine plan'] },
  };

  let tier = 'small';
  if (propertySize > 20 || budgetRange === '$5K-$20K') tier = 'medium';
  if (propertySize > 100 || budgetRange === '$20K-$50K' || budgetRange === '$50K+') tier = 'large';

  const pkg = packages[tier];

  await db.collection('roiReports').add({
    propertySize,
    targetMineral,
    budgetRange,
    recommendedPackage: tier,
    generatedAt: admin.firestore.FieldValue.serverTimestamp(),
    email,
    ...pkg,
  });

  return { success: true, recommendedPackage: pkg };
});

// F9: Calculate Project Health Score
export const calculateProjectHealth = functions.firestore
  .document('projects/{projectId}')
  .onWrite(async (change, context) => {
    const data = change.after.data();
    if (!data) return null;

    let scheduleIndex = 100;
    let costIndex = 100;
    let qualityIndex = 100;
    let safetyIndex = 100;

    // Schedule: delayed milestones reduce score
    const milestones = data.milestones || [];
    const delayedCount = milestones.filter((m: any) => m.status === 'delayed').length;
    scheduleIndex = milestones.length > 0
      ? 100 - (delayedCount / milestones.length) * 50
      : 100;

    // Cost: over budget reduces score
    if (data.budgetUsd > 0 && data.invoicedUsd > 0) {
      const ratio = data.invoicedUsd / data.budgetUsd;
      costIndex = ratio <= 1 ? 100 : Math.max(0, 100 - (ratio - 1) * 200);
    }

    // Safety: open incidents reduce score
    const safetyObs = data.safetyObservations || [];
    const openCritical = safetyObs.filter((o: any) => o.status === 'open' && o.severity === 'critical').length;
    safetyIndex = 100 - openCritical * 30;

    // Quality: documents pending review reduce score
    const docs = data.documents || [];
    const pendingReview = docs.filter((d: any) => d.status === 'pending_review').length;
    qualityIndex = 100 - pendingReview * 5;

    const healthScore = Math.round(
      scheduleIndex * 0.35 + costIndex * 0.25 + safetyIndex * 0.25 + qualityIndex * 0.15
    );

    let healthStatus = 'on_track';
    if (healthScore < 40) healthStatus = 'critical';
    else if (healthScore < 60) healthStatus = 'delayed';
    else if (healthScore < 75) healthStatus = 'at_risk';

    await change.after.ref.update({
      healthScore: Math.max(0, Math.min(100, healthScore)),
      healthStatus,
    });

    return null;
  });

// F11: Safety Alert Escalation
export const safetyAlertEscalation = functions.firestore
  .document('projects/{projectId}')
  .onWrite(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    if (!after) return null;

    const beforeObs = before?.safetyObservations || [];
    const afterObs = after.safetyObservations || [];

    const newCriticalObs = afterObs.filter(
      (o: any) => o.severity === 'critical' && o.status === 'open' &&
        !beforeObs.some((b: any) => b.id === o.id)
    );

    if (newCriticalObs.length > 0) {
      for (const obs of newCriticalObs) {
        console.log(`CRITICAL SAFETY ALERT: ${obs.description} at ${obs.location}`);
        // TODO: Send email/WhatsApp notification to admins
      }
    }

    return null;
  });

// F12: Procurement Stage Update Notification
export const procurementStageUpdate = functions.firestore
  .document('projects/{projectId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    if (!before || !after) return null;

    const beforeItems = before.procurementItems || [];
    const afterItems = after.procurementItems || [];

    for (const item of afterItems) {
      const beforeItem = beforeItems.find((b: any) => b.id === item.id);
      if (beforeItem && beforeItem.currentStage !== item.currentStage) {
        console.log(`Procurement update: ${item.name} moved to "${item.currentStage}"`);
        // TODO: Send notification to client
      }
    }

    return null;
  });

// F3: Generate Certificate
export const generateCertificate = functions.firestore
  .document('trainingEnrollments/{enrollmentId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    if (!after) return null;

    if (before?.passed !== true && after.passed === true) {
      const courseDoc = await db.collection('trainingCourses').doc(after.courseId).get();
      const course = courseDoc.data();

      const certNumber = `RMG-CERT-${new Date().getFullYear()}-${String(after.assessmentScores?.length || 0).padStart(4, '0')}`;

      const expiresAt = new Date();
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);

      await change.after.ref.update({
        certificateNumber: certNumber,
        certificateIssuedAt: admin.firestore.FieldValue.serverTimestamp(),
        certificateExpiresAt: expiresAt,
        certificateUrl: `https://firebasestorage.googleapis.com/certificates/${certNumber}.pdf`,
      });

      // Add to user's certification wallet
      const userDoc = await db.collection('users').doc(after.userId).get();
      const userData = userDoc.data();
      const certifications = userData?.certifications || [];

      certifications.push({
        certificateNumber: certNumber,
        courseTitle: course?.title || 'Unknown Course',
        issuedAt: new Date(),
        expiresAt,
        certificateUrl: `https://firebasestorage.googleapis.com/certificates/${certNumber}.pdf`,
        status: 'active',
      });

      await db.collection('users').doc(after.userId).update({ certifications });
    }

    return null;
  });

// F3: Verify Certificate
export const verifyCertificate = functions.https.onCall(async (data: { certificateNumber: string }) => {
  const { certificateNumber } = data;

  const enrollments = await db.collection('trainingEnrollments')
    .where('certificateNumber', '==', certificateNumber)
    .where('passed', '==', true)
    .limit(1)
    .get();

  if (enrollments.empty) {
    return { valid: false, message: 'Certificate not found' };
  }

  const enrollment = enrollments.docs[0].data();

  return {
    valid: true,
    certificateNumber,
    courseTitle: enrollment.courseId,
    issuedAt: enrollment.certificateIssuedAt?.toDate(),
    expiresAt: enrollment.certificateExpiresAt?.toDate(),
    status: enrollment.certificateExpiresAt?.toDate() > new Date() ? 'active' : 'expired',
  };
});

// Auto-create user profile on auth signup
export const createUserProfile = functions.auth.user().onCreate(async (user) => {
  await db.collection('users').doc(user.uid).set({
    name: user.displayName || '',
    phone: user.phoneNumber || '',
    email: user.email || '',
    role: 'client',
    isActive: true,
    addresses: [],
    certifications: [],
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
});

// Auto-calculate lead score
export const calculateLeadScore = functions.firestore
  .document('enquiries/{enquiryId}')
  .onCreate(async (snap, context) => {
    const data = snap.data();
    let score = 0;

    if (data.budgetRange && data.budgetRange !== 'Undisclosed') {
      if (data.budgetRange === '$50K+') score += 30;
      else if (data.budgetRange === '$20K-$50K') score += 20;
      else score += 10;
    }

    if (data.timeline && data.timeline !== '6+ months') {
      if (data.timeline === 'Immediate') score += 25;
      else score += 15;
    }

    if (data.projectDescription && data.projectDescription.length > 100) score += 15;
    if (data.email && data.phone) score += 10;
    if (data.documents && data.documents.length > 0) score += 10;
    if (data.companyName) score += 10;

    await snap.ref.update({
      leadScore: Math.min(100, score),
      priority: score >= 70 ? 'high' : score >= 40 ? 'medium' : 'low',
    });
  });

// WHATSAPP INTEGRATION

const WHATSAPP_API = 'https://graph.facebook.com/v19.0';
const ADMIN_WHATSAPP = '263775845795';

async function sendWhatsAppMessage(to: string, body: string, accessToken: string, phoneId: string) {
  const res = await fetch(`${WHATSAPP_API}/${phoneId}/messages`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'text',
      text: { preview_url: false, body },
    }),
  });
  return res.json();
}

// Send WhatsApp notification to admin when new enquiry is created
export const notifyAdminOnNewEnquiry = functions.firestore
  .document('enquiries/{enquiryId}')
  .onCreate(async (snap, context) => {
    const data = snap.data();
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    const phoneId = process.env.WHATSAPP_PHONE_ID;

    if (!accessToken || !phoneId) {
      console.log('WhatsApp not configured — skipping notification');
      return null;
    }

    const typeLabel = (data.enquiryType || '').replace(/_/g, ' ');
    const message = [
      `*🔔 New Enquiry — Ramangwana Mining*`,
      ``,
      `*From:* ${data.fullName}`,
      `*Company:* ${data.companyName}`,
      `*Phone:* ${data.phone}`,
      `*Email:* ${data.email}`,
      `*Type:* ${typeLabel.toUpperCase()}`,
    ];
    if (data.serviceId) message.push(`*Service:* ${data.serviceId}`);
    if (data.budgetRange) message.push(`*Budget:* ${data.budgetRange}`);
    if (data.timeline) message.push(`*Timeline:* ${data.timeline}`);

    try {
      await sendWhatsAppMessage(ADMIN_WHATSAPP, message.join('\n'), accessToken, phoneId);
      console.log(`WhatsApp notification sent for enquiry ${context.params.enquiryId}`);
    } catch (err) {
      console.error('WhatsApp notification failed:', err);
    }

    return null;
  });

// Send WhatsApp notification on payment confirmation
export const notifyPaymentWhatsApp = functions.firestore
  .document('invoices/{invoiceId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    if (!after) return null;

    if (before.status !== 'paid' && after.status === 'paid') {
      const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
      const phoneId = process.env.WHATSAPP_PHONE_ID;
      if (!accessToken || !phoneId) return null;

      const message = [
        `*✅ Payment Confirmed — Ramangwana Mining*`,
        ``,
        `*Invoice:* ${after.invoiceNumber}`,
        `*Amount:* $${(after.amountPaid || 0).toLocaleString()}`,
        ``,
        `Thank you for your payment.`,
        `_Ramangwana Mining Enterprise_`,
      ].join('\n');

      try {
        await sendWhatsAppMessage(ADMIN_WHATSAPP, message, accessToken, phoneId);
      } catch (err) {
        console.error('Payment WhatsApp notification failed:', err);
      }
    }

    return null;
  });

// WhatsApp Webhook — receive incoming messages and store in Firestore
export const whatsappWebhook = functions.https.onRequest(async (req, res) => {
  if (req.method === 'GET') {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];
    const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || 'ramangwana_webhook_2026';

    if (mode === 'subscribe' && token === verifyToken) {
      console.log('WhatsApp webhook verified');
      res.status(200).send(challenge);
    } else {
      res.status(403).send('Forbidden');
    }
    return;
  }

  if (req.method === 'POST') {
    const body = req.body;
    console.log('WhatsApp webhook received:', JSON.stringify(body));

    if (body.object === 'whatsapp_business_account') {
      for (const entry of (body.entry || [])) {
        for (const change of (entry.changes || [])) {
          if (change.field === 'messages') {
            const message = change.value?.messages?.[0];
            const contact = change.value?.contacts?.[0];

            if (message && contact) {
              const msgData = {
                from: contact.wa_id,
                fromName: contact.profile?.name || '',
                messageType: message.type,
                text: message.text?.body || '',
                timestamp: new Date(parseInt(message.timestamp) * 1000),
                messageId: message.id,
                direction: 'inbound',
              };

              await db.collection('whatsappMessages').add({
                ...msgData,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
              });

              console.log(`WhatsApp message stored from ${contact.wa_id}`);
            }
          }
        }
      }
    }

    res.status(200).send('OK');
    return;
  }

  res.status(405).send('Method Not Allowed');
});

// Send WhatsApp follow-up to client (callable from admin)
export const sendWhatsAppFollowUp = functions.https.onCall(async (data: {
  to: string;
  enquiryId: string;
}, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Must be logged in');

  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_ID;
  if (!accessToken || !phoneId) throw new functions.https.HttpsError('failed-precondition', 'WhatsApp not configured');

  const enquiryDoc = await db.collection('enquiries').doc(data.enquiryId).get();
  if (!enquiryDoc.exists) throw new functions.https.HttpsError('not-found', 'Enquiry not found');

  const enquiry = enquiryDoc.data();
  const message = [
    `*Ramangwana Mining — Follow-Up*`,
    ``,
    `Hi ${enquiry?.fullName},`,
    ``,
    `Thank you for your enquiry regarding ${(enquiry?.serviceId || 'our services').replace(/_/g, ' ')}. Our team would like to follow up on your request.`,
    ``,
    `Please reply to this message or call ${ADMIN_WHATSAPP} to discuss further.`,
    ``,
    `_Ramangwana Mining Enterprise_`,
  ].join('\n');

  const result = await sendWhatsAppMessage(data.to, message, accessToken, phoneId);

  await db.collection('activities').add({
    enquiryId: data.enquiryId,
    userId: context.auth.uid,
    type: 'whatsapp',
    direction: 'outbound',
    content: 'WhatsApp follow-up sent',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return { success: true, result };
});
