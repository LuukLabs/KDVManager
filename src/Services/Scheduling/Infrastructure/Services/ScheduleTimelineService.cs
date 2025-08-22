using System;
using System.Linq;
using System.Threading.Tasks;
using KDVManager.Services.Scheduling.Application.Contracts.Persistence;
using KDVManager.Services.Scheduling.Application.Services;
using KDVManager.Services.Scheduling.Domain.Services;
using Microsoft.EntityFrameworkCore;

namespace KDVManager.Services.Scheduling.Infrastructure.Services;

public class ScheduleTimelineService : IScheduleTimelineService
{
    private readonly ApplicationDbContext _db;

    public ScheduleTimelineService(ApplicationDbContext db)
    {
        _db = db;
    }

    public async Task RecalculateAsync(Guid childId)
    {
        var schedules = await _db.Schedules.Where(s => s.ChildId == childId).OrderBy(s => s.StartDate).ToListAsync();
        var endMarks = await _db.EndMarks.Where(em => em.ChildId == childId).ToListAsync();
        ScheduleEndDateCalculator.Recalculate(schedules, endMarks);
        await _db.SaveChangesAsync();
    }
}
