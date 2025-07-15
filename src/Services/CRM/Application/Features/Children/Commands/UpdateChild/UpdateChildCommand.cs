using System;
using System.Text.Json.Serialization;

namespace KDVManager.Services.CRM.Application.Features.Children.Commands.UpdateChild
{
    public class UpdateChildCommand
    {
        [JsonIgnore]
        public Guid Id { get; set; }

        public string GivenName { get; set; }

        public string FamilyName { get; set; }

        public DateOnly DateOfBirth { get; set; }

        public string CID { get; set; }
    }
}
