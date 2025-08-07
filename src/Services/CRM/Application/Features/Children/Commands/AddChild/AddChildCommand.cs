using System;
using System.ComponentModel.DataAnnotations;

namespace KDVManager.Services.CRM.Application.Features.Children.Commands.AddChild;

public class AddChildCommand
{
    [property: Required]
    public string? GivenName { get; set; }

    [property: Required]
    public string? FamilyName { get; set; }

    [property: Required]
    public DateOnly? DateOfBirth { get; set; }

    public string? CID { get; set; }
}
