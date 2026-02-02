using System.Reflection;
using KDVManager.Services.CRM.Application.Features.Children.Commands.AddChild;
using KDVManager.Services.CRM.Application.Features.Children.Commands.UpdateChild;
using KDVManager.Services.CRM.Application.Features.Children.Commands.DeleteChild;
using KDVManager.Services.CRM.Application.Features.Children.Queries.GetChildList;
using KDVManager.Services.CRM.Application.Features.Children.Queries.GetNextChildNumber;
using KDVManager.Services.CRM.Application.Features.Children.Queries.GetChildDetail;
using KDVManager.Services.CRM.Application.Features.Children.Queries.GetPhoneList;
using KDVManager.Services.CRM.Application.Features.Guardians.Commands.UpdateGuardian;
using KDVManager.Services.CRM.Application.Features.Guardians.Commands.DeleteGuardian;
using KDVManager.Services.CRM.Application.Features.Guardians.Queries.GetGuardianList;
using KDVManager.Services.CRM.Application.Features.Guardians.Queries.GetGuardianDetail;
using KDVManager.Services.CRM.Application.Features.Guardians.Commands.LinkGuardianToChild;
using KDVManager.Services.CRM.Application.Features.Guardians.Commands.UnlinkGuardianFromChild;
using Microsoft.Extensions.Configuration;
using KDVManager.Services.CRM.Application.Features.Guardians.Commands.AddGuardian;
using KDVManager.Services.CRM.Application.Features.Guardians.Queries.GetChildGuardians;
using KDVManager.Services.CRM.Application.Features.Guardians.Queries.GetGuardianChildren;

namespace Microsoft.Extensions.DependencyInjection;

public static class ConfigureServices
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        // Register handlers
        services.AddScoped<AddChildCommandHandler>();
        services.AddScoped<UpdateChildCommandHandler>();
        services.AddScoped<DeleteChildCommandHandler>();
        services.AddScoped<GetChildListQueryHandler>();
        services.AddScoped<GetNextChildNumberQueryHandler>();
        services.AddScoped<GetChildDetailQueryHandler>();
        services.AddScoped<GetPhoneListQueryHandler>();
        services.AddScoped<AddGuardianCommandHandler>();
        services.AddScoped<UpdateGuardianCommandHandler>();
        services.AddScoped<DeleteGuardianCommandHandler>();
        services.AddScoped<GetChildGuardiansQueryHandler>();
        services.AddScoped<GetGuardianChildrenQueryHandler>();
        services.AddScoped<GetGuardianListQueryHandler>();
        services.AddScoped<GetGuardianDetailQueryHandler>();
        services.AddScoped<LinkGuardianToChildCommandHandler>();
        services.AddScoped<UnlinkGuardianFromChildCommandHandler>();


        return services;
    }
}
