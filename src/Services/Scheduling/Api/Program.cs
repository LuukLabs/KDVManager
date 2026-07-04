using KDVManager.Services.Scheduling.Api.Middleware;
using KDVManager.Shared.Infrastructure.Logging;
using KDVManager.Shared.Infrastructure.Middleware;
using KDVManager.Shared.Infrastructure.Tenancy;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddInfrastructureServices(builder.Configuration);
builder.Services.AddApplicationServices();
builder.Services.AddMassTransitServices(builder.Configuration);
builder.Services.AddApiServices(builder.Configuration);

// Structured production logging (stdout JSON + OTLP if endpoint present)
builder.Logging.AddKdvManagerLogging(builder.Configuration, "scheduling-api");

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
}

app.UseRouting();

app.UseCustomExceptionHandler();

app.UseAuthentication();
app.UseAuthorization();

app.UseMiddleware<CorrelationIdMiddleware>();
app.UseTenancy();

app.MapHealthChecks("/healthz").AllowAnonymous();

app.MapControllers();

app.Run();
