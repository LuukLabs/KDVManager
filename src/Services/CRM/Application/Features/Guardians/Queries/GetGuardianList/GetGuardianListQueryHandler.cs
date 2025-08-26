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
            var guardianResults = await _guardianRepository.PagedWithChildrenCountAsync(request, request.Search);
            var totalCount = await _guardianRepository.CountAsync(request.Search);

            var guardianVMs = guardianResults.Select(result => new GuardianListVM
            {
                Id = result.Guardian.Id,
                FullName = $"{result.Guardian.GivenName} {result.Guardian.FamilyName}",
                Email = result.Guardian.Email,
                PrimaryPhoneNumber = result.Guardian.PhoneNumbers?
                    .OrderBy(n => n.Type) // deterministic
                    .Select(n => n.Number)
                    .FirstOrDefault(),
                PhoneNumberCount = result.Guardian.PhoneNumbers?.Count ?? 0,
                ChildrenCount = result.ChildrenCount
            }).ToList();

            return new PagedList<GuardianListVM>(guardianVMs, totalCount);
        }
    }
}
