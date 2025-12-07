using System;
using System.ComponentModel.DataAnnotations;

namespace KDVManager.Services.Scheduling.Api.Requests.Compliance;

public class UploadComplianceDocumentRequest
{
    [Required]
    public Guid GroupId { get; set; }

    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [Required]
    [MaxLength(255)]
    public string FileName { get; set; } = string.Empty;

    [Required]
    [MaxLength(128)]
    public string ContentType { get; set; } = string.Empty;

    /// <summary>
    /// Base64 encoded payload of the document.
    /// </summary>
    [Required]
    public string DataBase64 { get; set; } = string.Empty;

    public DateTime? ValidFromUtc { get; set; }
    public DateTime? ValidUntilUtc { get; set; }
    public string? UploadedBy { get; set; }
}
