using System;
using MediatR;

namespace KDVManager.Services.ChildManagement.Application.Features.Children.Queries.GetChildDetail
{
    public class GetChildDetailQuery: IRequest<ChildDetailVM>
    {
         public Guid Id { get; set; }
    }
}
