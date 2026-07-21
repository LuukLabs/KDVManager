using KDVManager.Services.Scheduling.Infrastructure;
using KDVManager.Shared.Infrastructure.Hosting;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddInfrastructureServices(builder.Configuration);
builder.Services.AddApplicationServices();
builder.Services.AddMassTransitServices(builder.Configuration);
builder.Services.AddApiServices();

builder.AddKdvManagerApi<ApplicationDbContext>(new KdvManagerApiOptions
{
    ServiceName = "scheduling-api",
    ApiTitle = "KDVManager Scheduling API",
});

var app = builder.Build();

app.UseKdvManagerApi();

app.MapControllers();

app.Run();
