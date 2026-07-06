using System.Net;
using System.Diagnostics;
using KDVManager.Services.Tenants.Application.Exceptions;
using System.Text.Json;
using Microsoft.Extensions.Logging;
using KDVManager.Services.Tenants.Api.Telemetry;

namespace KDVManager.Services.Tenants.Api.Middleware;

public class ExceptionHandlerMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlerMiddleware> _logger;

    public ExceptionHandlerMiddleware(RequestDelegate next, ILogger<ExceptionHandlerMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task Invoke(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception exception)
        {
            TenantsApiMetrics.ErrorCounter.Add(1,
                new KeyValuePair<string, object?>("error_type", exception.GetType().Name),
                new KeyValuePair<string, object?>("service", "tenants-api"));

            await ConvertException(context, exception);
        }
    }

    private Task ConvertException(HttpContext context, Exception exception)
    {
        HttpStatusCode httpStatusCode = HttpStatusCode.InternalServerError;
        var traceId = Activity.Current?.TraceId.ToString() ?? context.TraceIdentifier;

        context.Response.ContentType = "application/json";

        var result = string.Empty;
        var jsonSerializerOptions = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        };

        var errorDetails = new
        {
            TraceId = traceId,
            Service = "tenants-api",
            Timestamp = DateTimeOffset.UtcNow,
            RequestPath = SanitizeForLog(context.Request.Path.Value),
            RequestMethod = SanitizeForLog(context.Request.Method),
            UserAgent = SanitizeForLog(context.Request.Headers.UserAgent.ToString()),
            RemoteIp = SanitizeForLog(context.Connection.RemoteIpAddress?.ToString())
        };

        switch (exception)
        {
            case ValidationException validationException:
                httpStatusCode = HttpStatusCode.UnprocessableEntity;
                result = JsonSerializer.Serialize(new UnprocessableEntityResponse((int)httpStatusCode, validationException), jsonSerializerOptions);

                _logger.LogWarning(exception,
                    "Validation error in {Service} at {RequestPath}. TraceId: {TraceId}. Errors: {ValidationErrors}",
                    errorDetails.Service,
                    errorDetails.RequestPath,
                    errorDetails.TraceId,
                    validationException.ValidationErrors);
                break;

            case System.Text.Json.JsonException jsonException:
                httpStatusCode = HttpStatusCode.BadRequest;

                _logger.LogWarning(jsonException,
                    "JSON parse error in {Service} at {RequestPath}. TraceId: {TraceId}. Message: {Message}",
                    errorDetails.Service,
                    errorDetails.RequestPath,
                    errorDetails.TraceId,
                    jsonException.Message);

                result = JsonSerializer.Serialize(new
                {
                    error = "Failed to read request body as JSON.",
                    details = jsonException.Message,
                    status = (int)httpStatusCode,
                    traceId = traceId,
                    timestamp = errorDetails.Timestamp,
                    path = errorDetails.RequestPath
                }, jsonSerializerOptions);
                break;

            case Microsoft.AspNetCore.Http.BadHttpRequestException badHttpRequestException:
                httpStatusCode = HttpStatusCode.BadRequest;

                _logger.LogWarning(badHttpRequestException,
                    "Bad HTTP request in {Service} at {RequestPath}. TraceId: {TraceId}. Message: {Message}",
                    errorDetails.Service,
                    errorDetails.RequestPath,
                    errorDetails.TraceId,
                    badHttpRequestException.Message);

                result = JsonSerializer.Serialize(new
                {
                    error = "Invalid HTTP request.",
                    details = badHttpRequestException.Message,
                    status = (int)httpStatusCode,
                    traceId = traceId,
                    timestamp = errorDetails.Timestamp,
                    path = errorDetails.RequestPath
                }, jsonSerializerOptions);
                break;

            case System.IO.InvalidDataException invalidDataException:
                httpStatusCode = HttpStatusCode.BadRequest;

                _logger.LogWarning(invalidDataException,
                    "Invalid request body in {Service} at {RequestPath}. TraceId: {TraceId}. Message: {Message}",
                    errorDetails.Service,
                    errorDetails.RequestPath,
                    errorDetails.TraceId,
                    invalidDataException.Message);

                result = JsonSerializer.Serialize(new
                {
                    error = "Invalid request body.",
                    details = invalidDataException.Message,
                    status = (int)httpStatusCode,
                    traceId = traceId,
                    timestamp = errorDetails.Timestamp,
                    path = errorDetails.RequestPath
                }, jsonSerializerOptions);
                break;

            case ConflictException conflictException:
                httpStatusCode = HttpStatusCode.Conflict;
                _logger.LogWarning(conflictException,
                    "Conflict in {Service} at {RequestPath}. TraceId: {TraceId}. Message: {Message}",
                    errorDetails.Service,
                    errorDetails.RequestPath,
                    errorDetails.TraceId,
                    conflictException.Message);
                break;

            case NotFoundException notFoundException:
                httpStatusCode = HttpStatusCode.NotFound;

                _logger.LogWarning(exception,
                    "Resource not found in {Service} at {RequestPath}. TraceId: {TraceId}",
                    errorDetails.Service,
                    errorDetails.RequestPath,
                    errorDetails.TraceId);
                break;

            case Exception ex:
                httpStatusCode = HttpStatusCode.InternalServerError;

                _logger.LogError(exception,
                    "Unhandled exception in {Service} at {RequestPath}. TraceId: {TraceId}. RequestMethod: {RequestMethod}. UserAgent: {UserAgent}. RemoteIp: {RemoteIp}",
                    errorDetails.Service,
                    errorDetails.RequestPath,
                    errorDetails.TraceId,
                    errorDetails.RequestMethod,
                    errorDetails.UserAgent,
                    errorDetails.RemoteIp);
                break;
        }

        if (Activity.Current != null)
        {
            Activity.Current.SetTag("error", true);
            Activity.Current.SetTag("exception.type", exception.GetType().FullName);
            Activity.Current.SetTag("http.status_code", (int)httpStatusCode);
            Activity.Current.SetStatus(ActivityStatusCode.Error, (int)httpStatusCode >= 500 ? "internal_error" : "client_error");
            try
            {
                var tags = new ActivityTagsCollection
                {
                    { "exception.type", exception.GetType().FullName }
                };
                Activity.Current.AddEvent(new ActivityEvent("exception", tags: tags));
            }
            catch { }
        }

        context.Response.StatusCode = (int)httpStatusCode;

        if (result == string.Empty)
        {
            var errorResponse = new
            {
                error = (int)httpStatusCode >= 500 ? "An unexpected error occurred." : exception.Message,
                status = (int)httpStatusCode,
                traceId = traceId,
                timestamp = errorDetails.Timestamp,
                path = errorDetails.RequestPath
            };
            result = JsonSerializer.Serialize(errorResponse, jsonSerializerOptions);
        }

        return context.Response.WriteAsync(result);
    }

    /// <summary>
    /// Strips newlines/control characters from request-derived values before they reach
    /// the logger, so a crafted header or path can't forge additional log lines.
    /// </summary>
    private static string? SanitizeForLog(string? value)
    {
        if (string.IsNullOrEmpty(value))
            return value;

        Span<char> buffer = value.Length <= 256 ? stackalloc char[value.Length] : new char[value.Length];
        for (int i = 0; i < value.Length; i++)
        {
            buffer[i] = char.IsControl(value[i]) ? '_' : value[i];
        }

        return new string(buffer);
    }
}
