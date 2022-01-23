using System;
using Microsoft.AspNetCore.Builder;

namespace KDVManager.Services.ChildManagement.Api.Middleware
{
    public static class ExceptionHandlerMiddlewareExtension
    {
        public static IApplicationBuilder UseCustomExceptionHandler(this IApplicationBuilder builder)
        {
            return builder.UseMiddleware<ExceptionHandlerMiddleware>();
        }
    }
}
