using KDVManager.Services.TenantManagement.Api.Endpoints;
using KDVManager.Shared.Infrastructure.Logging;
using KDVManager.Shared.Infrastructure.Tenancy;
using KDVManager.Shared.Infrastructure.Middleware;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddInfrastructureServices(builder.Configuration);
builder.Services.AddApplicationServices();
builder.Services.AddMassTransitServices(builder.Configuration);
builder.Services.AddApiServices(builder.Configuration);

// Structured production logging (stdout JSON + OTLP if endpoint present)
builder.Logging.AddKdvManagerLogging(builder.Configuration, "tenantmanagement-api");

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseRouting();

app.UseAuthentication();
app.UseAuthorization();

app.UseMiddleware<CorrelationIdMiddleware>();
app.UseMiddleware<TenancyMiddleware>();

// NOTE: this service intentionally does NOT apply trial enforcement. It owns the
// trial-status endpoint, which must stay reachable even after a trial expires so
// the web app can render the lock screen. Enforcement happens in the consuming
// services (e.g. Scheduling) via the shared TrialEnforcement middleware.

app.MapHealthChecks("/healthz");

// Map minimal API endpoints
app.MapTrialEndpoints();

app.Run();
