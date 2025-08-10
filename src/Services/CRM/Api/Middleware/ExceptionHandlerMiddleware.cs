using System.Net;
using System.Diagnostics;
using KDVManager.Services.CRM.Application.Exceptions;
using System.Text.Json;
using Microsoft.Extensions.Logging;
using KDVManager.Services.CRM.Api.Telemetry;

namespace KDVManager.Services.CRM.Api.Middleware;

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
            // Increment error counter
            CrmApiMetrics.ErrorCounter.Add(1,
                new KeyValuePair<string, object?>("error_type", exception.GetType().Name),
                new KeyValuePair<string, object?>("service", "crm-api"));

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
            Service = "crm-api",
            Timestamp = DateTimeOffset.UtcNow,
            RequestPath = context.Request.Path.Value,
            RequestMethod = context.Request.Method,
            UserAgent = context.Request.Headers.UserAgent.ToString(),
            RemoteIp = context.Connection.RemoteIpAddress?.ToString()
        };

        switch (exception)
        {
            case ValidationException validationException:
                httpStatusCode = HttpStatusCode.UnprocessableEntity;
                result = JsonSerializer.Serialize(new UnprocessableEntityResponse((int)httpStatusCode, validationException), jsonSerializerOptions);

                // Log validation errors as warnings
                _logger.LogWarning(exception,
                    "Validation error in {Service} at {RequestPath}. TraceId: {TraceId}. Errors: {ValidationErrors}",
                    errorDetails.Service,
                    errorDetails.RequestPath,
                    errorDetails.TraceId,
                    validationException.ValidationErrors);
                break;

            case BadRequestException badRequestException:
                httpStatusCode = HttpStatusCode.BadRequest;

                _logger.LogWarning(exception,
                    "Bad request in {Service} at {RequestPath}. TraceId: {TraceId}",
                    errorDetails.Service,
                    errorDetails.RequestPath,
                    errorDetails.TraceId);
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

                // Log unexpected errors as errors with full context
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

        // Add OpenTelemetry span tags for better error tracking
        if (Activity.Current != null)
        {
            Activity.Current.SetTag("error", "true");
            Activity.Current.SetTag("error.type", exception.GetType().Name);
            Activity.Current.SetTag("error.message", exception.Message);
            Activity.Current.SetTag("http.status_code", ((int)httpStatusCode).ToString());
            Activity.Current.SetStatus(ActivityStatusCode.Error, exception.Message);
        }

        context.Response.StatusCode = (int)httpStatusCode;

        if (result == string.Empty)
        {
            var errorResponse = new
            {
                error = exception.Message,
                status = (int)httpStatusCode,
                traceId = traceId,
                timestamp = errorDetails.Timestamp,
                path = errorDetails.RequestPath
            };
            result = JsonSerializer.Serialize(errorResponse, jsonSerializerOptions);
        }

        return context.Response.WriteAsync(result);
    }
}
