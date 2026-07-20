using KDVManager.Services.CRM.Api.Endpoints;
using KDVManager.Shared.Infrastructure.Logging;
using KDVManager.Shared.Infrastructure.Tenancy;
using KDVManager.Shared.Infrastructure.Middleware;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddInfrastructureServices(builder.Configuration);
builder.Services.AddApplicationServices();
builder.Services.AddMassTransitServices(builder.Configuration);
builder.Services.AddApiServices(builder.Configuration);

// Structured production logging (stdout JSON + OTLP if endpoint present)
builder.Logging.AddKdvManagerLogging(builder.Configuration, "crm-api");

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi().AllowAnonymous();
}

app.UseRouting();

app.UseCustomExceptionHandler();

app.UseAuthentication();
app.UseAuthorization();

app.UseMiddleware<CorrelationIdMiddleware>();
app.UseTenancy();

// Liveness: process-up only; readiness: all registered checks (postgres, MassTransit bus)
app.MapHealthChecks("/healthz", new HealthCheckOptions { Predicate = _ => false }).AllowAnonymous();
app.MapHealthChecks("/readyz").AllowAnonymous();

// Map minimal API endpoints
app.MapChildrenEndpoints();
app.MapGuardiansEndpoints();
// app.MapPeopleEndpoints();

app.Run();
