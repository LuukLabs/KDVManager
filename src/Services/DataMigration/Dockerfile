FROM mcr.microsoft.com/dotnet/runtime:9.0 AS base
WORKDIR /app

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS restore
WORKDIR /src

# Copy project files for better caching
COPY ["Services/DataMigration/DataMigration.csproj", "Services/DataMigration/"]
COPY ["Services/CRM/Domain/Domain.csproj", "Services/CRM/Domain/"]
COPY ["Services/CRM/Application/Application.csproj", "Services/CRM/Application/"]
COPY ["Services/CRM/Infrastructure/Infrastructure.csproj", "Services/CRM/Infrastructure/"]
COPY ["Services/Scheduling/Domain/Domain.csproj", "Services/Scheduling/Domain/"]
COPY ["Services/Scheduling/Application/Application.csproj", "Services/Scheduling/Application/"]
COPY ["Services/Scheduling/Infrastructure/Infrastructure.csproj", "Services/Scheduling/Infrastructure/"]

# Restore dependencies (this layer can be cached)
RUN dotnet restore "Services/DataMigration/DataMigration.csproj" --verbosity minimal

FROM restore AS build
# Copy all source code after restore
COPY . .

# Build the application
WORKDIR "/src/Services/DataMigration"
RUN dotnet build "DataMigration.csproj" -c Release -o /app/build \
    --no-restore \
    --verbosity minimal \
    /p:UseAppHost=false

FROM build AS publish
RUN dotnet publish "DataMigration.csproj" -c Release -o /app/publish \
    --no-restore \
    --verbosity minimal \
    /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "DataMigration.dll"]
