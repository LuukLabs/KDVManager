# Scheduling Workflow Rules

This module introduces lightweight workflow automation for age-based scheduling adjustments.

## Implemented Rules

1. End mark when child turns 4
   - On the child's 4th birthday an `EndMark` is automatically added (if not already present) on the birthday date with reason `Auto: Child turned 4`.
   - Schedule timeline recalculated afterwards.

2. Reassign group when child turns 3
   - On the child's 3rd birthday all existing schedule rules are reassigned to a target group whose name contains `3+` or `Toddler` (placeholder heuristic).
   - Future enhancement: capacity checks, configurable mapping per tenant.

## Architecture

| Layer | Element | Purpose |
|-------|---------|---------|
| Domain | `ChildTurnedAgeDomainEvent` | Canonical event for birthday-based rules. |
| Domain | `IWorkflowRule<T>` | Abstraction for rule evaluation. |
| Application | Rules (`AddEndMarkWhenChildTurnsFourRule`, `ReassignGroupAtAgeThreeRule`) | Concrete rule logic. |
| Application | `WorkflowEngine` | Dispatches events to matching rules. |
| Application | `BirthdayScanHostedService` | Emits events daily for children having birthday. |

## Future Extensions

- Capacity-aware group selection with prioritization.
- Admin UI to configure rule enable/disable and mappings (age -> group).
- Event sourcing or audit log of rule actions.
- On-demand re-evaluation endpoint per child.

## Safety & Idempotency

- Rules are written to be idempotent: re-running a birthday event will not duplicate the end mark nor repeatedly update groups beyond necessary changes.

## Testing Hints

- Inject a fixed date provider to deterministically test birthday scenarios.
- Unit test each rule with crafted events; mock repositories.
