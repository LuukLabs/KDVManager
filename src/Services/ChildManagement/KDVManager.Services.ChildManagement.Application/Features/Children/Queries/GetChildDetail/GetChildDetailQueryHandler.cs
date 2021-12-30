using System;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using KDVManager.Services.ChildManagement.Application.Contracts.Persistence;
using KDVManager.Services.ChildManagement.Domain.Entities;
using MediatR;
namespace KDVManager.Services.ChildManagement.Application.Features.Children.Queries.GetChildDetail
{
    public class GetChildDetailQueryHandler : IRequestHandler<GetChildDetailQuery, ChildDetailVM>
    {
        private readonly IAsyncRepository<Child> _childRepository;
        private readonly IMapper _mapper;

        public GetChildDetailQueryHandler(IAsyncRepository<Child> childRepository, IMapper mapper)
        {
            _childRepository = childRepository;
            _mapper = mapper;
        }

        public async Task<ChildDetailVM> Handle(GetChildDetailQuery request, CancellationToken cancellationToken)
        {
            var child = await _childRepository.GetByIdAsync(request.Id);
            return _mapper.Map<Child, ChildDetailVM>(child);
        }
    }
}
