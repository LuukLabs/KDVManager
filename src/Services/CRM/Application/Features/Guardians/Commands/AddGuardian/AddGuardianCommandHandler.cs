using System;
using System.Threading.Tasks;
using KDVManager.Services.CRM.Application.Contracts.Persistence;
using KDVManager.Services.CRM.Domain.Entities;
using KDVManager.Shared.Contracts.Tenancy;

namespace KDVManager.Services.CRM.Application.Features.Guardians.Commands.AddGuardian
{
    public class AddGuardianCommandHandler
    {
        private readonly IGuardianRepository _guardianRepository;
        private readonly ITenancyContextAccessor _tenancyContextAccessor;

        public AddGuardianCommandHandler(IGuardianRepository guardianRepository, ITenancyContextAccessor tenancyContextAccessor)
        {
            _guardianRepository = guardianRepository;
            _tenancyContextAccessor = tenancyContextAccessor;
        }

        public async Task<Guid> Handle(AddGuardianCommand command)
        {
            var tenantId = _tenancyContextAccessor.Current?.TenantId ?? throw new InvalidOperationException("Tenant context is required");

            var guardian = new Guardian
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                GivenName = command.GivenName,
                FamilyName = command.FamilyName,
                DateOfBirth = command.DateOfBirth,
                Email = command.Email,
            };

            // Add phone numbers (max 10)
            if (command.PhoneNumbers.Count > 10)
            {
                throw new ArgumentException("A guardian can have at most 10 phone numbers");
            }

            foreach (var phoneDto in command.PhoneNumbers)
            {
                if (string.IsNullOrWhiteSpace(phoneDto.Number)) continue;
                guardian.AddPhoneNumber(phoneDto.Number, phoneDto.Type);
            }

            guardian = await _guardianRepository.AddAsync(guardian);
            return guardian.Id;
        }
    }
}
