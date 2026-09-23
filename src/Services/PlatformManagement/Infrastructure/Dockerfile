#See https://aka.ms/containerfastmode to understand how Visual Studio uses this Dockerfile to build your images for faster debugging.
FROM mcr.microsoft.com/dotnet/sdk:10.0.301 AS restore
WORKDIR /src
COPY ["Services/PlatformManagement/Api/Api.csproj", "Services/PlatformManagement/Api/"]
COPY ["Services/PlatformManagement/Application/Application.csproj", "Services/PlatformManagement/Application/"]
COPY ["Services/PlatformManagement/Domain/Domain.csproj", "Services/PlatformManagement/Domain/"]
COPY ["Services/PlatformManagement/Infrastructure/Infrastructure.csproj", "Services/PlatformManagement/Infrastructure/"]

# Shared projects
COPY ["Shared/KDVManager.Shared.Contracts/KDVManager.Shared.Contracts.csproj", "Shared/KDVManager.Shared.Contracts/"]
COPY ["Shared/KDVManager.Shared.Domain/KDVManager.Shared.Domain.csproj", "Shared/KDVManager.Shared.Domain/"]
COPY ["Shared/KDVManager.Shared.Infrastructure/KDVManager.Shared.Infrastructure.csproj", "Shared/KDVManager.Shared.Infrastructure/"]

RUN dotnet restore "Services/PlatformManagement/Api/Api.csproj"

FROM restore AS ef-tool

RUN dotnet tool install -g dotnet-ef --version 10.0.9
ENV PATH="$PATH:/root/.dotnet/tools"

FROM ef-tool AS build

COPY Services/PlatformManagement Services/PlatformManagement
COPY Shared Shared

WORKDIR "/src/Services/PlatformManagement"

FROM build AS build-migrator

RUN dotnet ef migrations bundle --self-contained -r linux-x64 --startup-project "./Api"

FROM mcr.microsoft.com/dotnet/runtime-deps:10.0.9 AS migrator-runtime

COPY --from=build-migrator /src/Services/PlatformManagement/efbundle .

ENTRYPOINT [ "/bin/bash", "-c", "./efbundle --connection \"${ConnectionStrings__KDVManagerPlatformManagementConnectionString}\" " ]
