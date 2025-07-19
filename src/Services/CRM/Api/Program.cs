using KDVManager.Services.CRM.Api.Middleware;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddInfrastructureServices(builder.Configuration);
builder.Services.AddApplicationServices();
builder.Services.AddMassTransitInfrastructureServices(builder.Configuration); // Use Infrastructure MassTransit with tenant filters
builder.Services.AddApiServices(builder.Configuration);

var app = builder.Build();

app.UseSwagger();

// app.UseHttpsRedirection();

app.UseRouting();

app.UseCustomExceptionHandler();

app.UseAuthentication();
app.UseAuthorization();

app.MapHealthChecks("/healthz");

app.MapControllers().RequireAuthorization();

app.Run();
