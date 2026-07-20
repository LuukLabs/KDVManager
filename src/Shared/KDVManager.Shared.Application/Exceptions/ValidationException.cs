using FluentValidation.Results;
using KDVManager.Shared.Application.Contracts.Validation;

namespace KDVManager.Shared.Application.Exceptions;

public class ValidationException : ApplicationException
{
    public ValidationException(ValidationResult validationResult)
    {
        ValidationErrors = validationResult.Errors.Select(error => new ValidationError
        {
            Code = error.ErrorCode,
            Property = error.PropertyName,
            Title = error.ErrorMessage
        }).ToList();
    }

    public IReadOnlyList<ValidationError> ValidationErrors { get; }
}
