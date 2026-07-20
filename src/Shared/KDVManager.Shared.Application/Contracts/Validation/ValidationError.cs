namespace KDVManager.Shared.Application.Contracts.Validation;

public class ValidationError
{
    public required string Code { get; init; }
    public required string Property { get; init; }
    public required string Title { get; init; }
}
