using System;
using System.Text.Json.Serialization;
using MediatR;

namespace KDVManager.Services.CRM.Application.Features.Children.Commands.UpdateChild
{
    public class UpdateChildCommand : IRequest
    {
        [JsonIgnore]
        public Guid Id { get; set; }

        public string GivenName { get; set; }

        public string FamilyName { get; set; }

        public DateTime? DateOfBirth { get; set; }
    }
}
