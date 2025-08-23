using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using KDVManager.Services.CRM.Application.Contracts.Persistence;
using KDVManager.Services.CRM.Application.Contracts.Pagination;

namespace KDVManager.Services.CRM.Application.Features.Children.Queries.GetChildList;

public class GetChildListQueryHandler
{
    private readonly IChildRepository _childRepository;

    public GetChildListQueryHandler(IChildRepository childRepository)
    {
        _childRepository = childRepository;
    }

    public async Task<PagedList<ChildListVM>> Handle(GetChildListQuery request)
    {
        var children = await _childRepository.PagedAsync(request, request.Search);
        var count = await _childRepository.CountAsync(request.Search);

        List<ChildListVM> childListVMs = children.Select(child => new ChildListVM
        {
            Id = child.Id,
            FullName = (child.GivenName + " " + child.FamilyName).Trim(),
            DateOfBirth = child.DateOfBirth
        }).ToList();

        return new PagedList<ChildListVM>(childListVMs, count);
    }
}
