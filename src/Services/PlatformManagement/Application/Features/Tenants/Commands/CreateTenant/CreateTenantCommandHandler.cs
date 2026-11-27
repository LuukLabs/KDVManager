using System;
using System.Threading.Tasks;
using KDVManager.Services.PlatformManagement.Application.Contracts.Persistence;
using KDVManager.Services.PlatformManagement.Domain.Entities;
using KDVManager.Shared.Contracts.Events;
using MassTransit;

namespace KDVManager.Services.PlatformManagement.Application.Features.Tenants.Commands.CreateTenant;

public class CreateTenantCommandHandler
{
    private readonly ITenantRepository _tenantRepository;
    private readonly IPublishEndpoint _publishEndpoint;

    public CreateTenantCommandHandler(ITenantRepository tenantRepository, IPublishEndpoint publishEndpoint)
    {
        _tenantRepository = tenantRepository;
        _publishEndpoint = publishEndpoint;
    }

    public async Task<Guid> Handle(CreateTenantCommand request)
    {
        var validator = new CreateTenantCommandValidator();
        var validationResult = await validator.ValidateAsync(request);

        if (!validationResult.IsValid)
            throw new Exceptions.ValidationException(validationResult);

        var tenant = new Tenant
        {
            Id = Guid.NewGuid(),
            Name = request.Name!
        };

        tenant = await _tenantRepository.AddAsync(tenant);

        // Publish event
        await _publishEndpoint.Publish(new TenantCreatedEvent
        {
            TenantId = tenant.Id,
            Name = tenant.Name
        });

        return tenant.Id;
    }
}
