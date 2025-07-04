using System;
using KDVManager.Services.Scheduling.Application.Contracts.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;

namespace KDVManager.Services.Scheduling.Infrastructure;

public class ApplicationDbContextFactory : IDesignTimeDbContextFactory<ApplicationDbContext>
{
    public ApplicationDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<ApplicationDbContext>();
        optionsBuilder.UseNpgsql("Server=127.0.0.1; port=5432; database=KDVManagerSchedulingDB; pooling=true;");

        // Create a dummy tenant provider with a default tenant ID
        ITenantService tenantService = new DummyTenantService { Tenant = Guid.NewGuid() };

        return new ApplicationDbContext(optionsBuilder.Options, tenantService);
    }
}

public class DummyTenantService : ITenantService
{
    public Guid Tenant { get; set; }
}
