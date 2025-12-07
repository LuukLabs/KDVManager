using System;

namespace KDVManager.Services.Scheduling.Application.Features.Compliance.Queries.ListGroupComplianceSnapshots;

public class ListGroupComplianceSnapshotsQuery
{
    public Guid GroupId { get; set; }
    public DateTime FromUtc { get; set; }
    public DateTime ToUtc { get; set; }
}
