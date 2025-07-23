#See https://aka.ms/containerfastmode to understand how Visual Studio uses this Dockerfile to build your images for faster debugging.
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS restore
WORKDIR /src
COPY ["Services/Scheduling/Api/Api.csproj", "Services/Scheduling/Api/"]
COPY ["Services/Scheduling/Application/Application.csproj", "Services/Scheduling/Application/"]
COPY ["Services/Scheduling/Domain/Domain.csproj", "Services/Scheduling/Domain/"]
COPY ["Services/Scheduling/Infrastructure/Infrastructure.csproj", "Services/Scheduling/Infrastructure/"]

# Shared projects
COPY ["Shared/KDVManager.Shared.Contracts/KDVManager.Shared.Contracts.csproj", "Shared/KDVManager.Shared.Contracts/"]
COPY ["Shared/KDVManager.Shared.Domain/KDVManager.Shared.Domain.csproj", "Shared/KDVManager.Shared.Domain/"]
COPY ["Shared/KDVManager.Shared.Infrastructure/KDVManager.Shared.Infrastructure.csproj", "Shared/KDVManager.Shared.Infrastructure/"]

RUN dotnet restore "Services/Scheduling/Api/Api.csproj"

FROM restore as build

COPY Services/Scheduling Services/Scheduling
COPY Shared Shared

WORKDIR "/src/Services/Scheduling"

RUN dotnet build "Api/Api.csproj" -c Release \
    --verbosity minimal \
    --no-restore \
    --no-incremental

FROM build as publish

RUN dotnet publish "Api/Api.csproj" -c Release -o /app/publish \
    --verbosity minimal \
    --no-restore \
    --no-build \
    /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:9.0 as runtime

EXPOSE 80
EXPOSE 443

WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "Api.dll"]
