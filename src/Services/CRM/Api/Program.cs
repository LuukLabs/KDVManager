using KDVManager.Services.CRM.Api.Middleware;
using KDVManager.Shared.Infrastructure.Tenancy;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddInfrastructureServices(builder.Configuration);
builder.Services.AddApplicationServices();
builder.Services.AddMassTransitServices(builder.Configuration);
builder.Services.AddApiServices(builder.Configuration);

var app = builder.Build();

app.UseSwagger();

app.UseRouting();

app.UseCustomExceptionHandler();

app.UseAuthentication();
app.UseAuthorization();

app.UseMiddleware<TenancyMiddleware>();

app.MapHealthChecks("/healthz");

app.MapControllers().RequireAuthorization();

app.Run();
