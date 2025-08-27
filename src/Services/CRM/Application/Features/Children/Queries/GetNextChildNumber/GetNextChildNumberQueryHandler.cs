using System.Threading.Tasks;
using KDVManager.Services.CRM.Application.Contracts.Services;

namespace KDVManager.Services.CRM.Application.Features.Children.Queries.GetNextChildNumber;

public class GetNextChildNumberQueryHandler
{
    private readonly IChildNumberSequenceService _childNumberSequenceService;

    public GetNextChildNumberQueryHandler(IChildNumberSequenceService childNumberSequenceService)
    {
        _childNumberSequenceService = childNumberSequenceService;
    }

    public async Task<int> Handle(GetNextChildNumberQuery request)
    {
        return await _childNumberSequenceService.PeekNextChildNumberAsync();
    }
}
