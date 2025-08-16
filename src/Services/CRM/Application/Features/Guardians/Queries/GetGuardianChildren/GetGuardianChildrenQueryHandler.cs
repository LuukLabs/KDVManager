using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using KDVManager.Services.CRM.Application.Contracts.Persistence;

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

                var age = CalculateAge(child.DateOfBirth);

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
                    IsArchived = child.ArchivedAt.HasValue
                };
                result.Add(vm);
            }

            return result
                .OrderBy(c => c.IsArchived ? 1 : 0) // Active children first
                .ThenBy(c => c.FullName)
                .ToList();
        }

        private static int CalculateAge(DateOnly birthDate)
        {
            var today = DateOnly.FromDateTime(DateTime.Today);
            var age = today.Year - birthDate.Year;

            // If birthday hasn't occurred this year yet, subtract one year
            if (birthDate > today.AddYears(-age))
                age--;

            return Math.Max(0, age);
        }
    }
}
