using System.Text.Json;
using FluentValidation.Results;
using KDVManager.Shared.Application.Exceptions;
using KDVManager.Shared.Infrastructure.Middleware;
using KDVManager.Shared.Infrastructure.Telemetry;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging.Abstractions;
using Xunit;

namespace KDVManager.UnitTests.Shared;

public class ExceptionHandlerMiddlewareTests
{
    private static async Task<(int StatusCode, JsonElement Body)> InvokeWithException(Exception exception)
    {
        var middleware = new ExceptionHandlerMiddleware(
            _ => throw exception,
            NullLogger<ExceptionHandlerMiddleware>.Instance,
            new ApiMetrics("test-api"));

        var context = new DefaultHttpContext();
        using var responseBody = new MemoryStream();
        context.Response.Body = responseBody;

        await middleware.Invoke(context);

        responseBody.Position = 0;
        using var reader = new StreamReader(responseBody);
        var body = JsonDocument.Parse(await reader.ReadToEndAsync()).RootElement.Clone();
        return (context.Response.StatusCode, body);
    }

    [Fact]
    public async Task NotFoundException_maps_to_404()
    {
        var (status, body) = await InvokeWithException(new NotFoundException("Child", Guid.Empty));

        Assert.Equal(StatusCodes.Status404NotFound, status);
        Assert.Contains("Child", body.GetProperty("error").GetString());
    }

    [Fact]
    public async Task ConflictException_maps_to_409()
    {
        var (status, _) = await InvokeWithException(new ConflictException("TimeSlot", Guid.Empty));

        Assert.Equal(StatusCodes.Status409Conflict, status);
    }

    [Fact]
    public async Task BadRequestException_maps_to_400()
    {
        var (status, body) = await InvokeWithException(new BadRequestException("bad input"));

        Assert.Equal(StatusCodes.Status400BadRequest, status);
        Assert.Equal("bad input", body.GetProperty("error").GetString());
    }

    [Fact]
    public async Task JsonException_maps_to_400()
    {
        var (status, _) = await InvokeWithException(new JsonException("unexpected token"));

        Assert.Equal(StatusCodes.Status400BadRequest, status);
    }

    [Fact]
    public async Task ValidationException_maps_to_422_with_camelCased_property_names()
    {
        var validationResult = new ValidationResult(new[]
        {
            new ValidationFailure("GivenName", "Given name is required") { ErrorCode = "NotEmptyValidator" }
        });

        var (status, body) = await InvokeWithException(new ValidationException(validationResult));

        Assert.Equal(StatusCodes.Status422UnprocessableEntity, status);
        var error = Assert.Single(body.GetProperty("errors").EnumerateArray());
        Assert.Equal("givenName", error.GetProperty("property").GetString());
        Assert.Equal("NotEmptyValidator", error.GetProperty("code").GetString());
    }

    [Fact]
    public async Task Unknown_exception_maps_to_500_without_leaking_the_message()
    {
        var (status, body) = await InvokeWithException(new InvalidOperationException("secret internal detail"));

        Assert.Equal(StatusCodes.Status500InternalServerError, status);
        Assert.Equal("An unexpected error occurred.", body.GetProperty("error").GetString());
    }
}
