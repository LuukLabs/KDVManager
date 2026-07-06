using System.Linq;
using System.Threading.Tasks;
using KDVManager.Services.CRM.Application.Contracts.Pagination;
using KDVManager.Services.CRM.Application.Contracts.Persistence;

namespace KDVManager.Services.CRM.Application.Features.Administrators.Queries.GetAdministratorList
{
    public class GetAdministratorListQueryHandler
    {
        private readonly IAdministratorRepository _administratorRepository;

        public GetAdministratorListQueryHandler(IAdministratorRepository administratorRepository)
        {
            _administratorRepository = administratorRepository;
        }

        public async Task<PagedList<AdministratorListVM>> Handle(GetAdministratorListQuery request)
        {
            var administrators = await _administratorRepository.PagedAsync(request, request.Search);
            var totalCount = await _administratorRepository.CountAsync(request.Search);

            var administratorVMs = administrators.Select(administrator => new AdministratorListVM
            {
                Id = administrator.Id,
                Name = administrator.Name,
                Email = administrator.Email,
                CreatedAt = administrator.CreatedAt,
            }).ToList();

            return new PagedList<AdministratorListVM>(administratorVMs, totalCount);
        }
    }
}
