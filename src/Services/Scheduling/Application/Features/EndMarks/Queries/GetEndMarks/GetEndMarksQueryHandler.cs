using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using KDVManager.Services.Scheduling.Application.Contracts.Persistence;

namespace KDVManager.Services.Scheduling.Application.Features.EndMarks.Queries.GetEndMarks;

public class GetEndMarksQueryHandler
{
    private readonly IEndMarkRepository _repo;
    public GetEndMarksQueryHandler(IEndMarkRepository repo) { _repo = repo; }

    public async Task<IReadOnlyList<EndMarkDto>> Handle(GetEndMarksQuery request)
    {
        var marks = await _repo.GetByChildIdAsync(request.ChildId);
        return marks.Select(m => new EndMarkDto
        {
            Id = m.Id,
            EndDate = m.EndDate,
            Reason = m.Reason,
            IsSystemGenerated = m.IsSystemGenerated
        }).ToList();
    }
}

public class EndMarkDto
{
    public System.Guid Id { get; set; }
    public System.DateOnly EndDate { get; set; }
    public string? Reason { get; set; }
    public bool IsSystemGenerated { get; set; }
}
