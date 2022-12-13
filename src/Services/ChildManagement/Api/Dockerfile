#See https://aka.ms/containerfastmode to understand how Visual Studio uses this Dockerfile to build your images for faster debugging.

FROM mcr.microsoft.com/dotnet/aspnet:7.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/sdk:7.0 AS build
WORKDIR /src
COPY ["Services/ChildManagement/Api/KDVManager.Services.ChildManagement.Api.csproj", "Services/ChildManagement/Api/"]
COPY ["Services/ChildManagement/Application/KDVManager.Services.ChildManagement.Application.csproj", "Services/ChildManagement/Application/"]
COPY ["Services/ChildManagement/Domain/KDVManager.Services.ChildManagement.Domain.csproj", "Services/ChildManagement/Domain/"]
COPY ["Services/ChildManagement/Infrastructure/KDVManager.Services.ChildManagement.Infrastructure.csproj", "Services/ChildManagement/Infrastructure/"]
RUN dotnet restore "Services/ChildManagement/Api/KDVManager.Services.ChildManagement.Api.csproj"
COPY . .
WORKDIR "/src/Services/ChildManagement/Api"
RUN dotnet build "KDVManager.Services.ChildManagement.Api.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "KDVManager.Services.ChildManagement.Api.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "KDVManager.Services.ChildManagement.Api.dll"]
