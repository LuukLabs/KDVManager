#See https://aka.ms/containerfastmode to understand how Visual Studio uses this Dockerfile to build your images for faster debugging.

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS restore
WORKDIR /src

# Copy project files for better caching
COPY ["Services/Scheduling/Api/Api.csproj", "Services/Scheduling/Api/"]
COPY ["Services/Scheduling/Application/Application.csproj", "Services/Scheduling/Application/"]
COPY ["Services/Scheduling/Domain/Domain.csproj", "Services/Scheduling/Domain/"]
COPY ["Services/Scheduling/Infrastructure/Infrastructure.csproj", "Services/Scheduling/Infrastructure/"]

# Restore dependencies (this layer can be cached)
RUN dotnet restore "Services/Scheduling/Api/Api.csproj" --verbosity minimal

FROM restore AS build
# Copy source code after restore
COPY . .
WORKDIR "/src/Services/Scheduling/Api"

# Build with optimizations to reduce layer invalidation
RUN dotnet build "Api.csproj" -c Release -o /app/build \
    --no-restore \
    --verbosity minimal \
    /p:UseAppHost=false

FROM build AS publish
RUN dotnet publish "Api.csproj" -c Release -o /app/publish \
    --no-restore \
    --verbosity minimal \
    /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "Api.dll"]
