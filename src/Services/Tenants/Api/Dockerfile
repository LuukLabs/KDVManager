#See https://aka.ms/containerfastmode to understand how Visual Studio uses this Dockerfile to build your images for faster debugging.
FROM mcr.microsoft.com/dotnet/sdk:10.0.301 AS restore
WORKDIR /src
COPY ["Services/Tenants/Api/Api.csproj", "Services/Tenants/Api/"]
COPY ["Services/Tenants/Application/Application.csproj", "Services/Tenants/Application/"]
COPY ["Services/Tenants/Domain/Domain.csproj", "Services/Tenants/Domain/"]
COPY ["Services/Tenants/Infrastructure/Infrastructure.csproj", "Services/Tenants/Infrastructure/"]

# Shared projects
COPY ["Shared/KDVManager.Shared.Contracts/KDVManager.Shared.Contracts.csproj", "Shared/KDVManager.Shared.Contracts/"]
COPY ["Shared/KDVManager.Shared.Domain/KDVManager.Shared.Domain.csproj", "Shared/KDVManager.Shared.Domain/"]
COPY ["Shared/KDVManager.Shared.Infrastructure/KDVManager.Shared.Infrastructure.csproj", "Shared/KDVManager.Shared.Infrastructure/"]

RUN dotnet restore "Services/Tenants/Api/Api.csproj"

FROM restore AS build

COPY Services/Tenants Services/Tenants
COPY Shared Shared

WORKDIR "/src/Services/Tenants"

RUN dotnet build "Api/Api.csproj" -c Release \
    --verbosity minimal \
    --no-restore \
    --no-incremental

FROM build AS publish

RUN dotnet publish "Api/Api.csproj" -c Release -o /app/publish \
    --verbosity minimal \
    --no-restore \
    --no-build \
    /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0.9 AS runtime

EXPOSE 80
EXPOSE 443

WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "Api.dll"]
