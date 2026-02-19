using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using KDVManager.Services.CRM.Application.Contracts.Persistence;

namespace KDVManager.Services.CRM.Application.Features.Children.Queries.GetNewsletterRecipients;

public class GetNewsletterRecipientsQueryHandler
{
    private readonly IChildRepository _childRepository;
    private readonly IChildGuardianRepository _childGuardianRepository;
    private readonly IGuardianRepository _guardianRepository;

    public GetNewsletterRecipientsQueryHandler(
        IChildRepository childRepository,
        IChildGuardianRepository childGuardianRepository,
        IGuardianRepository guardianRepository)
    {
        _childRepository = childRepository;
        _childGuardianRepository = childGuardianRepository;
        _guardianRepository = guardianRepository;
    }

    public async Task<NewsletterRecipientsResponse> Handle(GetNewsletterRecipientsQuery request)
    {
        // Calculate the period for the requested month (same overlap logic as phone list)
        var monthStart = new DateOnly(request.Year, request.Month, 1);
        var monthEnd = monthStart.AddMonths(1).AddDays(-1);

        var activeChildren = await _childRepository.GetActiveChildrenInPeriodAsync(monthStart, monthEnd);

        // Collect unique guardian emails
        var seenGuardianIds = new HashSet<Guid>();
        var recipients = new List<NewsletterRecipientVM>();

        foreach (var child in activeChildren)
        {
            var childGuardians = await _childGuardianRepository.GetByChildIdAsync(child.Id);

            foreach (var cg in childGuardians)
            {
                if (seenGuardianIds.Contains(cg.GuardianId))
                    continue;

                seenGuardianIds.Add(cg.GuardianId);

                var guardian = await _guardianRepository.GetByIdWithRelationshipsAsync(cg.GuardianId);
                if (guardian == null || string.IsNullOrWhiteSpace(guardian.Email))
                    continue;

                recipients.Add(new NewsletterRecipientVM
                {
                    GuardianId = guardian.Id,
                    FullName = $"{guardian.GivenName} {guardian.FamilyName}".Trim(),
                    Email = guardian.Email
                });
            }
        }

        return new NewsletterRecipientsResponse
        {
            Year = request.Year,
            Month = request.Month,
            GeneratedAt = DateTime.UtcNow,
            TotalActiveChildren = activeChildren.Count,
            Recipients = recipients.OrderBy(r => r.FullName).ToList()
        };
    }
}
