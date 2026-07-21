using System.Threading;
using System.Threading.Tasks;
using KDVManager.Services.TenantManagement.Application.Contracts.Persistence;
using KDVManager.Services.TenantManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace KDVManager.Services.TenantManagement.Infrastructure.Repositories;

public class MembershipRepository : IMembershipRepository
{
    private readonly ApplicationDbContext _dbContext;

    public MembershipRepository(ApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public Task<Membership?> GetByUserIdAsync(string userId, CancellationToken cancellationToken = default)
    {
        return _dbContext.Memberships.FirstOrDefaultAsync(m => m.UserId == userId, cancellationToken);
    }

    public async Task AddAsync(Membership membership, CancellationToken cancellationToken = default)
    {
        _dbContext.Memberships.Add(membership);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }
}
