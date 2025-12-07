using System;

namespace KDVManager.Services.Scheduling.Application.Features.Compliance.Commands.UploadComplianceDocument;

public class UploadComplianceDocumentCommand
{
    public Guid GroupId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string FileName { get; set; } = string.Empty;
    public string ContentType { get; set; } = string.Empty;
    public byte[] Data { get; set; } = Array.Empty<byte>();
    public DateTime? ValidFromUtc { get; set; }
    public DateTime? ValidUntilUtc { get; set; }
    public string? UploadedBy { get; set; }
}
