namespace KDVManager.Services.CRM.Application.Features.Children.Queries.GetPhoneList;

/// <summary>
/// Query to retrieve a phone list for children active in a specific year.
/// </summary>
public class GetPhoneListQuery
{
    /// <summary>
    /// The year for which to retrieve active children. 
    /// A child is considered active if they have an activity interval that overlaps with any part of the year.
    /// </summary>
    public int Year { get; set; }
}
