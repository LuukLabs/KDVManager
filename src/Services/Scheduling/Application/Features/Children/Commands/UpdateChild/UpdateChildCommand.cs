using System;

namespace KDVManager.Services.Scheduling.Application.Features.Children.Commands.UpdateChild;

public class UpdateChildCommand
{
    public Guid Id { get; set; }
    public DateOnly DateOfBirth { get; set; }
}

