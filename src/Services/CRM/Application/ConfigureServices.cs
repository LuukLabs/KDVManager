using System.Reflection;
using KDVManager.Services.CRM.Application.Features.Children.Commands.ArchiveChild;
using KDVManager.Services.CRM.Application.Features.Children.Commands.CreateChild;
using KDVManager.Services.CRM.Application.Features.Children.Commands.UpdateChild;
using KDVManager.Services.CRM.Application.Features.Children.Commands.DeleteChild;
using KDVManager.Services.CRM.Application.Features.Children.Queries.GetChildList;
using KDVManager.Services.CRM.Application.Features.Children.Queries.GetChildDetail;
using KDVManager.Services.CRM.Application.Features.People.Commands.AddPerson;
using KDVManager.Services.CRM.Application.Features.People.Queries.GetPersonList;

namespace Microsoft.Extensions.DependencyInjection;

public static class ConfigureServices
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        // Register handlers
        services.AddScoped<ArchiveChildCommandHandler>();
        services.AddScoped<CreateChildCommandHandler>();
        services.AddScoped<UpdateChildCommandHandler>();
        services.AddScoped<DeleteChildCommandHandler>();
        services.AddScoped<GetChildListQueryHandler>();
        services.AddScoped<GetChildDetailQueryHandler>();
        services.AddScoped<AddPersonCommandHandler>();
        services.AddScoped<GetPersonListQueryHandler>();

        return services;
    }
}
