using System;
using MediatR;

namespace KDVManager.Services.CRM.Application.Features.Children.Commands.CreateChild
{
    public class CreateChildCommand : IRequest<Guid>
    {
        public string GivenName { get; set; }

        public string FamilyName { get; set; }

        public DateTime? DateOfBirth { get; set; }

        public string CID { get; set; }
    }
}
