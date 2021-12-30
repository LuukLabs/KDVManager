#See https://aka.ms/containerfastmode to understand how Visual Studio uses this Dockerfile to build your images for faster debugging.

FROM mcr.microsoft.com/dotnet/aspnet:3.1 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/sdk:3.1 AS build
WORKDIR /src
COPY ["Services/ChildManagement/KDVManager.Services.ChildManagement.Api/KDVManager.Services.ChildManagement.Api.csproj", "Services/ChildManagement/KDVManager.Services.ChildManagement.Api/"]
COPY ["Services/ChildManagement/KDVManager.Services.ChildManagement.Application/KDVManager.Services.ChildManagement.Application.csproj", "Services/ChildManagement/KDVManager.Services.ChildManagement.Application/"]
COPY ["Services/ChildManagement/KDVManager.Services.ChildManagement.Domain/KDVManager.Services.ChildManagement.Domain.csproj", "Services/ChildManagement/KDVManager.Services.ChildManagement.Domain/"]
COPY ["Services/ChildManagement/KDVManager.Services.ChildManagement.Persistence/KDVManager.Services.ChildManagement.Persistence.csproj", "Services/ChildManagement/KDVManager.Services.ChildManagement.Persistence/"]
RUN dotnet restore "Services/ChildManagement/KDVManager.Services.ChildManagement.Api/KDVManager.Services.ChildManagement.Api.csproj"
COPY . .
WORKDIR "/src/Services/ChildManagement/KDVManager.Services.ChildManagement.Api"
RUN dotnet build "KDVManager.Services.ChildManagement.Api.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "KDVManager.Services.ChildManagement.Api.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "KDVManager.Services.ChildManagement.Api.dll"]
