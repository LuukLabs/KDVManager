namespace KDVManager.Services.Scheduling.Application.Contracts.Validation;

public class ValidationError
{
    public required string Code { get; set; }
    public required string Property { get; set; }
    public required string Title { get; set; }
}
