#See https://aka.ms/containerfastmode to understand how Visual Studio uses this Dockerfile to build your images for faster debugging.

FROM mcr.microsoft.com/dotnet/aspnet:3.1 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/sdk:3.1 AS build
WORKDIR /src
COPY ["Services/GroupManagement/KDVManager.Services.GroupManagement.Api/KDVManager.Services.GroupManagement.Api.csproj", "Services/GroupManagement/KDVManager.Services.GroupManagement.Api/"]
COPY ["Services/GroupManagement/KDVManager.Services.GroupManagement.Application/KDVManager.Services.GroupManagement.Application.csproj", "Services/GroupManagement/KDVManager.Services.GroupManagement.Application/"]
COPY ["Services/GroupManagement/KDVManager.Services.GroupManagement.Domain/KDVManager.Services.GroupManagement.Domain.csproj", "Services/GroupManagement/KDVManager.Services.GroupManagement.Domain/"]
COPY ["Services/GroupManagement/KDVManager.Services.GroupManagement.Persistence/KDVManager.Services.GroupManagement.Persistence.csproj", "Services/GroupManagement/KDVManager.Services.GroupManagement.Persistence/"]
RUN dotnet restore "Services/GroupManagement/KDVManager.Services.GroupManagement.Api/KDVManager.Services.GroupManagement.Api.csproj"
COPY . .
WORKDIR "/src/Services/GroupManagement/KDVManager.Services.GroupManagement.Api"
RUN dotnet build "KDVManager.Services.GroupManagement.Api.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "KDVManager.Services.GroupManagement.Api.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "KDVManager.Services.GroupManagement.Api.dll"]
