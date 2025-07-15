using System;

namespace KDVManager.Services.CRM.Application.Features.Children.Commands.CreateChild
{
    public class CreateChildCommand
    {
        public string GivenName { get; set; }

        public string FamilyName { get; set; }

        public DateOnly DateOfBirth { get; set; }

        public string CID { get; set; }
    }
}
