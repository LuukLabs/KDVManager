using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using KDVManager.Services.Scheduling.Domain.Entities;
using KDVManager.Services.Scheduling.Application.Contracts.Persistence;
using Microsoft.EntityFrameworkCore;

namespace KDVManager.Services.Scheduling.Infrastructure.Repositories;

public class AbsenceRepository : BaseRepository<Absence>, IAbsenceRepository
{
    public AbsenceRepository(ApplicationDbContext dbContext) : base(dbContext)
    {
    }

    public async Task<List<Absence>> GetByChildIdAsync(Guid childId)
    {
        return await _dbContext.Absences.Where(a => a.ChildId == childId).ToListAsync();
    }

}

