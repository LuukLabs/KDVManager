using System;
using KDVManager.Services.Scheduling.Domain.Models;

namespace KDVManager.Services.Scheduling.Api.Responses;

public class ComplianceSnapshotResponse
{
    public Guid Id { get; set; }
    public Guid GroupId { get; set; }
    public DateTime CapturedAtUtc { get; set; }
    public int PresentChildrenCount { get; set; }
    public double RequiredStaffCount { get; set; }
    public int QualifiedStaffCount { get; set; }
    public double BufferPercent { get; set; }
    public ComplianceStatus Status { get; set; }
    public string? Notes { get; set; }
}
