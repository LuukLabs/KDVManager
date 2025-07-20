using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;
using KDVManager.Shared.Contracts.Tenancy;
using KDVManager.Shared.Infrastructure.Tenancy;

namespace KDVManager.Services.Scheduling.Infrastructure;

public class ApplicationDbContextFactory : IDesignTimeDbContextFactory<ApplicationDbContext>
{
    public ApplicationDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<ApplicationDbContext>();
        optionsBuilder.UseNpgsql("Server=127.0.0.1; port=5432; database=KDVManagerSchedulingDB; pooling=true;");

        // Create a dummy tenant provider with a default tenant ID
        ITenancyContext tenancyContext = new StaticTenancyContext(Guid.Empty);
        ITenancyContextAccessor tenancyContextAccessor = new TenancyContextAccessor { Current = tenancyContext };

        return new ApplicationDbContext(optionsBuilder.Options, tenancyContextAccessor);
    }
}
