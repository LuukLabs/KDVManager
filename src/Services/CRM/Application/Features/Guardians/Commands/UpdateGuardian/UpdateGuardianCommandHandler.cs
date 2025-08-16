using System;
using System.Linq;
using System.Threading.Tasks;
using KDVManager.Services.CRM.Application.Contracts.Persistence;
using KDVManager.Services.CRM.Application.Exceptions;
using KDVManager.Services.CRM.Domain.Entities;
using KDVManager.Shared.Contracts.Tenancy;

namespace KDVManager.Services.CRM.Application.Features.Guardians.Commands.UpdateGuardian
{
    public class UpdateGuardianCommandHandler
    {
        private readonly IGuardianRepository _guardianRepository;
        private readonly ITenancyContextAccessor _tenancyContextAccessor;

        public UpdateGuardianCommandHandler(IGuardianRepository guardianRepository, ITenancyContextAccessor tenancyContextAccessor)
        {
            _guardianRepository = guardianRepository;
            _tenancyContextAccessor = tenancyContextAccessor;
        }

        public async Task Handle(UpdateGuardianCommand command)
        {
            var guardian = await _guardianRepository.GetByIdWithRelationshipsAsync(command.Id);

            if (guardian == null)
            {
                throw new NotFoundException(nameof(Guardian), command.Id);
            }

            // Update scalar properties via aggregate behavior
            guardian.UpdateNames(command.GivenName, command.FamilyName);
            guardian.DateOfBirth = command.DateOfBirth;
            guardian.Email = command.Email;

            // PHONE NUMBERS full sync (aggregate methods)
            if (command.PhoneNumbers.Count > 10)
                throw new ArgumentException("A guardian can have at most 10 phone numbers");

            var incomingPhoneIds = command.PhoneNumbers.Where(p => p.Id.HasValue).Select(p => p.Id!.Value).ToHashSet();
            var phonesToRemove = guardian.PhoneNumbers.Where(p => !incomingPhoneIds.Contains(p.Id)).Select(p => p.Id).ToList();
            foreach (var phoneId in phonesToRemove)
            {
                guardian.RemovePhoneNumber(phoneId);
            }

            foreach (var dto in command.PhoneNumbers)
            {
                if (string.IsNullOrWhiteSpace(dto.Number)) continue;
                if (dto.Id.HasValue && guardian.PhoneNumbers.Any(p => p.Id == dto.Id.Value))
                {
                    guardian.UpdatePhoneNumber(dto.Id.Value, dto.Number, dto.Type);
                }
                else
                {
                    guardian.AddPhoneNumber(dto.Number, dto.Type);
                }
            }

            await _guardianRepository.UpdateAsync(guardian);

        }
    }
}
