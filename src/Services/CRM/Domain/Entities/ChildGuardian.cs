using System;
using System.Text.Json.Serialization;
using KDVManager.Services.CRM.Domain.Interfaces;

namespace KDVManager.Services.CRM.Domain.Entities
{
    public class ChildGuardian : IMustHaveTenant
    {
        public Guid Id { get; set; }
        public Guid TenantId { get; set; }
        public Guid ChildId { get; set; }
        public Guid GuardianId { get; set; }
        public GuardianRelationshipType RelationshipType { get; set; }
        public bool IsPrimaryContact { get; set; }
        public bool IsEmergencyContact { get; set; }
    }

    [JsonConverter(typeof(JsonStringEnumConverter<GuardianRelationshipType>))]
    public enum GuardianRelationshipType
    {
        Parent = 0,
        Guardian = 1,
        Grandparent = 2,
        Other = 3
    }
}
