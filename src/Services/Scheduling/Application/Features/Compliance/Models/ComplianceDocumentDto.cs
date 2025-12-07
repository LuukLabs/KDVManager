using System;

namespace KDVManager.Services.Scheduling.Application.Features.Compliance.Models;

public class ComplianceDocumentDto
{
    public Guid Id { get; set; }
    public Guid GroupId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string FileName { get; set; } = string.Empty;
    public string ContentType { get; set; } = string.Empty;
    public DateTime UploadedAtUtc { get; set; }
    public string? UploadedBy { get; set; }
    public DateTime? ValidFromUtc { get; set; }
    public DateTime? ValidUntilUtc { get; set; }
}
