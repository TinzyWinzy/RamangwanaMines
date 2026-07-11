# Ramangwana Mining Enterprise — Digital Operations Portal

**Live site:** [https://ramangwana-mines.vercel.app/](https://ramangwana-mines.vercel.app/)

---

A single platform that manages leads, projects, safety, training, procurement,
client communication, and e-commerce — accessible from any device, online or
offline.

---

## Modules

| Module | Purpose |
|--------|---------|
| Client Portal | Real-time project health scores, milestone tracking, budget burn, field log viewer |
| Lead CRM | Multi-channel lead intake (web form + WhatsApp), auto lead scoring (0–100), full pipeline workflow |
| Training Academy | Course catalog, batch enrollment, module-based progress, auto-generated certificates, public verification |
| Trade Center | Mining consumables e-commerce — pumps, PPE, generators, explosives |
| Safety System | Hazard/near-miss/incident logging with auto-escalation for critical events |
| Procurement Tracker | Multi-stage tracking: ordered → manufactured → inspected → shipped → delivered |
| Document Control | Versioned upload with approval / revision workflow |
| ROI Calculator | Instant exploration payback estimate by mineral and budget, captures qualified leads |
| Admin Suite | Dashboard, analytics (conversion funnel, revenue, sources), CMS, assessment builder, grade book, WhatsApp message viewer |

---

## Technical Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite 5, Tailwind CSS |
| Backend | Firebase (Firestore, Auth, Cloud Functions, Storage) |
| State | Zustand |
| Payments | PayNow (Zimbabwe) — ready to configure |
| Notifications | WhatsApp Cloud API (Meta) — ready to configure |
| PWA | Installable, works offline, auto-updates |
| Hosting | Vercel — auto-deploys from GitHub on push |

---

## Current Status

- [x] Frontend deployed and live
- [x] Firebase project configured (Auth, Firestore, Storage)
- [x] Firestore security rules deployed
- [x] PWA enabled with offline support
- [ ] Deploy Cloud Functions (`firebase deploy --only functions`)
- [ ] Configure WhatsApp access token and phone ID
- [ ] Configure PayNow integration ID and key
- [ ] Set up custom domain (optional)

---

## Contact

**Ramangwana Mining Enterprise**

Email: info@ramangwanamines.co.zw
Phone: +263 77 584 5795
WhatsApp: +263 77 584 5795

---

## Demo Walkthrough

A video walkthrough of the live site is available. It covers:

1. **Public experience** — landing page, services, enquiry form, ROI calculator,
   training catalog, certificate verification
2. **Client portal** — login, project command centre, field logs, documents,
   certification wallet
3. **Admin backend** — dashboard, CRM pipeline, analytics, projects, procurement,
   safety, training admin, assessment builder, grade book, WhatsApp inbox

The full system is live at the link above. Walk through any module in real time.
