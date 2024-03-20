using System.ComponentModel.DataAnnotations;
using KDVManager.Services.Scheduling.Application.Exceptions;
using ValidationException = KDVManager.Services.Scheduling.Application.Exceptions.ValidationException;

public class ValidationError
{
    [Required]
    public required string Property { get; set; }

    [Required]
    public required string Code { get; set; }

    [Required]
    public required string Title { get; set; }
}

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