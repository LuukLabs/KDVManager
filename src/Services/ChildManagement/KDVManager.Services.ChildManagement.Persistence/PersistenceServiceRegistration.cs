using System;
using KDVManager.Services.ChildManagement.Application.Contracts.Persistence;
using KDVManager.Services.ChildManagement.Persistence.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace KDVManager.Services.ChildManagement.Persistence
{
    public static class PersistenceServiceRegistration
    {
        public static IServiceCollection AddPersistenceServices(this IServiceCollection services, IConfiguration configuration)
        {
            services.AddDbContext<ChildManagementDbContext>(options =>
                options.UseNpgsql(configuration.GetConnectionString("KDVManagerChildManagementConnectionString")));

            services.AddScoped(typeof(IAsyncRepository<>), typeof(BaseRepository<>));

            services.AddScoped<IChildRepository, ChildRepository>();

            return services;
        }
    }
}
