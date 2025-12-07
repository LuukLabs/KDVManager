using System;
using System.Threading.Tasks;
using KDVManager.Services.Scheduling.Application.Contracts.Persistence;
using KDVManager.Services.Scheduling.Application.Exceptions;
using KDVManager.Services.Scheduling.Domain.Entities;

namespace KDVManager.Services.Scheduling.Application.Features.Compliance.Commands.RecordGroupStaffLevel;

public class RecordGroupStaffLevelCommandHandler
{
    private readonly IGroupStaffLevelRepository _staffLevelRepository;
    private readonly IGroupRepository _groupRepository;

    public RecordGroupStaffLevelCommandHandler(IGroupStaffLevelRepository staffLevelRepository, IGroupRepository groupRepository)
    {
        _staffLevelRepository = staffLevelRepository;
        _groupRepository = groupRepository;
    }

    public async Task<Guid> Handle(RecordGroupStaffLevelCommand request)
    {
        var validator = new RecordGroupStaffLevelCommandValidator();
        var validation = await validator.ValidateAsync(request);
        if (!validation.IsValid)
        {
            throw new ValidationException(validation);
        }

        var group = await _groupRepository.GetByIdAsync(request.GroupId);
        if (group == null)
        {
            throw new NotFoundException(nameof(Group), request.GroupId);
        }

        var staffLevel = new GroupStaffLevel
        {
            Id = Guid.NewGuid(),
            GroupId = request.GroupId,
            EffectiveFromUtc = request.EffectiveFromUtc,
            QualifiedStaffCount = request.QualifiedStaffCount,
            Notes = request.Notes,
            TenantId = group.TenantId,
        };

        await _staffLevelRepository.AddAsync(staffLevel);
        return staffLevel.Id;
    }
}
