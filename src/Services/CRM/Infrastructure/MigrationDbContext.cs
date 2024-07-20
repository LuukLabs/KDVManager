using KDVManager.Services.CRM.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace KDVManager.Services.CRM.Infrastructure
{
    public class MigrationDbContext : DbContext
    {
        public MigrationDbContext(DbContextOptions<MigrationDbContext> options) : base(options)
        {
        }

        public DbSet<Child> Children { get; set; }

        public DbSet<Person> People { get; set; }
    }
}
