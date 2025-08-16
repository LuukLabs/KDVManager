using System;
using KDVManager.Services.CRM.Domain.Entities;

namespace KDVManager.Services.CRM.Application.Features.Guardians.Commands.LinkGuardianToChild
{
    public class LinkGuardianToChildCommand
    {
        public Guid ChildId { get; set; }
        public Guid GuardianId { get; set; }
        public GuardianRelationshipType RelationshipType { get; set; }
        public bool IsPrimaryContact { get; set; }
        public bool IsEmergencyContact { get; set; }
    }
}
