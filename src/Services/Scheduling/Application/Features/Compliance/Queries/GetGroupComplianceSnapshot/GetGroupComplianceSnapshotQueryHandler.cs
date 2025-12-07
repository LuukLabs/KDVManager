using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using KDVManager.Services.Scheduling.Application.Contracts.Persistence;
using KDVManager.Services.Scheduling.Application.Exceptions;
using KDVManager.Services.Scheduling.Application.Features.Compliance.Models;
using KDVManager.Services.Scheduling.Domain.Entities;
using KDVManager.Services.Scheduling.Domain.Services;

namespace KDVManager.Services.Scheduling.Application.Features.Compliance.Queries.GetGroupComplianceSnapshot;

public class GetGroupComplianceSnapshotQueryHandler
{
    private readonly IScheduleRepository _scheduleRepository;
    private readonly IAbsenceRepository _absenceRepository;
    private readonly IChildRepository _childRepository;
    private readonly IGroupRepository _groupRepository;
    private readonly IGroupStaffLevelRepository _staffLevelRepository;
    private readonly IGroupComplianceSnapshotRepository _snapshotRepository;
    private readonly BkrComplianceCalculator _calculator;

    public GetGroupComplianceSnapshotQueryHandler(
        IScheduleRepository scheduleRepository,
        IAbsenceRepository absenceRepository,
        IChildRepository childRepository,
        IGroupRepository groupRepository,
        IGroupStaffLevelRepository staffLevelRepository,
        IGroupComplianceSnapshotRepository snapshotRepository,
        BkrComplianceCalculator calculator)
    {
        _scheduleRepository = scheduleRepository;
        _absenceRepository = absenceRepository;
        _childRepository = childRepository;
        _groupRepository = groupRepository;
        _staffLevelRepository = staffLevelRepository;
        _snapshotRepository = snapshotRepository;
        _calculator = calculator;
    }

    public async Task<GroupComplianceSnapshotDto> Handle(GetGroupComplianceSnapshotQuery request)
    {
        var group = await _groupRepository.GetByIdAsync(request.GroupId) ??
                    throw new NotFoundException(nameof(Group), request.GroupId);

        var atUtc = request.AtUtc?.ToUniversalTime() ?? DateTime.UtcNow;

        if (!request.Refresh)
        {
            var cached = await _snapshotRepository.GetLatestAsync(group.Id);
            if (cached != null)
            {
                return MapToDto(cached);
            }
        }

        var date = DateOnly.FromDateTime(atUtc);
        var time = TimeOnly.FromDateTime(atUtc);

        var schedules = await _scheduleRepository.GetSchedulesByDateAsync(date, request.GroupId);
        var relevantChildIds = new HashSet<Guid>();

        foreach (var schedule in schedules)
        {
            foreach (var rule in schedule.ScheduleRules)
            {
                if (rule.TimeSlot == null)
                {
                    continue;
                }

                if (IsWithinTimeSlot(rule.TimeSlot, time))
                {
                    relevantChildIds.Add(schedule.ChildId);
                }
            }
        }

        var absences = await _absenceRepository.GetByChildIdsAsync(relevantChildIds);
        var presentChildIds = relevantChildIds.Where(childId => !IsAbsent(childId, date, absences)).ToList();
        var children = await _childRepository.GetChildrenByIdsAsync(presentChildIds);

        var staffLevel = await _staffLevelRepository.GetLatestForGroupAsync(group.Id, atUtc);
        var qualifiedStaff = staffLevel?.QualifiedStaffCount
                              ?? group.TargetStaffCount
                              ?? 0;

        var snapshot = _calculator.CalculateSnapshot(group.TenantId, group.Id, atUtc, children, qualifiedStaff, group.WarningBufferPercent);
        snapshot = await _snapshotRepository.AddAsync(snapshot);

        return MapToDto(snapshot);
    }

    private static bool IsWithinTimeSlot(TimeSlot slot, TimeOnly time)
    {
        if (slot.EndTime <= slot.StartTime)
        {
            // Handle overnight slot by splitting at midnight
            return time >= slot.StartTime || time < slot.EndTime;
        }
        return time >= slot.StartTime && time < slot.EndTime;
    }

    private static bool IsAbsent(Guid childId, DateOnly date, IEnumerable<Absence> absences)
    {
        return absences.Any(a => a.ChildId == childId && date >= a.StartDate && date <= a.EndDate);
    }

    private static GroupComplianceSnapshotDto MapToDto(GroupComplianceSnapshot snapshot)
    {
        return new GroupComplianceSnapshotDto
        {
            Id = snapshot.Id,
            GroupId = snapshot.GroupId,
            CapturedAtUtc = snapshot.CapturedAtUtc,
            PresentChildrenCount = snapshot.PresentChildrenCount,
            RequiredStaffCount = snapshot.RequiredStaffCount,
            QualifiedStaffCount = snapshot.QualifiedStaffCount,
            BufferPercent = snapshot.BufferPercent,
            Status = snapshot.Status,
            Notes = snapshot.Notes,
        };
    }
}
