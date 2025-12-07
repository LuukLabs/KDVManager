# KDVManager Daycare MVP Scope

## Snapshot of the Current Platform
- **Architecture**: Microservices (CRM, Scheduling) with shared contracts and infrastructure, exposed via Envoy API Gateway.
- **Frontend**: React 19 SPA with Material UI, React Query, and i18next, positioned for a product-led growth motion.
- **Operations & Observability**: Containerized deployment to Kubernetes with ArgoCD and SigNoz/OpenTelemetry, enabling rapid, instrumented releases.

This foundation already covers customer/contact management, schedule planning, and strong DevOps pipelines. The MVP now targets small Dutch daycare operators migrating from Excel-based administration—typically one location with up to three groups and 120 planned children. The product must reduce manual spreadsheets, simplify regulatory tasks, and stay lightweight enough for owner-led adoption.

## Product-Led Growth Guardrails
For a product-led sales motion serving Excel-reliant daycares in the Netherlands, the MVP must:
- Offer a self-serve onboarding journey from trial to paid plan, allowing an owner/manager to import existing sheets and see value within the first week.
- Capture actionable product analytics (feature usage, funnel drop-off) while respecting GDPR/AVG, highlighting the first moments of value for small teams.
- Provide in-app guidance, contextual help, and lightweight support escalation without mandatory implementation projects or IT expertise.

## MoSCoW Priorities

### Must Have
- **Dutch regulatory compliance foundation**: Track group occupancy against BKR (Beroepskracht-kindratio) with automated alerts; store inspection-ready documentation aligned with GGD requirements. See [BKR Compliance Extension Design](./compliance/bkr-compliance-extension.md) for implementation details.
- **Contract & package templates**: Pre-built Dutch childcare packages (52/40/48-week, flexible hours) with quick customization and digital signatures compliant with eIDAS.
- **Attendance & check-in**: Lightweight check-in via tablet or mobile (PIN/QR) with offline-safe mode; sync to scheduling for small group staffing ratios.
- **Billing & payments**: Automated invoicing with SEPA Direct Debit (incasso) and iDEAL integrations, supporting split billing and subsidy adjustments.
- **Kinderopvangtoeslag support**: Export reports/data formats required by Belastingdienst to reconcile childcare allowance, emphasizing one-click generation.
- **GDPR/AVG controls**: Consent management, retention policies, and role-based access suited to small teams; highlight audit trails in a simple dashboard.
- **Product analytics & activation**: Instrument key moments (first import, first schedule, first invoice) to support product-led nurturing.
- **Self-service workspace provisioning**: Automated tenant creation with sensible defaults, no-ops setup, and guided data import from Excel sheets.

### Should Have
- **Staff scheduling & availability**: Visual roster planner with drag-and-drop shifts, contract hours, and CAO Kinderopvang compliance hints.
- **Waitlist & placement automation**: Lightweight pipeline from lead capture to placement offers with prioritization (siblings, VVE-indicatie) and small-team workflows.
- **Parent portal & daily updates**: Simple web/mobile experience for messages, photos, meals, and incident logging with NL/EN toggles.
- **Document management**: Secure storage for policies, medical forms, and certifications with expiry reminders tailored to small teams.
- **Operational snapshots**: Dashboard summarizing occupancy, revenue forecast, outstanding invoices, and upcoming expiring documents.
- **In-app guidance**: Checklist-driven onboarding, feature tours, and contextual tips tuned to owners without dedicated admins.

### Could Have
- **Accounting connectors**: Simple exports or lightweight connectors to Exact Online or Moneybird for bookkeeping.
- **Mobile companion app**: Native wrapper for parent portal plus push notifications for attendance and announcements.
- **AI-assisted staffing suggestions**: Predict staffing needs when holidays or illness impact small teams.
- **Advanced analytics**: Cohort and profitability insights as data volume grows.
- **Embedded feedback loops**: In-product NPS and satisfaction prompts tied to CRM lifecycle campaigns.

### Won't Have (for MVP)
- Full-fledged HR/payroll suites or complex contract generation workflows.
- Comprehensive curriculum planning or pedagogical tracking modules.
- Multi-location management beyond one site with up to three groups.
- Deep BI warehouse or data lake implementations; focus remains on actionable exports and dashboards.

## Implementation Considerations
- **Service extensions**: Augment CRM with guardian/child lifecycle entities and compliance data; evolve Scheduling to handle drag-and-drop rosters and attendance tracking for small group counts.
- **API surface**: Ensure Orval-generated clients expose new endpoints, keeping API-first documentation in sync.
- **Data privacy**: Embed consent and deletion workflows across services; log access in SigNoz for audits.
- **Go-to-market**: Bundle onboarding checklists, Excel import guides, trial limits, and paywall triggers inside the React frontend, keeping friction low for owner-led adoption.

Delivering these capabilities will complete the minimal viable product for a Dutch daycare SaaS that can grow through product-led sales while maintaining regulatory readiness and operational excellence.
