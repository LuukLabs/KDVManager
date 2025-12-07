using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using KDVManager.Services.Scheduling.Application.Contracts.Persistence;
using KDVManager.Services.Scheduling.Application.Exceptions;
using KDVManager.Services.Scheduling.Application.Features.Compliance.Models;
using KDVManager.Services.Scheduling.Domain.Entities;

namespace KDVManager.Services.Scheduling.Application.Features.Compliance.Queries.ListGroupComplianceSnapshots;

public class ListGroupComplianceSnapshotsQueryHandler
{
    private readonly IGroupComplianceSnapshotRepository _snapshotRepository;
    private readonly IGroupRepository _groupRepository;

    public ListGroupComplianceSnapshotsQueryHandler(IGroupComplianceSnapshotRepository snapshotRepository, IGroupRepository groupRepository)
    {
        _snapshotRepository = snapshotRepository;
        _groupRepository = groupRepository;
    }

    public async Task<IReadOnlyList<GroupComplianceSnapshotDto>> Handle(ListGroupComplianceSnapshotsQuery request)
    {
        if (request.FromUtc > request.ToUtc)
        {
            throw new ArgumentException("FromUtc must be earlier than ToUtc");
        }

        var group = await _groupRepository.GetByIdAsync(request.GroupId) ??
                    throw new NotFoundException(nameof(Group), request.GroupId);

        var snapshots = await _snapshotRepository.GetRangeAsync(group.Id, request.FromUtc, request.ToUtc);
        return snapshots.Select(s => new GroupComplianceSnapshotDto
        {
            Id = s.Id,
            GroupId = s.GroupId,
            CapturedAtUtc = s.CapturedAtUtc,
            PresentChildrenCount = s.PresentChildrenCount,
            RequiredStaffCount = s.RequiredStaffCount,
            QualifiedStaffCount = s.QualifiedStaffCount,
            BufferPercent = s.BufferPercent,
            Status = s.Status,
            Notes = s.Notes,
        }).ToList();
    }
}
