#See https://aka.ms/containerfastmode to understand how Visual Studio uses this Dockerfile to build your images for faster debugging.

FROM mcr.microsoft.com/dotnet/aspnet:6.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/sdk:6.0 AS build
WORKDIR /src
COPY ["Services/Scheduling/KDVManager.Services.Scheduling.Api/KDVManager.Services.Scheduling.Api.csproj", "Services/Scheduling/KDVManager.Services.Scheduling.Api/"]
COPY ["Services/Scheduling/KDVManager.Services.Scheduling.Application/KDVManager.Services.Scheduling.Application.csproj", "Services/Scheduling/KDVManager.Services.Scheduling.Application/"]
COPY ["Services/Scheduling/KDVManager.Services.Scheduling.Domain/KDVManager.Services.Scheduling.Domain.csproj", "Services/Scheduling/KDVManager.Services.Scheduling.Domain/"]
COPY ["Services/Scheduling/KDVManager.Services.Scheduling.Persistence/KDVManager.Services.Scheduling.Persistence.csproj", "Services/Scheduling/KDVManager.Services.Scheduling.Persistence/"]
RUN dotnet restore "Services/Scheduling/KDVManager.Services.Scheduling.Api/KDVManager.Services.Scheduling.Api.csproj"
COPY . .
WORKDIR "/src/Services/Scheduling/KDVManager.Services.Scheduling.Api"
RUN dotnet build "KDVManager.Services.Scheduling.Api.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "KDVManager.Services.Scheduling.Api.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "KDVManager.Services.Scheduling.Api.dll"]
