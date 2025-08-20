using System;

namespace KDVManager.Services.Scheduling.Application.Features.Children.Commands.AddChild;

public class AddChildCommand
{
    public Guid Id { get; set; }
    public DateOnly DateOfBirth { get; set; }
    public string GivenName { get; set; } = string.Empty;
    public string FamilyName { get; set; } = string.Empty;
}

