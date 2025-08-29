using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using KDVManager.Services.CRM.Application.Contracts.Persistence;
using KDVManager.Shared.Domain.Extensions;

namespace KDVManager.Services.CRM.Application.Features.Guardians.Queries.GetGuardianChildren
{
    public class GetGuardianChildrenQueryHandler
    {
        private readonly IChildGuardianRepository _childGuardianRepository;
        private readonly IChildRepository _childRepository;

        public GetGuardianChildrenQueryHandler(IChildGuardianRepository childGuardianRepository, IChildRepository childRepository)
        {
            _childGuardianRepository = childGuardianRepository;
            _childRepository = childRepository;
        }

        public async Task<List<GuardianChildVM>> Handle(GetGuardianChildrenQuery request)
        {
            var childGuardians = await _childGuardianRepository.GetByGuardianIdAsync(request.GuardianId);
            var result = new List<GuardianChildVM>();

            foreach (var cg in childGuardians)
            {
                var child = await _childRepository.GetByIdAsync(cg.ChildId);
                if (child == null) continue;

                var age = child.Age();

                var vm = new GuardianChildVM
                {
                    ChildId = child.Id,
                    FullName = $"{child.GivenName} {child.FamilyName}",
                    CID = child.CID,
                    DateOfBirth = child.DateOfBirth,
                    Age = age,
                    RelationshipType = cg.RelationshipType,
                    IsPrimaryContact = cg.IsPrimaryContact,
                    IsEmergencyContact = cg.IsEmergencyContact,
                };
                result.Add(vm);
            }

            return result
                .OrderBy(c => c.FullName)
                .ToList();
        }

        // Age calculation now centralized in domain model (Child.Age()).
    }
}
