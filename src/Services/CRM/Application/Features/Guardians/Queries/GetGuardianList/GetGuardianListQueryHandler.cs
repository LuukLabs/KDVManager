using System;
using System.Linq;
using System.Threading.Tasks;
using KDVManager.Services.CRM.Application.Contracts.Pagination;
using KDVManager.Services.CRM.Application.Contracts.Persistence;

namespace KDVManager.Services.CRM.Application.Features.Guardians.Queries.GetGuardianList
{
    public class GetGuardianListQueryHandler
    {
        private readonly IGuardianRepository _guardianRepository;

        public GetGuardianListQueryHandler(IGuardianRepository guardianRepository)
        {
            _guardianRepository = guardianRepository;
        }

        public async Task<PagedList<GuardianListVM>> Handle(GetGuardianListQuery request)
        {
            var allGuardians = await _guardianRepository.GetAllWithRelationshipsAsync();

            var query = allGuardians.AsQueryable();

            if (!string.IsNullOrWhiteSpace(request.Search))
            {
                query = query.Where(p =>
                    (p.GivenName != null && p.GivenName.Contains(request.Search)) ||
                    (p.FamilyName != null && p.FamilyName.Contains(request.Search)) ||
                    (p.Email != null && p.Email.Contains(request.Search)) ||
                    p.PhoneNumbers.Any(n => n.Number.Contains(request.Search)));
            }

            var totalCount = query.Count();

            var guardians = query
                .Skip((request.PageNumber - 1) * request.PageSize)
                .Take(request.PageSize)
                .Select(p => new GuardianListVM
                {
                    Id = p.Id,
                    FullName = $"{p.GivenName} {p.FamilyName}",
                    Email = p.Email,
                    PrimaryPhoneNumber = p.PhoneNumbers
                        .OrderBy(n => n.Type) // deterministic
                        .Select(n => n.Number)
                        .FirstOrDefault(),
                    PhoneNumberCount = p.PhoneNumbers.Count,
                })
                .ToList();

            return new PagedList<GuardianListVM>(guardians, totalCount);
        }
    }
}
