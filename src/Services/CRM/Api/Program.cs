using KDVManager.Services.CRM.Api.Endpoints;
using KDVManager.Services.CRM.Api.Middleware;
using KDVManager.Shared.Infrastructure.Tenancy;
using OpenTelemetry.Logs;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddInfrastructureServices(builder.Configuration);
builder.Services.AddApplicationServices();
builder.Services.AddMassTransitServices(builder.Configuration);
builder.Services.AddApiServices(builder.Configuration);

// Configure OpenTelemetry Logging for error collection
var otelEndpoint = builder.Configuration["Otel:Endpoint"];
if (!string.IsNullOrWhiteSpace(otelEndpoint))
{
    builder.Logging.ClearProviders();
    builder.Logging.AddConsole();
    builder.Logging.AddDebug();
    builder.Logging.AddOpenTelemetry(options =>
    {
        options.IncludeScopes = true;
        options.IncludeFormattedMessage = true;
        options.ParseStateValues = true;
        options.AddOtlpExporter(o =>
        {
            o.Endpoint = new Uri(otelEndpoint);
        });
    });
}

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseRouting();

app.UseCustomExceptionHandler();

app.UseAuthentication();
app.UseAuthorization();

app.UseMiddleware<TenancyMiddleware>();

app.MapHealthChecks("/healthz");

// Map minimal API endpoints
app.MapChildrenEndpoints();
app.MapGuardiansEndpoints();
// app.MapPeopleEndpoints();

app.Run();
