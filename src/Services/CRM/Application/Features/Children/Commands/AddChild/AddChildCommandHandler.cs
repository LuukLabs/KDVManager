using System;
using System.Threading.Tasks;
using KDVManager.Services.CRM.Application.Contracts.Persistence;
using KDVManager.Services.CRM.Domain.Entities;
using KDVManager.Shared.Contracts.Events;
using KDVManager.Shared.Domain.Services;
using MassTransit;

namespace KDVManager.Services.CRM.Application.Features.Children.Commands.AddChild;

public class AddChildCommandHandler
{
    private readonly IChildRepository _childRepository;
    private readonly IPublishEndpoint _publishEndpoint;
    private readonly ITenantService _tenantService;

    public AddChildCommandHandler(IChildRepository childRepository, IPublishEndpoint publishEndpoint, ITenantService tenantService)
    {
        _childRepository = childRepository;
        _publishEndpoint = publishEndpoint;
        _tenantService = tenantService;
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
            GivenName = request.GivenName,
            FamilyName = request.FamilyName,
            DateOfBirth = request.DateOfBirth,
            CID = request.CID,
            TenantId = _tenantService.CurrentTenant
        };

        child = await _childRepository.AddAsync(child);

        // Publish event - tenant headers automatically added by infrastructure filter
        await _publishEndpoint.Publish(new ChildAddedEvent
        {
            ChildId = child.Id,
            DateOfBirth = child.DateOfBirth
        });

        return child.Id;
    }
}

