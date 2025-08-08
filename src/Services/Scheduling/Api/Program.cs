using KDVManager.Services.Scheduling.Api.Middleware;
using KDVManager.Shared.Infrastructure.Tenancy;
using OpenTelemetry.Logs;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddInfrastructureServices(builder.Configuration);
builder.Services.AddApplicationServices();
builder.Services.AddMassTransitServices(builder.Configuration);
builder.Services.AddApiServices(builder.Configuration);

var otlpEndpoint = builder.Configuration["Otlp:Endpoint"];
if (!string.IsNullOrWhiteSpace(otlpEndpoint))
{
    builder.Logging.ClearProviders();
    builder.Logging.AddOpenTelemetry(options =>
    {
        options.IncludeScopes = true;
        options.IncludeFormattedMessage = true;
        options.ParseStateValues = true;
        options.AddOtlpExporter(o =>
        {
            o.Endpoint = new Uri(otlpEndpoint);
        });
    });
}

var app = builder.Build();

app.UseSwagger();

app.UseRouting();

app.UseCustomExceptionHandler();

app.UseAuthentication();
app.UseAuthorization();

app.UseMiddleware<TenancyMiddleware>();

app.MapHealthChecks("/healthz");

app.MapControllers();

app.Run();
