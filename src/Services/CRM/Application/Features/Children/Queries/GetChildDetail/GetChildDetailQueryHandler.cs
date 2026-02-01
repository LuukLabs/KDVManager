using System.Threading.Tasks;
using KDVManager.Services.CRM.Application.Contracts.Persistence;
using KDVManager.Services.CRM.Domain.Entities;

namespace KDVManager.Services.CRM.Application.Features.Children.Queries.GetChildDetail;

public class GetChildDetailQueryHandler
{
    private readonly IChildRepository _childRepository;

    public GetChildDetailQueryHandler(IChildRepository childRepository)
    {
        _childRepository = childRepository;
    }

    public async Task<ChildDetailVM> Handle(GetChildDetailQuery request)
    {
        var child = await _childRepository.GetByIdAsync(request.Id);

        if (child == null)
        {
            throw new Exceptions.NotFoundException(nameof(Child), request.Id);
        }

        return new ChildDetailVM
        {
            Id = child.Id,
            GivenName = child.GivenName,
            FamilyName = child.FamilyName,
            DateOfBirth = child.DateOfBirth,
            CID = child.CID,
            ChildNumber = child.ChildNumber,
            IsActive = child.IsActive,
            LastActiveDate = child.LastActiveDate
        };
    }
}
