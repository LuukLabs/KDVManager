using KDVManager.Services.CRM.Api.Middleware;
using KDVManager.Shared.Infrastructure.Tenancy;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddInfrastructureServices(builder.Configuration);
builder.Services.AddApplicationServices();
builder.Services.AddMassTransitServices(builder.Configuration);
builder.Services.AddApiServices(builder.Configuration);

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
// app.MapPeopleEndpoints();

app.Run();
