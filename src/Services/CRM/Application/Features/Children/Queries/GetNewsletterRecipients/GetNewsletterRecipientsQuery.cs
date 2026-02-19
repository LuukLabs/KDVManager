namespace KDVManager.Services.CRM.Application.Features.Children.Queries.GetNewsletterRecipients;

/// <summary>
/// Query to retrieve unique guardian email addresses for children active in a specific month.
/// Uses the same activity interval overlap logic as the phone list.
/// </summary>
public class GetNewsletterRecipientsQuery
{
    /// <summary>
    /// The year for which to check active children.
    /// </summary>
    public int Year { get; set; }

    /// <summary>
    /// The month (1-12) for which to check active children.
    /// </summary>
    public int Month { get; set; }
}
