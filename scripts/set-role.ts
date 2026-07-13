/**
 * CLI tool to set a user's role via Firebase Admin SDK.
 *
 * Usage:
 *   npx tsx scripts/set-role.ts <uid|email> <role>
 *
 * Roles: client | project_manager | sales_rep | trainer | trainee | admin | super_admin
 *
 * Requires:
 *   - FIREBASE_SERVICE_ACCOUNT environment variable (JSON string or path to file)
 *   - or a service-account.json file in the project root
 *
 * Sets the role as a Firebase Auth custom claim AND writes it to Firestore users/{uid}.
 */

import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

const [uidOrEmail, roleArg] = process.argv.slice(2);

if (!uidOrEmail || !roleArg) {
  console.error('Usage: npx tsx scripts/set-role.ts <uid|email> <role>');
  process.exit(1);
}

const VALID_ROLES = ['client', 'project_manager', 'sales_rep', 'trainer', 'trainee', 'admin', 'super_admin'];

if (!VALID_ROLES.includes(roleArg)) {
  console.error(`Invalid role "${roleArg}". Must be one of: ${VALID_ROLES.join(', ')}`);
  process.exit(1);
}

async function main() {
  let serviceAccount: Record<string, unknown>;

  const envSa = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (envSa) {
    try {
      serviceAccount = JSON.parse(envSa);
    } catch {
      serviceAccount = JSON.parse(readFileSync(resolve(envSa), 'utf-8'));
    }
  } else if (existsSync(resolve('service-account.json'))) {
    serviceAccount = JSON.parse(readFileSync(resolve('service-account.json'), 'utf-8'));
  } else {
    console.error(
      'Missing Firebase service account credentials.\n' +
      'Set FIREBASE_SERVICE_ACCOUNT env var or place service-account.json in the project root.'
    );
    process.exit(1);
  }

  // Dynamic import to avoid requiring firebase-admin as a project dependency
  const { initializeApp, cert, getApps } = await import('firebase-admin/app');
  const { getAuth } = await import('firebase-admin/auth');
  const { getFirestore } = await import('firebase-admin/firestore');

  if (getApps().length === 0) {
    initializeApp({ credential: cert(serviceAccount as any) });
  }

  const adminAuth = getAuth();
  const adminDb = getFirestore();

  // Resolve UID from email if needed
  let uid = uidOrEmail;
  if (uidOrEmail.includes('@')) {
    try {
      const userRecord = await adminAuth.getUserByEmail(uidOrEmail);
      uid = userRecord.uid;
    } catch (err: any) {
      console.error(`User not found for email "${uidOrEmail}":`, err.message);
      process.exit(1);
    }
  }

  // Set custom claim
  await adminAuth.setCustomUserClaims(uid, { role: roleArg });
  console.log(`✓ Custom claim set: users/${uid} -> role="${roleArg}"`);

  // Write to Firestore
  await adminDb.collection('users').doc(uid).set({ role: roleArg }, { merge: true });
  console.log(`✓ Firestore updated: users/${uid}.role = "${roleArg}"`);

  console.log(`\nDone. User ${uidOrEmail} now has role "${roleArg}".`);
  console.log('The user must sign out and sign back in for the custom claim to take effect.');
}

main().catch(console.error);
