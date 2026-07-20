using System.Diagnostics;
using System.Net;
using System.Text.Json;
using KDVManager.Shared.Application.Exceptions;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;

namespace KDVManager.Shared.Infrastructure.Http;

public sealed class ExceptionHandlerMiddleware
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);
    private readonly ApiErrorMetrics _metrics;
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlerMiddleware> _logger;

    public ExceptionHandlerMiddleware(
        RequestDelegate next,
        ILogger<ExceptionHandlerMiddleware> logger,
        ApiErrorMetrics metrics)
    {
        _next = next;
        _logger = logger;
        _metrics = metrics;
    }

    public async Task Invoke(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception exception)
        {
            _metrics.Record(exception);
            await WriteResponse(context, exception);
        }
    }

    private Task WriteResponse(HttpContext context, Exception exception)
    {
        var statusCode = GetStatusCode(exception);
        var traceId = Activity.Current?.TraceId.ToString() ?? context.TraceIdentifier;
        var timestamp = DateTimeOffset.UtcNow;
        var requestPath = context.Request.Path.Value;

        LogException(exception, statusCode, requestPath, traceId, context);
        EnrichActivity(exception, statusCode);

        context.Response.ContentType = "application/json";
        context.Response.StatusCode = (int)statusCode;

        object response = exception switch
        {
            ValidationException validationException =>
                new UnprocessableEntityResponse((int)statusCode, validationException),
            JsonException => CreateRequestError(
                "Failed to read request body as JSON.", exception.Message, statusCode, traceId, timestamp, requestPath),
            BadHttpRequestException => CreateRequestError(
                "Invalid HTTP request.", exception.Message, statusCode, traceId, timestamp, requestPath),
            InvalidDataException => CreateRequestError(
                "Invalid request body.", exception.Message, statusCode, traceId, timestamp, requestPath),
            _ => new
            {
                error = statusCode >= HttpStatusCode.InternalServerError
                    ? "An unexpected error occurred."
                    : exception.Message,
                status = (int)statusCode,
                traceId,
                timestamp,
                path = requestPath
            }
        };

        return context.Response.WriteAsync(JsonSerializer.Serialize(response, JsonOptions));
    }

    private static HttpStatusCode GetStatusCode(Exception exception) => exception switch
    {
        ValidationException => HttpStatusCode.UnprocessableEntity,
        ConflictException => HttpStatusCode.Conflict,
        NotFoundException => HttpStatusCode.NotFound,
        BadRequestException or JsonException or BadHttpRequestException or InvalidDataException =>
            HttpStatusCode.BadRequest,
        _ => HttpStatusCode.InternalServerError
    };

    private void LogException(
        Exception exception,
        HttpStatusCode statusCode,
        string? requestPath,
        string traceId,
        HttpContext context)
    {
        if (statusCode >= HttpStatusCode.InternalServerError)
        {
            _logger.LogError(exception,
                "Unhandled exception in {Service} at {RequestPath}. TraceId: {TraceId}. RequestMethod: {RequestMethod}. UserAgent: {UserAgent}. RemoteIp: {RemoteIp}",
                _metrics.ServiceName, requestPath, traceId, context.Request.Method,
                context.Request.Headers.UserAgent.ToString(), context.Connection.RemoteIpAddress?.ToString());
            return;
        }

        _logger.LogWarning(exception,
            "Request failed in {Service} at {RequestPath}. TraceId: {TraceId}. StatusCode: {StatusCode}",
            _metrics.ServiceName, requestPath, traceId, (int)statusCode);
    }

    private static void EnrichActivity(Exception exception, HttpStatusCode statusCode)
    {
        var activity = Activity.Current;
        if (activity is null)
        {
            return;
        }

        activity.SetTag("error", true);
        activity.SetTag("exception.type", exception.GetType().FullName);
        activity.SetTag("http.status_code", (int)statusCode);
        activity.SetStatus(ActivityStatusCode.Error,
            statusCode >= HttpStatusCode.InternalServerError ? "internal_error" : "client_error");
        activity.AddEvent(new ActivityEvent("exception", tags: new ActivityTagsCollection
        {
            { "exception.type", exception.GetType().FullName }
        }));
    }

    private static object CreateRequestError(
        string error,
        string details,
        HttpStatusCode statusCode,
        string traceId,
        DateTimeOffset timestamp,
        string? path) => new
        {
            error,
            details,
            status = (int)statusCode,
            traceId,
            timestamp,
            path
        };
}
