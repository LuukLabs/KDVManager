using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using CrmContext = KDVManager.Services.CRM.Infrastructure.ApplicationDbContext;

namespace KDVManager.Services.DataMigration;

public class FindChildQuery
{
    private readonly CrmContext _context;
    private readonly IConfiguration _configuration;

    public FindChildQuery(CrmContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    public async Task FindChildByNameAsync(string name)
    {
        Console.WriteLine($"Searching for children with name containing '{name}'...");

        var children = await _context.Children
            .Where(c => c.GivenName.Contains(name) || c.FamilyName.Contains(name))
            .ToListAsync();

        if (children.Count == 0)
        {
            Console.WriteLine($"No children found with name containing '{name}'");
            return;
        }

        Console.WriteLine($"Found {children.Count} children:");
        foreach (var child in children)
        {
            Console.WriteLine($"- ID: {child.Id}");
            Console.WriteLine($"  Name: {child.GivenName} {child.FamilyName}");
            Console.WriteLine($"  CID: {child.CID}");
            Console.WriteLine($"  Date of Birth: {child.DateOfBirth?.ToString("yyyy-MM-dd")}");
            Console.WriteLine();
        }
    }
}
