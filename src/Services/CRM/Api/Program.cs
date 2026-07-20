using KDVManager.Services.CRM.Api.Endpoints;
using KDVManager.Services.CRM.Infrastructure;
using KDVManager.Shared.Infrastructure.Hosting;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddInfrastructureServices(builder.Configuration);
builder.Services.AddApplicationServices();
builder.Services.AddMassTransitServices(builder.Configuration);

builder.AddKdvManagerApi<ApplicationDbContext>(new KdvManagerApiOptions
{
    ServiceName = "crm-api",
    ApiTitle = "KDVManager CRM API",
});

var app = builder.Build();

app.UseKdvManagerApi();

// Map minimal API endpoints
app.MapChildrenEndpoints();
app.MapGuardiansEndpoints();

app.Run();
