using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using KDVManager.Services.Scheduling.Application.Contracts.Persistence;

namespace KDVManager.Services.Scheduling.Application.Features.Attendance.Queries.GetGroupsWithScheduling;

public class GetGroupsWithSchedulingQueryHandler
{
    private readonly IGroupRepository _groupRepository;

    public GetGroupsWithSchedulingQueryHandler(IGroupRepository groupRepository)
    {
        _groupRepository = groupRepository;
    }

    public async Task<List<GroupWithSchedulingVM>> Handle(GetGroupsWithSchedulingQuery request)
    {
        // Get all groups for now - in a real implementation, you'd filter by those with scheduling
        var groups = await _groupRepository.GetAllAsync();

        var result = groups.Select(group => new GroupWithSchedulingVM
        {
            Id = group.Id,
            Name = group.Name,
            GroupNumber = ExtractGroupNumber(group.Name)
        }).ToList();

        // Add "All Groups" option
        result.Insert(0, new GroupWithSchedulingVM
        {
            Id = Guid.Empty,
            Name = "Alle",
            GroupNumber = -1
        });

        return result;
    }

    private int ExtractGroupNumber(string groupName)
    {
        // Try to extract number from group name (e.g., "Groep 1" -> 1)
        var parts = groupName.Split(' ');
        if (parts.Length > 1 && int.TryParse(parts[1], out int number))
        {
            return number;
        }
        return 0;
    }
}
