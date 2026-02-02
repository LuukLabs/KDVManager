using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using KDVManager.Services.CRM.Application.Contracts.Persistence;

namespace KDVManager.Services.CRM.Application.Features.Children.Queries.GetPhoneList;

public class GetPhoneListQueryHandler
{
    private readonly IChildRepository _childRepository;
    private readonly IChildGuardianRepository _childGuardianRepository;
    private readonly IGuardianRepository _guardianRepository;

    public GetPhoneListQueryHandler(
        IChildRepository childRepository,
        IChildGuardianRepository childGuardianRepository,
        IGuardianRepository guardianRepository)
    {
        _childRepository = childRepository;
        _childGuardianRepository = childGuardianRepository;
        _guardianRepository = guardianRepository;
    }

    public async Task<PhoneListResponse> Handle(GetPhoneListQuery request)
    {
        // Get all children that are active in the requested year
        var yearStart = new DateOnly(request.Year, 1, 1);
        var yearEnd = new DateOnly(request.Year, 12, 31);

        var activeChildren = await _childRepository.GetActiveChildrenInPeriodAsync(yearStart, yearEnd);

        var childVMs = new List<PhoneListChildVM>();

        foreach (var child in activeChildren.OrderBy(c => c.FamilyName).ThenBy(c => c.GivenName))
        {
            var childGuardians = await _childGuardianRepository.GetByChildIdAsync(child.Id);
            var guardianVMs = new List<PhoneListGuardianVM>();

            foreach (var cg in childGuardians.OrderBy(g => g.IsPrimaryContact ? 0 : 1))
            {
                var guardian = await _guardianRepository.GetByIdWithRelationshipsAsync(cg.GuardianId);
                if (guardian == null) continue;

                var guardianVM = new PhoneListGuardianVM
                {
                    Id = guardian.Id,
                    FullName = $"{guardian.GivenName} {guardian.FamilyName}".Trim(),
                    RelationshipType = cg.RelationshipType,
                    IsPrimaryContact = cg.IsPrimaryContact,
                    IsEmergencyContact = cg.IsEmergencyContact,
                    Email = guardian.Email,
                    PhoneNumbers = guardian.PhoneNumbers
                        .OrderBy(p => p.Type)
                        .Select(p => new PhoneListPhoneNumberVM
                        {
                            Number = p.Number,
                            Type = p.Type
                        })
                        .ToList()
                };
                guardianVMs.Add(guardianVM);
            }

            var childVM = new PhoneListChildVM
            {
                Id = child.Id,
                FullName = $"{child.GivenName} {child.FamilyName}".Trim(),
                DateOfBirth = child.DateOfBirth,
                ChildNumber = child.ChildNumber,
                Guardians = guardianVMs
            };
            childVMs.Add(childVM);
        }

        return new PhoneListResponse
        {
            Year = request.Year,
            GeneratedAt = DateTime.UtcNow,
            Children = childVMs
        };
    }
}
