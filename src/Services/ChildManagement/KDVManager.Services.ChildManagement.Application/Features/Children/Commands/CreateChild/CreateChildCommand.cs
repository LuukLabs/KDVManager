using System;
using MediatR;

namespace KDVManager.Services.ChildManagement.Application.Features.Children.Commands.CreateChild
{
    public class CreateChildCommand : IRequest<Guid>
    {
        public string Name { get; set; }

    }
}
