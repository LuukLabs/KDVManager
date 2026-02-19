using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace KDVManager.Services.CRM.Application.Features.Children.Queries.GetNewsletterRecipients;

/// <summary>
/// Response containing unique email addresses of guardians linked to active children.
/// </summary>
public class NewsletterRecipientsResponse
{
    /// <summary>
    /// The year this recipient list is for.
    /// </summary>
    [Required]
    public int Year { get; set; }

    /// <summary>
    /// The month this recipient list is for.
    /// </summary>
    [Required]
    public int Month { get; set; }

    /// <summary>
    /// The date/time when this list was generated.
    /// </summary>
    [Required]
    public DateTime GeneratedAt { get; set; }

    /// <summary>
    /// Total number of active children in the selected period.
    /// </summary>
    [Required]
    public int TotalActiveChildren { get; set; }

    /// <summary>
    /// List of unique email addresses with guardian details.
    /// </summary>
    [Required]
    public List<NewsletterRecipientVM> Recipients { get; set; } = [];
}

/// <summary>
/// View model for a newsletter recipient (unique email address).
/// </summary>
public class NewsletterRecipientVM
{
    /// <summary>
    /// The guardian's unique identifier.
    /// </summary>
    [Required]
    public Guid GuardianId { get; set; }

    /// <summary>
    /// The guardian's full name.
    /// </summary>
    [Required]
    public required string FullName { get; set; }

    /// <summary>
    /// The guardian's email address.
    /// </summary>
    [Required]
    public required string Email { get; set; }
}
