using System;
namespace KDVManager.Services.Scheduling.Application.Contracts.Validation;

public class ValidationError
{
    public string Code { get; set; }
    public string Property { get; set; }
    public string Title { get; set; }
}
