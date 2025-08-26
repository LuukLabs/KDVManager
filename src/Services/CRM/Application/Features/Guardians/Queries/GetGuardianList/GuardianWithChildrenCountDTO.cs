using KDVManager.Services.CRM.Domain.Entities;

namespace KDVManager.Services.CRM.Application.Features.Guardians.Queries.GetGuardianList
{
    public class GuardianWithChildrenCountDTO
    {
        public Guardian Guardian { get; set; } = null!;
        public int ChildrenCount { get; set; }
    }
}
