using Microsoft.AspNetCore.Builder;

namespace KDVManager.Shared.Infrastructure.Trial;

public static class TrialEnforcementExtensions
{
    /// <summary>
    /// Adds the <see cref="TrialEnforcementMiddleware"/> to the pipeline. Must run
    /// after the tenancy middleware so the current tenant is resolved.
    /// </summary>
    public static IApplicationBuilder UseTrialEnforcement(this IApplicationBuilder app)
    {
        return app.UseMiddleware<TrialEnforcementMiddleware>();
    }
}
