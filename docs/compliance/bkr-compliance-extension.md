# BKR Compliance Extension Design

## Goals
1. Calculate and monitor the Dutch Beroepskracht-kindratio (BKR) in real time across all groups and shifts.
2. Alert caregivers and managers before the ratio is violated to enable corrective action.
3. Maintain inspection-ready documentation (GGD) with historical evidence, policies, and corrective actions.
4. Expose a streamlined experience in the product-led frontend via the Backend-for-Frontend (BFF) service.

## Personas & Primary Use Cases
- **Location manager**: needs a live dashboard of staffing versus child counts, receives alerts, exports daily compliance reports for audits.
- **Caregiver/team lead**: wants quick feedback on whether adding a child or leaving the room will break BKR; logs incidents and corrective steps.
- **Compliance officer**: prepares GGD inspections, reviews historical ratio breaches, attaches supporting documentation.

### Core Use Cases
1. **Live ratio monitoring**: Display live ratios per group/room and flag near breach (<5% buffer) and breach states.
2. **Shift planning validation**: Evaluate upcoming roster vs. enrollment to ensure staffing meets BKR before schedules are published.
3. **Incident logging**: Capture when a ratio breach occurs, the root cause, the corrective action, and who acknowledged it.
4. **Audit preparation**: Generate reports (PDF/CSV) covering ratios, incidents, and staff qualifications for a selected window; provide GGD checklist exports.
5. **Document repository**: Store policy documents, staff certifications, and audit evidence with retention and access logs.

## Data Model Extensions
### Shared Contracts (`KDVManager.Shared.Contracts`)
- `GroupComplianceSnapshotDto`: { groupId, timestamp, presentChildrenCount, qualifiedStaffCount, calculatedRatio, status, bufferPercent, alerts[] }
- `ComplianceIncidentDto`: { id, groupId, occurredAt, resolvedAt?, severity, cause, resolution, acknowledgedBy }
- `ComplianceDocumentDto`: { id, title, category, validFrom, validUntil?, storageUri, checksum, uploadedBy, auditTrail }

### Scheduling Service
- Extend domain with `GroupOccupancy` aggregate: ties real-time attendance data to staffed caregivers.
- Maintain `ComplianceSnapshot` table capturing every ratio calculation (default every 60 seconds or on change events).
- Add events `ComplianceSnapshotCreated` and `ComplianceStatusChanged` published via messaging (RabbitMQ) for alerting and downstream processing.
- Enrich existing repositories to query live attendance + staffing in a single projection optimized for BKR calculation.

### CRM Service
- Track staff qualifications/roles and certification expiry to inform whether a staff member counts toward BKR. New entity: `StaffQualification`.
- Manage group capacity definitions (max children per age bracket, mixed-age rules) to drive calculation parameters.

### Compliance Storage (new lightweight module)
- Introduce a `Compliance` bounded context within Shared Infrastructure, storing incidents and documents in PostgreSQL + S3-compatible object storage.
- Provide APIs for uploading documentation, linking to groups and incidents, enforcing retention policies (aligned with AVG).

## Backend-for-Frontend (BFF) Additions
Assuming the BFF aggregates CRM and Scheduling APIs:
- `GET /bff/compliance/groups` → Returns list of groups with current `GroupComplianceSnapshotDto` and trend data.
- `GET /bff/compliance/groups/{id}` → Detailed timeline, recent incidents, linked documents, staff roster.
- `POST /bff/compliance/incidents` → Creates incident and optionally attaches documents.
- `POST /bff/compliance/documents` → Initiates secure upload (pre-signed URL) and metadata registration.
- `GET /bff/compliance/reports?range=` → Generates downloadable report, triggers background job if large.
- Websocket/SSE channel `GET /bff/compliance/stream` streaming `ComplianceSnapshot` updates for live dashboards.

The BFF enforces access control, shapes data for the React frontend, and caches the latest snapshot per group for fast updates.

## Architecture & Data Flow
1. **Attendance event** (child check-in/out) or **staff event** (shift change) triggers Scheduling domain logic.
2. Scheduling recalculates BKR using group capacity and qualified staff data (pulled via CRM service client cache).
3. `ComplianceSnapshotCreated` event is stored in Scheduling DB, emitted on RabbitMQ, and forwarded to BFF cache via subscription worker.
4. BFF pushes live update to subscribed clients (SSE/WebSocket) and persists latest snapshot in Redis for resilience.
5. Alerts pipeline consumes `ComplianceStatusChanged` to fan out notifications (email/SMS) and creates incident drafts when threshold breached.
6. Compliance module records incident lifecycle, links documents stored in object storage, and exposes data back through BFF queries.

### Service Responsibilities
- **CRM**: master data for staff qualifications, group definitions, guardians; provides query endpoints and change events.
- **Scheduling**: authoritative source for attendance, staffing, ratio engine, and alert triggering.
- **Compliance module**: incident management, document repository, audit logging.
- **BFF**: aggregation, caching, RBAC enforcement, client-specific formatting, streaming channel.
- **Envoy Gateway**: routes public traffic to BFF while protecting internal service APIs.

## Frontend Experience
- **Compliance Dashboard**: React feature showing per-group cards with status (OK, Warning, Breach) and buffer minutes until violation.
- **Timeline View**: Chart ratios over the day, overlay staffing events (breaks, shifts). Uses React Query subscriptions to SSE.
- **Incident Workflow**: Guided flow with quick actions ("Log corrective action", "Attach photo") accessible from dashboard and alerts.
- **Document Library**: Tabbed view for policies, certifications, inspection reports; leverages existing document management components with compliance-specific filters.
- **Alerting UX**: Toast + in-app banner triggered when Warning/Breach events arrive; integrates with notifications center (if available) and optional email via CRM workflows.

## Alerting & Automation
- Define server-side thresholds: Warning at 5% buffer, Breach at 0%. Configurable per tenant.
- Persist alert events in Scheduling service; push to SigNoz via OpenTelemetry events for observability.
- Optional integration with messaging (email/SMS) using existing communication pipelines in CRM.

## Observability & Audit Trail
- Trace compliance calculations with correlation IDs referencing attendance and staffing updates.
- Record audit logs for every document view/download (GDPR requirement) and expose via CRM admin UI.
- Dashboard in SigNoz to track breaches per location, average resolution time, and data freshness.

## Implementation Phases
1. **Foundation**: Add qualification data, group capacity configuration, and ratio calculation engine inside Scheduling.
2. **Real-time Monitoring**: Emit snapshots, build SSE channel in BFF, and implement frontend dashboards.
3. **Incident & Documentation**: Create compliance storage module, extend BFF/CRM for document workflows, surface UI flows.
4. **Reporting & Alert Automation**: Generate exports, integrate with SigNoz dashboards, finalize notification pathways.

## Acceptance Criteria
- Ratio calculations consider child age brackets (0-1, 1-2, 2-3, 4+) and mixed-group rules per Dutch regulations.
- Warning alerts reach caregivers within 30 seconds of a state change.
- GGD audit export delivers past 2 years of ratio records, incidents, and staff qualifications on demand.
- Document uploads enforce AVG retention (auto-expire after configurable duration) with immutable access logs.
- Frontend displays real-time status without manual refresh and respects RBAC (only authorized roles access compliance data).

## Open Questions
- Should qualification data sync from external HR (Nmbrs) or be managed manually? (Impacts CRM integration.)
- Decide on data retention defaults for compliance snapshots (suggest 7 years to align with Dutch regulation, confirm).
- Confirm preferred delivery channels for instant alerts (mobile push, SMS) and integrate accordingly.
