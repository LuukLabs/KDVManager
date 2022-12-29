using KDVManager.Services.CRM.Api.Middleware;
using KDVManager.Services.CRM.Application;
using KDVManager.Services.CRM.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddInfrastructureServices(builder.Configuration);
builder.Services.AddApplicationServices();
builder.Services.AddApiServices(builder.Configuration);

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

app.UseRouting();

app.UseCustomExceptionHandler();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers().RequireAuthorization();

app.Run();
