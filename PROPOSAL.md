# Ramangwana Mining Enterprise — Technical Mineral Resource Platform

**Live system:** https://ramangwana-mines.vercel.app/

---

## The Vision

Ramangwana Mining turns speculative claims into **bankable assets**.

This platform is not a CRM. It is not a project management tool. It is a **technical mineral resource analysis system** that bridges the gap between raw ground and investment-grade documentation — giving Isaac Mugwagwa the technology to match his engineering, and giving EU and diaspora investors the data they need to commit capital with confidence.

---

## Three Pillars — Built, Deployed, Working

### 1. Investment-Ready Asset Portal

Investors do not fund speculation. They fund data.

This portal takes raw geological records — drilling depth, rock type, water ingress, assay results — and structures them into a technical narrative. Every field log syncs from the mine site to the cloud automatically when Econet signal returns. The ROI calculator turns hectares, target mineral, and grade into projected revenue curves with payback timelines. A "Bankable Document" generator produces polished PDF investment summaries ready for EU-ZIM Business Forum presentations.

**What is live:**
- Offline-first geological field logger with IndexedDB → Firestore sync
- ROI calculator with real mineral pricing (gold, chrome, platinum, copper, diamond)
- Grade multiplier tables and revenue projection engine
- Client portal with project health rings, milestone tracking, budget visibility

### 2. Zero-Downtime Risk Dashboard

Rainy season does not have to mean production season stops.

The risk tracker monitors shaft water levels and structural integrity scores in real time. When a reading crosses the danger threshold — water at 60% of shaft depth, or structural score below 60% — push alerts fire instantly. Alerts persist across sessions and are logged to Firestore so supervisors see the history. The shaft support advisory panel connects directly to Ramangwana's civil works booking.

**What is live:**
- Real-time water level monitoring with Firestore persistence
- Automatic threshold-based alert generation (60%/80% water, 60% structural)
- Three-tier risk status display with colour-coded dashboards
- Browser Notification API alerts (phase 2 will add Firebase Cloud Messaging for closed-browser push)

### 3. Small-Scale Claim Formalization Engine

The difference between a $30K speculative claim and a $200K+ investment-grade asset is verified data.

The metrology workflow captures every drill run, every sample, every assay result in a structured chain of custody. The multiplier calculator demonstrates what professional drilling, blasting, and CIP installation do to a claim's valuation. Each project becomes a documented, verifiable asset.

**What is live:**
- Field logging with depth, rock type, water ingress, and geologist notes
- Photo capture and upload to Firebase Storage for diaspora investors
- Project document management with version history
- Real-time project health scoring via cloud function

---

## Role-Based Access Control — Implemented

| Role | Access |
|------|--------|
| **Super Admin** | Full system access, role management, user administration |
| **Admin** | All CRM, training, content, and analytics modules |
| **Project Manager** | Leads, projects, quotations, analytics |
| **Sales Rep** | Leads, consultations, WhatsApp, analytics |
| **Trainer** | Course management, grade book, assessments, certificates |
| **Client** | Personal project portal, documents, photos, training |
| **Trainee** | Course enrollment and assessment |

Route protection is enforced at the layout level. Sidebar sections hide automatically based on role. The `/admin/users` page lets super admins change user roles without the Firebase Console.

---

## By The Numbers

| Metric | Detail |
|--------|--------|
| **32 pages** | Public site, client portal, and admin dashboard |
| **7 user roles** | Hierarchical with permission matrix |
| **12 Firebase Cloud Functions** | Lead scoring, project health, certificate generation, WhatsApp notifications, ROI reports |
| **16 Firestore collections** | Services, enquiries, projects, quotations, invoices, training, users, CMS, trade, and more |
| **13 admin modules** | Dashboard, leads, consultations, quotations, projects, analytics, CMS, training, grade book, assessments, certificates, WhatsApp, role management |
| **4 offline-capable tools** | Field logging (IndexedDB), photo capture, document upload, progressive web app caching |
| **WhatsApp integration** | Inbound webhook, outbound messaging, admin notifications, payment confirmations |
| **PWA enabled** | Installable on any device, works offline via service worker |

---

## What Was Fixed In This Build (Phase 1)

Before this deployment, three features worked in the browser but lost data on refresh. They now persist end-to-end:

