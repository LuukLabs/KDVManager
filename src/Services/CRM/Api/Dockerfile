#See https://aka.ms/containerfastmode to understand how Visual Studio uses this Dockerfile to build your images for faster debugging.

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS restore
WORKDIR /src

# Copy project files for better caching
COPY ["Services/CRM/Api/Api.csproj", "Services/CRM/Api/"]
COPY ["Services/CRM/Application/Application.csproj", "Services/CRM/Application/"]
COPY ["Services/CRM/Domain/Domain.csproj", "Services/CRM/Domain/"]
COPY ["Services/CRM/Infrastructure/Infrastructure.csproj", "Services/CRM/Infrastructure/"]

# Restore dependencies (this layer can be cached)
RUN dotnet restore "Services/CRM/Api/Api.csproj" --verbosity minimal

FROM restore AS build
# Copy source code after restore
COPY . .
WORKDIR "/src/Services/CRM/Api"

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
