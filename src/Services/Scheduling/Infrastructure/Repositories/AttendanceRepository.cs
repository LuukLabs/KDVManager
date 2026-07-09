using KDVManager.Services.Scheduling.Application.Contracts.Persistence;
using KDVManager.Services.Scheduling.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace KDVManager.Services.Scheduling.Infrastructure.Repositories;

public sealed class AttendanceRepository(ApplicationDbContext dbContext) : IAttendanceRepository
{
    public Task<AttendanceRecord?> GetAsync(Guid childId, DateOnly date) =>
        dbContext.AttendanceRecords.SingleOrDefaultAsync(x => x.ChildId == childId && x.Date == date);

    public async Task<AttendanceRecord> UpsertAsync(AttendanceRecord record, AttendanceAuditEntry auditEntry)
    {
        var existing = await GetAsync(record.ChildId, record.Date);
        if (existing is null)
        {
            dbContext.AttendanceRecords.Add(record);
            auditEntry.AttendanceRecordId = record.Id;
            dbContext.AttendanceAuditEntries.Add(auditEntry);
            await dbContext.SaveChangesAsync();
            return record;
        }
        existing.CheckedInAt = record.CheckedInAt;
        existing.CheckedOutAt = record.CheckedOutAt;
        existing.UpdatedAt = record.UpdatedAt;
        auditEntry.AttendanceRecordId = existing.Id;
        dbContext.AttendanceAuditEntries.Add(auditEntry);
        await dbContext.SaveChangesAsync();
        return existing;
    }
}