| Feature | Before | After |
|---------|--------|-------|
| **Field Logging** | Sync was a client-side flag — data never left IndexedDB | Pushes to Firestore `projects/{id}/dailyLogs` subcollection on sync |
| **Rainy-Season Tracker** | All readings lost on page refresh | Data persisted to Firestore in real time; alerts saved to localStorage |
| **Client Portal Photos** | "Sync" button showed a fake success toast | Photos upload to Firebase Storage, URLs saved to Firestore project documents |
| **Client Portal Documents** | Upload form showed a toast and did nothing | Files upload to Storage, document entries appended to project records |

---

## The Investment

**$4,500 USD total — system deployed, data live, team trained.**

Three payment structures:

| Option | Structure | Total |
|--------|-----------|-------|
| Accelerate | 100% upfront | **$4,500** |
| Milestone | 50% on start + 50% on launch | **$4,500** |
| Monthly | $750/mo for 6 months | **$4,500** |

**What $4,500 covers:**

- Full platform as described above — all 32 pages, all 12 cloud functions, all 7 roles
- WhatsApp Business API configuration (webhook, templates, follow-ups)
- RBAC with custom claims: set Isaac as super admin, assign staff roles
- Firebase project configuration, Firestore security rules, Storage buckets
- Photo upload pipeline with compression-ready client-side capture
- Data seeding with demo projects, leads, training courses
- Admin team training session (half-day, in-person or remote)
- 30 days of post-launch support and adjustments
- Ownership of the deployed system. No ongoing license fees.

**What it does not cover:**

- WhatsApp Cloud API access token (Meta charges separately, ~$0.005 per message)
- PayNow transaction fees (standard merchant rate)
- Custom domain registration (if you want app.yourcompany.co.zw)
- Firebase Cloud Messaging VAPID key setup (free, requires Google Cloud Console access)

**Recurring costs after launch:** Zero if you self-manage. Optional support retainer at $250/mo for priority maintenance, content updates, and feature additions.

---

## The ROI Math

| Line | Calculation | Value |
|------|-------------|-------|
| Leads recovered per month | 20 leads/mo × 20% recovery from auto-scoring | 4 deals |
| Revenue from recovered leads | 4 × $5,000 average deal | **$20,000/mo** |
| Hours saved per month | 70 hrs manual reporting + lead tracking | 70 hrs |
| Cost of hours saved | 70 × $25/hr blended staff cost | **$1,750/mo** |
| Training revenue captured | 15 certs/mo at $100 (digital, verifiable) | **$1,500/mo** |
| Diaspora investor deals | 2 deals/yr at $15K avg commitment | **$2,500/mo** |
| Procurement savings | 2% on $60,000 monthly spend | **$1,200/mo** |

**Total monthly value captured: $26,950**

**Investment recovery: within 5 days of deployment.**

If you only recover 10% of the estimated operational leakage, the system pays for itself in the first month.

---

## Deployment Timeline

| Phase | What Happens | Timeline |
|-------|-------------|----------|
| 1 — Foundation | Firebase config, domain, WhatsApp, PayNow | Day 1 |
| 2 — RBAC | Set custom claims, assign roles, test permissions | Day 1 |
| 3 — Seeding | Import real clients, projects, courses | Day 2 |
| 4 — Training | Admin team walkthrough of all modules | Day 2-3 |
| 5 — Launch | Go live with client access and public link | Day 3 |
| 6 — Optimization | Adjust workflows based on first-week usage | Week 2 |

---

## The Gap You Close By Signing

| Before | After |
|--------|-------|
| Field data on paper, arrives days late | Digital logs visible from Harare in real time |
| Leads scattered across WhatsApp threads | Leads scored, tiered, and pipelined with automated follow-up |
| Investors see no data, commit no capital | PDF investment summaries with verified grade curves |
| Client calls asking "what is happening" | Client portal showing live health ring and milestones |
| Diaspora investors wire money and hope | Real-time photo updates from site to London/Johannesburg |
| Rainy season means downtime | Water level alerts trigger proactive civil works |
| Printed certificates expire in drawers | Verifiable digital certificates, public by URL |
| $20K-$35K monthly revenue leakage | System pays for itself in week one |

---

## Contact

**Isaac Mugwagwa** — CEO, Ramangwana Mining Enterprise
info@ramangwanamines.co.zw | +263 77 584 5795

**Built by** — Radbit Studios, Harare

---

*"We do not lease. We partner. We do not extract. We embed."*
