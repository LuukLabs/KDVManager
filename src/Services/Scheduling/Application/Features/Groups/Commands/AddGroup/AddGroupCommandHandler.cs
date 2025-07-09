using System;
using System.Threading.Tasks;
using KDVManager.Services.Scheduling.Application.Contracts.Persistence;
using KDVManager.Services.Scheduling.Domain.Entities;

namespace KDVManager.Services.Scheduling.Application.Features.Groups.Commands.AddGroup;

public class AddGroupCommandHandler
{
    private readonly IGroupRepository _groupRepository;

    public AddGroupCommandHandler(IGroupRepository groupRepository)
    {
        _groupRepository = groupRepository;
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
            TenantId = Guid.Parse("7e520828-45e6-415f-b0ba-19d56a312f7f") // Default tenant ID for now
        };

        group = await _groupRepository.AddAsync(group);

        return group.Id;
    }
}

