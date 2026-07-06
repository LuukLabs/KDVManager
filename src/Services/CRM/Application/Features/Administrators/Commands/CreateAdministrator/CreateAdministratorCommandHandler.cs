using System;
using System.Threading.Tasks;
using KDVManager.Services.CRM.Application.Contracts.Persistence;
using KDVManager.Services.CRM.Application.Contracts.Services;
using KDVManager.Services.CRM.Application.Exceptions;
using KDVManager.Services.CRM.Domain.Entities;
using KDVManager.Shared.Contracts.Tenancy;

namespace KDVManager.Services.CRM.Application.Features.Administrators.Commands.CreateAdministrator
{
    public class CreateAdministratorCommandHandler
    {
        private readonly IAdministratorRepository _administratorRepository;
        private readonly IAuth0ManagementService _auth0ManagementService;
        private readonly ITenancyContextAccessor _tenancyContextAccessor;

        public CreateAdministratorCommandHandler(
            IAdministratorRepository administratorRepository,
            IAuth0ManagementService auth0ManagementService,
            ITenancyContextAccessor tenancyContextAccessor)
        {
            _administratorRepository = administratorRepository;
            _auth0ManagementService = auth0ManagementService;
            _tenancyContextAccessor = tenancyContextAccessor;
        }

        public async Task<Guid> Handle(CreateAdministratorCommand command)
        {
            var validator = new CreateAdministratorCommandValidator();
            var validationResult = await validator.ValidateAsync(command);

            if (!validationResult.IsValid)
                throw new Exceptions.ValidationException(validationResult);

            var tenantId = _tenancyContextAccessor.Current?.TenantId ?? throw new InvalidOperationException("Tenant context is required");

            if (await _administratorRepository.ExistsByEmailAsync(command.Email))
            {
                throw new ConflictException(nameof(Administrator), command.Email);
            }

            var auth0UserId = await _auth0ManagementService.CreateUserAsync(command.Email, command.Name, tenantId);

            var administrator = new Administrator
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                Auth0UserId = auth0UserId,
                Name = command.Name,
                Email = command.Email,
                CreatedAt = DateTime.UtcNow,
            };

            administrator = await _administratorRepository.AddAsync(administrator);
            return administrator.Id;
        }
    }
}
