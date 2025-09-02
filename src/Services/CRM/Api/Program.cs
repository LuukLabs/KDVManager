using KDVManager.Services.CRM.Api.Endpoints;
using KDVManager.Services.CRM.Api.Middleware;
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
builder.Logging.AddKdvManagerLogging(builder.Configuration, "crm-api");

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseRouting();

app.UseCustomExceptionHandler();

app.UseAuthentication();
app.UseAuthorization();

app.UseMiddleware<CorrelationIdMiddleware>();
app.UseMiddleware<TenancyMiddleware>();

app.MapHealthChecks("/healthz");

// Map minimal API endpoints
app.MapChildrenEndpoints();
app.MapGuardiansEndpoints();
// app.MapPeopleEndpoints();

app.Run();
