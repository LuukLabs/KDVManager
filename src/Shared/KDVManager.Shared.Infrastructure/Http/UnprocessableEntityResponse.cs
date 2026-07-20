using System.ComponentModel.DataAnnotations;
using ApplicationValidationException = KDVManager.Shared.Application.Exceptions.ValidationException;

namespace KDVManager.Shared.Infrastructure.Http;

public sealed class ValidationError
{
    [Required]
    public required string Property { get; init; }

    [Required]
    public required string Code { get; init; }

    [Required]
    public required string Title { get; init; }
}

public sealed class UnprocessableEntityResponse
{
    public UnprocessableEntityResponse(int status, ApplicationValidationException validationException)
    {
        Status = status;
        Errors = validationException.ValidationErrors.Select(error => new ValidationError
        {
            Property = System.Text.Json.JsonNamingPolicy.CamelCase.ConvertName(error.Property),
            Code = error.Code,
            Title = error.Title
        });
    }

    [Required]
    public int Status { get; set; }

    [Required]
    public IEnumerable<ValidationError> Errors { get; set; }
}
