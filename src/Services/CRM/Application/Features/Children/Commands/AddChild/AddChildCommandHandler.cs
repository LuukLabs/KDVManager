using System;
using System.Threading.Tasks;
using KDVManager.Services.CRM.Application.Contracts.Persistence;
using KDVManager.Services.CRM.Domain.Entities;
using KDVManager.Shared.Contracts.Events;
using MassTransit;

namespace KDVManager.Services.CRM.Application.Features.Children.Commands.AddChild;

public class AddChildCommandHandler
{
    private readonly IChildRepository _childRepository;
    private readonly IPublishEndpoint _publishEndpoint;

    public AddChildCommandHandler(IChildRepository childRepository, IPublishEndpoint publishEndpoint)
    {
        _childRepository = childRepository;
        _publishEndpoint = publishEndpoint;
    }

    public async Task<Guid> Handle(AddChildCommand request)
    {
        var validator = new AddChildCommandValidator();
        var validationResult = await validator.ValidateAsync(request);

        if (!validationResult.IsValid)
            throw new Exceptions.ValidationException(validationResult);

        var child = new Child
        {
            Id = Guid.NewGuid(),
            GivenName = request.GivenName!,
            FamilyName = request.FamilyName!,
            DateOfBirth = (DateOnly)request.DateOfBirth!,
            CID = request.CID,
            TenantId = Guid.Parse("7e520828-45e6-415f-b0ba-19d56a312f7f") // Default tenant ID for now
        };

        child = await _childRepository.AddAsync(child);

        // Publish event
        await _publishEndpoint.Publish(new ChildAddedEvent
        {
            ChildId = child.Id,
            DateOfBirth = child.DateOfBirth
        });

        return child.Id;
    }
}

