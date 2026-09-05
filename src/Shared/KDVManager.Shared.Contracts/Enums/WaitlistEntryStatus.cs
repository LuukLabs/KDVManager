using System.Text.Json.Serialization;

namespace KDVManager.Shared.Contracts.Enums;

/// <summary>
/// The current lifecycle state of a prospective child's waitlist request.
/// </summary>
[JsonConverter(typeof(JsonStringEnumConverter<WaitlistEntryStatus>))]
public enum WaitlistEntryStatus
{
    Waiting = 0,
    Offered = 1,
    Placed = 2,
    Withdrawn = 3
}
