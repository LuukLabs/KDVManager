using System;
using System.Net;
using System.Threading.Tasks;
using KDVManager.Services.Scheduling.Application.Exceptions;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Http;

namespace KDVManager.Services.Scheduling.Api.Middleware;

public class ExceptionHandlerMiddleware
{
    private readonly RequestDelegate _next;

    public ExceptionHandlerMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task Invoke(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception exception)
        {
            await ConvertException(context, exception);
        }
    }

    private Task ConvertException(HttpContext context, Exception exception)
    {
        HttpStatusCode httpStatusCode = HttpStatusCode.InternalServerError;

        context.Response.ContentType = "application/json";

        var result = string.Empty;
        var jsonSerializerOptions = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        };

        switch (exception)
        {
            case ValidationException validationException:
                httpStatusCode = HttpStatusCode.UnprocessableEntity;
                result = JsonSerializer.Serialize(new
                {
                    status = (int)httpStatusCode,
                    errors = validationException.ValidationErrors
                }, jsonSerializerOptions);
                break;
            case BadRequestException badRequestException:
                httpStatusCode = HttpStatusCode.BadRequest;
                break;
            case NotFoundException notFoundException:
                httpStatusCode = HttpStatusCode.NotFound;
                break;
            case Exception ex:
                httpStatusCode = HttpStatusCode.BadRequest;
                break;
        }

        context.Response.StatusCode = (int)httpStatusCode;


        if (result == string.Empty)
        {
            result = JsonSerializer.Serialize(new { error = exception.Message, status = (int)httpStatusCode }, jsonSerializerOptions);

        }

        return context.Response.WriteAsync(result);
    }
}
