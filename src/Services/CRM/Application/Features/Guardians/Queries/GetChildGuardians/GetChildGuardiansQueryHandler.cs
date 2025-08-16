using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using KDVManager.Services.CRM.Application.Contracts.Persistence;

namespace KDVManager.Services.CRM.Application.Features.Guardians.Queries.GetChildGuardians
{
    public class GetChildGuardiansQueryHandler
    {
        private readonly IChildGuardianRepository _childGuardianRepository;
        private readonly IGuardianRepository _guardianRepository;

        public GetChildGuardiansQueryHandler(IChildGuardianRepository childGuardianRepository, IGuardianRepository guardianRepository)
        {
            _childGuardianRepository = childGuardianRepository;
            _guardianRepository = guardianRepository;
        }

        public async Task<List<ChildGuardianVM>> Handle(GetChildGuardiansQuery request)
        {
            var childGuardians = await _childGuardianRepository.GetByChildIdAsync(request.ChildId);
            var result = new List<ChildGuardianVM>();

            foreach (var cg in childGuardians)
            {
                var guardian = await _guardianRepository.GetByIdWithRelationshipsAsync(cg.GuardianId);
                if (guardian == null) continue;

                var vm = new ChildGuardianVM
                {
                    GuardianId = guardian.Id,
                    FullName = $"{guardian.GivenName} {guardian.FamilyName}",
                    Email = guardian.Email,
                    PhoneNumber = guardian.PhoneNumbers
                        .OrderBy(n => n.Type)
                        .Select(n => n.Number)
                        .FirstOrDefault(),
                    RelationshipType = cg.RelationshipType,
                    IsPrimaryContact = cg.IsPrimaryContact,
                    IsEmergencyContact = cg.IsEmergencyContact
                };
                result.Add(vm);
            }

            return result
                .OrderBy(g => g.IsPrimaryContact ? 0 : 1)
                .ThenBy(g => g.FullName)
                .ToList();
        }
    }
}
