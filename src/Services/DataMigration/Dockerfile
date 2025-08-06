FROM mcr.microsoft.com/dotnet/sdk:9.0 AS restore
WORKDIR /src

# Copy project files
COPY ["Services/DataMigration/DataMigration.csproj", "Services/DataMigration/"]

# CRM project files
COPY ["Services/CRM/Domain/Domain.csproj", "Services/CRM/Domain/"]
COPY ["Services/CRM/Application/Application.csproj", "Services/CRM/Application/"]
COPY ["Services/CRM/Infrastructure/Infrastructure.csproj", "Services/CRM/Infrastructure/"]

# Schedule project files
COPY ["Services/Scheduling/Domain/Domain.csproj", "Services/Scheduling/Domain/"]
COPY ["Services/Scheduling/Application/Application.csproj", "Services/Scheduling/Application/"]
COPY ["Services/Scheduling/Infrastructure/Infrastructure.csproj", "Services/Scheduling/Infrastructure/"]

# Shared projects
COPY ["Shared/KDVManager.Shared.Contracts/KDVManager.Shared.Contracts.csproj", "Shared/KDVManager.Shared.Contracts/"]
COPY ["Shared/KDVManager.Shared.Domain/KDVManager.Shared.Domain.csproj", "Shared/KDVManager.Shared.Domain/"]
COPY ["Shared/KDVManager.Shared.Infrastructure/KDVManager.Shared.Infrastructure.csproj", "Shared/KDVManager.Shared.Infrastructure/"]

# Set up github source for NuGet packages
ARG NUGET_GITHUB_TOKEN
RUN dotnet nuget add source "https://nuget.pkg.github.com/LuukLabs/index.json" --name "github" --username "LuukVH" --password "$NUGET_GITHUB_TOKEN" --store-password-in-clear-text

# Restore dependencies
RUN dotnet restore "Services/DataMigration/DataMigration.csproj"

FROM restore as build

COPY Services/CRM Services/CRM
COPY Services/Scheduling Services/Scheduling
COPY Services/DataMigration Services/DataMigration
COPY Shared Shared

# Build the application
WORKDIR "/src/Services/DataMigration"

RUN dotnet build "DataMigration.csproj" -c Release \
    --verbosity minimal \
    --no-restore \
    --no-incremental

FROM build as publish

RUN dotnet publish "DataMigration.csproj" -c Release -o /app/publish \
    --verbosity minimal \
    --no-restore \
    --no-build \
    /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "DataMigration.dll"]
