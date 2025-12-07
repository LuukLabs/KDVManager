using System;

namespace KDVManager.Services.Scheduling.Application.Features.Compliance.Queries.GetGroupComplianceSnapshot;

public class GetGroupComplianceSnapshotQuery
{
    public Guid GroupId { get; set; }
    public DateTime? AtUtc { get; set; }
    public bool Refresh { get; set; } = true;
}
