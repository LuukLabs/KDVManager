using System;

namespace KDVManager.Services.Scheduling.Application.Features.Compliance.Models;

public class ComplianceDocumentContentDto
{
    public Guid Id { get; set; }
    public string FileName { get; set; } = string.Empty;
    public string ContentType { get; set; } = string.Empty;
    public byte[] Data { get; set; } = Array.Empty<byte>();
    public DateTime UploadedAtUtc { get; set; }
}
