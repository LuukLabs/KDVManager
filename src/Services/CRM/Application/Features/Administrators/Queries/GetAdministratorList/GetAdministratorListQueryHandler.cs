using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using KDVManager.Services.CRM.Application.Contracts.Identity;

namespace KDVManager.Services.CRM.Application.Features.Administrators.Queries.GetAdministratorList;

public class GetAdministratorListQueryHandler
{
    private readonly IAuth0ManagementService _auth0;
    private readonly IOrganizationContext _organizationContext;

    public GetAdministratorListQueryHandler(IAuth0ManagementService auth0, IOrganizationContext organizationContext)
    {
        _auth0 = auth0;
        _organizationContext = organizationContext;
    }

    public async Task<List<AdministratorListVM>> Handle(GetAdministratorListQuery request, CancellationToken cancellationToken = default)
    {
        var organizationId = _organizationContext.OrganizationId;

        var members = await _auth0.GetOrganizationMembersAsync(organizationId, cancellationToken);
        var invitations = await _auth0.GetPendingInvitationsAsync(organizationId, cancellationToken);

        var result = members
            .Select(m => new AdministratorListVM
            {
                Id = m.UserId,
                Email = m.Email ?? string.Empty,
                Name = m.Name,
                Picture = m.Picture,
                Status = "Active",
            })
            .Concat(invitations.Select(i => new AdministratorListVM
            {
                Id = i.Id,
                Email = i.InviteeEmail ?? string.Empty,
                Name = null,
                Picture = null,
                Status = "Pending",
            }))
            .ToList();

        return result;
    }
}
