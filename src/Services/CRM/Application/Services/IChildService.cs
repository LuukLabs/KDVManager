using System;
using System.Threading.Tasks;
using KDVManager.Services.CRM.Application.Contracts.Pagination;
using KDVManager.Services.CRM.Application.Features.Children.Commands.CreateChild;
using KDVManager.Services.CRM.Application.Features.Children.Commands.UpdateChild;
using KDVManager.Services.CRM.Application.Features.Children.Queries.GetChildDetail;
using KDVManager.Services.CRM.Application.Features.Children.Queries.GetChildList;

namespace KDVManager.Services.CRM.Application.Services;

public interface IChildService
{
    Task<PagedList<ChildListVM>> GetChildListAsync(GetChildListQuery query);
    Task<ChildDetailVM> GetChildDetailAsync(Guid id);
    Task<Guid> CreateChildAsync(CreateChildCommand command);
    Task UpdateChildAsync(UpdateChildCommand command);
    Task DeleteChildAsync(Guid id);
}
