using System;
using System.Threading.Tasks;
using KDVManager.Services.Tenants.Application.Contracts.Persistence;
using KDVManager.Services.Tenants.Domain.Entities;
using KDVManager.Shared.Contracts.Events;
using MassTransit;

namespace KDVManager.Services.Tenants.Application.Features.Tenants.Commands.AddTenant;

public class AddTenantCommandHandler
{
    private readonly ITenantRepository _tenantRepository;
    private readonly IPublishEndpoint _publishEndpoint;

    public AddTenantCommandHandler(ITenantRepository tenantRepository, IPublishEndpoint publishEndpoint)
    {
        _tenantRepository = tenantRepository;
        _publishEndpoint = publishEndpoint;
    }

    public async Task<Guid> Handle(AddTenantCommand request)
    {
        var validator = new AddTenantCommandValidator();
        var validationResult = await validator.ValidateAsync(request);

        if (!validationResult.IsValid)
            throw new Exceptions.ValidationException(validationResult);

        if (await _tenantRepository.NameExistsAsync(request.Name!))
            throw new Exceptions.ConflictException(nameof(Tenant), request.Name!);

        var tenant = new Tenant
        {
            Id = Guid.NewGuid(),
            Name = request.Name!,
            IsActive = true,
            CreatedAt = DateTimeOffset.UtcNow
        };

        tenant = await _tenantRepository.AddAsync(tenant);

        await _publishEndpoint.Publish(new TenantAddedEvent
        {
            TenantId = tenant.Id,
            Name = tenant.Name
        });

        return tenant.Id;
    }
}
