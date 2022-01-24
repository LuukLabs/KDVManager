using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using KDVManager.Services.ChildManagement.Api.Middleware;
using KDVManager.Services.ChildManagement.Api.Services;
using KDVManager.Services.ChildManagement.Application;
using KDVManager.Services.ChildManagement.Application.Contracts.Services;
using KDVManager.Services.ChildManagement.Infrastructure;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.HttpsPolicy;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Unchase.Swashbuckle.AspNetCore.Extensions.Extensions;
using Unchase.Swashbuckle.AspNetCore.Extensions.Filters;
using Microsoft.OpenApi.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Swashbuckle.AspNetCore.Filters;

namespace KDVManager.Services.ChildManagement.Api
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {

            services.Configure<RouteOptions>(options => options.LowercaseUrls = true);

            services.AddHttpContextAccessor();

            services.AddInfrastructureServices(Configuration);

            services.AddApplicationServices();

            services.AddCors();

            services.AddControllers();

            // Register the Swagger generator, defining 1 or more Swagger documents
            services.AddSwaggerGen(configure =>
            {
                var apiinfo = new OpenApiInfo
                {
                    Title = "KDVManager ChildManagement API",
                    Version = "v1",
                    Description = "",
                    Contact = new OpenApiContact
                    { Name = "Luuk van Hulten" },
                };

                OpenApiSecurityScheme securityDefinition = new OpenApiSecurityScheme()
                {
                    In = ParameterLocation.Header,
                    Type = SecuritySchemeType.OAuth2,
                    Flows = new OpenApiOAuthFlows
                    {
                        Implicit = new OpenApiOAuthFlow
                        {
                            AuthorizationUrl = new Uri("https://kdvmanager.eu.auth0.com/authorize", UriKind.Absolute),
                            Scopes = new Dictionary<string, string>
                            {
                                {"read:children", "Access read operations"},
                                {"write:children", "Access write operations"}
                            },
                        }
                    }
                };

                OpenApiSecurityRequirement securityRequirements = new OpenApiSecurityRequirement()
                    {
                        {
                        new OpenApiSecurityScheme
                            {
                                Reference = new OpenApiReference
                                {
                                    Type = ReferenceType.SecurityScheme,
                                    Id = "jwt_auth"
                                }
                            },
                            new string[] {}
                        }
                    };

                configure.SwaggerDoc("v1", apiinfo);
                configure.AddSecurityDefinition("jwt_auth", securityDefinition);
                // // Make sure swagger UI requires a Bearer token to be specified
                configure.AddSecurityRequirement(securityRequirements);

                // configure.OperationFilter<SecurityRequirementsOperationFilter>();
                //configure.OperationFilter<AddResponseHeadersFilter>();
            });

            services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            }).AddJwtBearer(options =>
            {
                options.Authority = Configuration["Auth0:Domain"];
                options.Audience = Configuration["Auth0:ApiIdentifier"];
            });

            services.AddAuthorization(options =>
            {
                options.AddPolicy("read:children", policy => policy.Requirements.Add(new HasScopeRequirement("read:children", Configuration["Auth0:Domain"])));
            });

            services.AddSingleton<IAuthorizationHandler, HasScopeHandler>();
            services.AddScoped<ITenantService, TenantService>();
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }

            app.UseSwagger();
            app.UseSwaggerUI(options =>
            {
                options.OAuthClientId("ITepsevBBZNElNNrVmZjgkwaVCsmmKWc");
                options.OAuthClientSecret("D6E4HJv2QZXAiXG9Rh8a1z6po3AHlfhvu3MQ_SvG2ghB0pTF6Ju8O5Y75H02rt85");
                options.OAuthAdditionalQueryStringParams(new Dictionary<string, string>()
                {
                    {"audience", "https://api.kdvmanager.nl/"}
                });
            });

            // app.UseHttpsRedirection();

            app.UseRouting();

            app.UseCustomExceptionHandler();

            app.UseAuthentication();
            app.UseAuthorization();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
            });
        }
    }
}
