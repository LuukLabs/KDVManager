using System.ComponentModel.DataAnnotations;

namespace KDVManager.Shared.Application.Contracts.Validation;

public class ValidationError
{
    [Required]
    public required string Property { get; set; }

    [Required]
    public required string Code { get; set; }

    [Required]
    public required string Title { get; set; }
}
