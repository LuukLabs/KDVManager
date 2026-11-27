using System.Text.Json.Serialization;

namespace KDVManager.Shared.Contracts.Enums;

[JsonConverter(typeof(JsonStringEnumConverter<ChildcareType>))]
public enum ChildcareType
{
    Daycare,
    AfterSchool
}
