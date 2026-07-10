using System.Text.Json.Nodes;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.OpenApi;

namespace KDVManager.Shared.Infrastructure.OpenApi;

public static class KdvManagerOpenApiExtensions
{
    public static IServiceCollection AddKdvManagerOpenApi(this IServiceCollection services, string title)
    {
        services.AddOpenApi(options =>
        {
            options.OpenApiVersion = OpenApiSpecVersion.OpenApi3_0;

            options.AddDocumentTransformer((document, context, cancellationToken) =>
            {
                document.Info = new()
                {
                    Title = title,
                    Version = "v1",
                    Contact = new()
                    {
                        Name = "Luuk van Hulten",
                        Email = "admin@kdvmanager.nl",
                    },
                };

                return Task.CompletedTask;
            });

            options.AddSchemaTransformer((schema, context, cancellationToken) =>
            {
                if (schema.Properties != null)
                {
                    schema.Properties = schema.Properties.ToDictionary(
                        property => char.ToLowerInvariant(property.Key[0]) + property.Key[1..],
                        property => property.Value);
                }

                if (context.JsonTypeInfo.Type == typeof(TimeSpan))
                {
                    schema.Type = JsonSchemaType.String;
                    schema.Format = "time";
                    schema.Example = JsonValue.Create("14:30:00");
                }

                // ASP.NET Core OpenAPI emits a pattern for integer fields without a type,
                // which causes Orval to generate `unknown` instead of `number`.
                if (schema.Format == "int32" || schema.Format == "int64")
                {
                    schema.Pattern = null;
                    schema.Type = JsonSchemaType.Integer;
                }

                return Task.CompletedTask;
            });

            options.AddOperationTransformer((operation, context, cancellationToken) =>
            {
                if (operation.Parameters != null)
                {
                    foreach (var parameter in operation.Parameters)
                    {
                        if (parameter is OpenApiParameter openApiParameter && !string.IsNullOrEmpty(openApiParameter.Name))
                        {
                            openApiParameter.Name = char.ToLowerInvariant(openApiParameter.Name[0]) + openApiParameter.Name[1..];
                        }
                    }
                }

                // A 204 response has no body. Remove the empty JSON media type emitted by
                // ASP.NET Core OpenAPI so Orval continues to generate Promise<void>.
                if (operation.Responses?.TryGetValue("204", out var noContentResponse) == true)
                {
                    noContentResponse.Content?.Clear();
                }

                return Task.CompletedTask;
            });
        });

        return services;
    }
}
