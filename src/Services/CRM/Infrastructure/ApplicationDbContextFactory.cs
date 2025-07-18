using System;
using KDVManager.Shared.Domain.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;

namespace KDVManager.Services.CRM.Infrastructure;

public class ApplicationDbContextFactory : IDesignTimeDbContextFactory<ApplicationDbContext>
{
    public ApplicationDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<ApplicationDbContext>();
        optionsBuilder.UseNpgsql("Server=127.0.0.1; port=5432; database=KDVManagerCRMDB; pooling=true;");

        // Create a dummy tenant provider with a default tenant ID
        ITenantService tenantService = new DummyTenantService();

        return new ApplicationDbContext(optionsBuilder.Options, tenantService);
    }
}

public class DummyTenantService : ITenantService
{
    private readonly Guid _tenantId = Guid.NewGuid(); // Replace with a valid tenant ID for design-time

    public Guid CurrentTenant => _tenantId;

    public Guid? TryGetCurrentTenant() => _tenantId;

    public void ValidateTenant(Guid tenantId)
    {
        // Design-time factory - no validation needed
    }
}
