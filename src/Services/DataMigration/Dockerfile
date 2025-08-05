FROM mcr.microsoft.com/dotnet/runtime:9.0 AS base
WORKDIR /app

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy project files
COPY ["Services/DataMigration/DataMigration.csproj", "Services/DataMigration/"]
COPY ["Services/CRM/Domain/Domain.csproj", "Services/CRM/Domain/"]
COPY ["Services/CRM/Application/Application.csproj", "Services/CRM/Application/"]
COPY ["Services/CRM/Infrastructure/Infrastructure.csproj", "Services/CRM/Infrastructure/"]
COPY ["Services/Scheduling/Domain/Domain.csproj", "Services/Scheduling/Domain/"]
COPY ["Services/Scheduling/Application/Application.csproj", "Services/Scheduling/Application/"]
COPY ["Services/Scheduling/Infrastructure/Infrastructure.csproj", "Services/Scheduling/Infrastructure/"]

# Set up github source for NuGet packages
ARG NUGET_GITHUB_TOKEN
RUN dotnet nuget add source "https://nuget.pkg.github.com/LuukLabs/index.json" --name "github" --username "LuukVH" --password "$NUGET_GITHUB_TOKEN" --store-password-in-clear-text

# Restore dependencies
RUN dotnet restore "Services/DataMigration/DataMigration.csproj"

# Copy all source code
COPY . .

# Build the application
WORKDIR "/src/Services/DataMigration"
RUN dotnet build "DataMigration.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "DataMigration.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "DataMigration.dll"]
