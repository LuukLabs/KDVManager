using System;
using System.Threading.Tasks;
using KDVManager.Services.Scheduling.Application.Contracts.Persistence;
using KDVManager.Services.Scheduling.Domain.Entities;
using KDVManager.Shared.Contracts.Tenancy;

namespace KDVManager.Services.Scheduling.Application.Features.Groups.Commands.AddGroup;

public class AddGroupCommandHandler
{
    private readonly IGroupRepository _groupRepository;
    private readonly ITenancyContextAccessor _tenancyContextAccessor;

    public AddGroupCommandHandler(IGroupRepository groupRepository, ITenancyContextAccessor tenancyContextAccessor)
    {
        _groupRepository = groupRepository;
        _tenancyContextAccessor = tenancyContextAccessor;
    }

    public async Task<Guid> Handle(AddGroupCommand request)
    {
        var validator = new AddGroupCommandValidator(_groupRepository);
        var validationResult = await validator.ValidateAsync(request);

        if (!validationResult.IsValid)
            throw new Exceptions.ValidationException(validationResult);

        var group = new Group
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            TenantId = _tenancyContextAccessor.Current!.TenantId
        };

        group = await _groupRepository.AddAsync(group);

        return group.Id;
    }
}

