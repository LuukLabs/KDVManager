using System.ComponentModel.DataAnnotations;
using KDVManager.Shared.Application.Contracts.Validation;
using ValidationException = KDVManager.Shared.Application.Exceptions.ValidationException;

namespace KDVManager.Shared.Infrastructure.Http;

public class UnprocessableEntityResponse
{
    [Required]
    public int Status { get; set; }

    [Required]
    public IEnumerable<ValidationError> Errors { get; set; } = new List<ValidationError>();

    public UnprocessableEntityResponse(int status, ValidationException validationException)
    {
        Status = status;
        Errors = validationException.ValidationErrors.Select(ve => new ValidationError
        {
            Property = System.Text.Json.JsonNamingPolicy.CamelCase.ConvertName(ve.Property),
            Code = ve.Code,
            Title = ve.Title
        });
    }
}
