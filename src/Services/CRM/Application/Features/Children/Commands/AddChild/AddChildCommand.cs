using System;

namespace KDVManager.Services.CRM.Application.Features.Children.Commands.AddChild;

public class AddChildCommand
{
    public string GivenName { get; set; }

    public string FamilyName { get; set; }

    public DateOnly DateOfBirth { get; set; }

    public string CID { get; set; }
}
