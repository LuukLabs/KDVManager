using System.Threading.Tasks;
using KDVManager.Services.CRM.Application.Contracts.Persistence;
using KDVManager.Services.CRM.Application.Contracts.Services;
using KDVManager.Services.CRM.Application.Exceptions;

namespace KDVManager.Services.CRM.Application.Features.Administrators.Commands.DeleteAdministrator
{
    public class DeleteAdministratorCommandHandler
    {
        private readonly IAdministratorRepository _administratorRepository;
        private readonly IAuth0ManagementService _auth0ManagementService;

        public DeleteAdministratorCommandHandler(IAdministratorRepository administratorRepository, IAuth0ManagementService auth0ManagementService)
        {
            _administratorRepository = administratorRepository;
            _auth0ManagementService = auth0ManagementService;
        }

        public async Task Handle(DeleteAdministratorCommand command)
        {
            var administrator = await _administratorRepository.GetByIdAsync(command.Id);

            if (administrator == null)
            {
                throw new NotFoundException(nameof(Domain.Entities.Administrator), command.Id);
            }

            await _auth0ManagementService.DeleteUserAsync(administrator.Auth0UserId);
            await _administratorRepository.DeleteAsync(administrator);
        }
    }
}
