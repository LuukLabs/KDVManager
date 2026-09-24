using System.Threading.Tasks;
using KDVManager.Services.Tenants.Application.Contracts.Persistence;
using KDVManager.Services.Tenants.Domain.Entities;
using KDVManager.Shared.Contracts.Events;
using MassTransit;

namespace KDVManager.Services.Tenants.Application.Features.Tenants.Commands.UpdateTenant
{
    public class UpdateTenantCommandHandler
    {
        private readonly ITenantRepository _tenantRepository;
        private readonly IPublishEndpoint _publishEndpoint;

        public UpdateTenantCommandHandler(ITenantRepository tenantRepository, IPublishEndpoint publishEndpoint)
        {
            _tenantRepository = tenantRepository;
            _publishEndpoint = publishEndpoint;
        }

        public async Task Handle(UpdateTenantCommand request)
        {
            var tenant = await _tenantRepository.GetByIdAsync(request.Id);
            if (tenant == null)
            {
                throw new Exceptions.NotFoundException(nameof(Tenant), request.Id);
            }

            var validator = new UpdateTenantCommandValidator();
            var validationResult = await validator.ValidateAsync(request);

            if (!validationResult.IsValid)
                throw new Exceptions.ValidationException(validationResult);

            if (await _tenantRepository.NameExistsAsync(request.Name!, request.Id))
                throw new Exceptions.ConflictException(nameof(Tenant), request.Name!);

            tenant.Name = request.Name!;

            await _tenantRepository.UpdateAsync(tenant);

            await _publishEndpoint.Publish(new TenantUpdatedEvent
            {
                TenantId = tenant.Id,
                Name = tenant.Name
            });
        }
    }
}
