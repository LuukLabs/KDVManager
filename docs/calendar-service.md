# Calendar Service (Scheduling)

The Calendar Service (`ICalendarService`) provides a flattened, generic calendar-event style view over scheduling data between two dates for:

- Specific child (`/api/calendar/children/{childId}`)
- Specific group (`/api/calendar/groups/{groupId}`)
- Multiple groups (`/api/calendar/groups?groupIds=...`)
- Global closures (`/api/calendar`)

It is intended for reuse across schedule overviews, printing, future availability checks, and potential iCal export.

## Event Model

`CalendarEvent` (domain entity – not persisted yet) mirrors common calendar concepts:

| Property | Notes |
|----------|-------|
| Id | Source entity id (rule / absence / closure). |
| GroupId | Group of the schedule rule; null for global closures. |
| ChildId | Present for child-specific schedule/absence events. |
| Type | `ScheduleRule`, `Absence`, `Closure`, `Actual` (future). |
| Start / End | UTC date-times (rule timeslot bounds or full-day bounds). |
| Title / Description | Human description; UI friendly. |

## Aggregation & Merging Rules

1. Schedule Rules are expanded into concrete weekly occurrences within the requested date window.
2. Absences MERGE with schedule rule occurrences: if a child is absent on a day where a rule applies, the resulting event keeps the rule's timing but the `Type` becomes `Absence` (no separate overlapping event produced).
3. Closure Periods are emitted as single multi-day events (treating full-day bounds). They remain independent; consumer logic can decide how to overlay or filter them.
4. Actual attendance entries reserved via `Actual` type for future implementation.

## Service Methods

```csharp
Task<IReadOnlyList<CalendarEvent>> GetForChildAsync(Guid childId, DateOnly from, DateOnly to);
Task<IReadOnlyList<CalendarEvent>> GetForGroupsAsync(IEnumerable<Guid>? groupIds, DateOnly from, DateOnly to);
Task<IReadOnlyList<CalendarEvent>> GetAllAsync(DateOnly from, DateOnly to); // closures only currently
```

## API Endpoints

| Route | Query Params | Description |
|-------|--------------|-------------|
| `GET /api/calendar` | `from`, `to` | Global closures. |
| `GET /api/calendar/children/{childId}` | `from`, `to` | Child schedule + merged absences + closures. |
| `GET /api/calendar/groups/{groupId}` | `from`, `to` | Group schedule rules (with merged absences) + closures. |
| `GET /api/calendar/groups?groupIds=g1,g2` | `from`, `to` | Multiple groups. |

## Performance

Bulk repository queries avoid N+1:

- `ListByGroupsAndDateRangeAsync` loads schedules + rules + timeslots per group set.
- `ListByChildAndDateRangeAsync` for single child.
- Absences fetched in one query per child set (`GetByChildIdsAndDateRangeAsync`).
- Closure periods fetched once.

Recommended indexes:

- `Schedules (ChildId, StartDate, EndDate)`
- `ScheduleRules (GroupId, Day)`
- `Absences (ChildId, StartDate, EndDate)`
- `ClosurePeriods (StartDate, EndDate)`

## Future Enhancements

- Add actual attendance records (`Actual` events).
- iCal feed serialization helper.
- Optional per-day aggregate summaries (counts per group / capacity checks).
- Configurable absence merge strategy (option to keep both events).
