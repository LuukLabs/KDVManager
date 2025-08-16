using System;
using System.Linq;
using System.Threading.Tasks;
using KDVManager.Services.CRM.Application.Contracts.Persistence;
using KDVManager.Services.CRM.Domain.Entities;

namespace KDVManager.Services.CRM.Application.Features.Guardians.Queries.GetGuardianDetail
{
    public class GetGuardianDetailQueryHandler
    {
        private readonly IGuardianRepository _guardianRepository;

        public GetGuardianDetailQueryHandler(IGuardianRepository guardianRepository)
        {
            _guardianRepository = guardianRepository;
        }

        public async Task<GuardianDetailVM> Handle(GetGuardianDetailQuery request)
        {
            var guardian = await _guardianRepository.GetByIdWithRelationshipsAsync(request.Id);

            if (guardian == null)
            {
                throw new ArgumentException($"Guardian with ID {request.Id} not found");
            }

            return new GuardianDetailVM
            {
                Id = guardian.Id,
                GivenName = guardian.GivenName,
                FamilyName = guardian.FamilyName,
                DateOfBirth = guardian.DateOfBirth,
                Email = guardian.Email,
                PhoneNumbers = guardian.PhoneNumbers
                    .OrderBy(p => p.Type)
                    .Select(p => new PhoneNumberVM
                    {
                        Id = p.Id,
                        Number = p.Number,
                        Type = p.Type
                    }).ToList()
            };
        }
    }
}
