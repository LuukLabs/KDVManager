using KDVManager.Services.Scheduling.Domain.Entities;

namespace KDVManager.Services.Scheduling.Application.Contracts.Persistence;

public interface IAttendanceRepository
{
    Task<AttendanceRecord?> GetAsync(Guid childId, DateOnly date);
    Task<AttendanceRecord> UpsertAsync(AttendanceRecord record, AttendanceAuditEntry auditEntry);
}
