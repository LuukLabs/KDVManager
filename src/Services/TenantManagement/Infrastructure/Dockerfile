#See https://aka.ms/containerfastmode to understand how Visual Studio uses this Dockerfile to build your images for faster debugging.
FROM mcr.microsoft.com/dotnet/sdk:10.0.300 AS dotnet-tools


FROM mcr.microsoft.com/dotnet/sdk:10.0.300 AS restore
WORKDIR /src
COPY ["Services/TenantManagement/Api/Api.csproj", "Services/TenantManagement/Api/"]
COPY ["Services/TenantManagement/Application/Application.csproj", "Services/TenantManagement/Application/"]
COPY ["Services/TenantManagement/Domain/Domain.csproj", "Services/TenantManagement/Domain/"]
COPY ["Services/TenantManagement/Infrastructure/Infrastructure.csproj", "Services/TenantManagement/Infrastructure/"]

# Shared projects
COPY ["Shared/KDVManager.Shared.Contracts/KDVManager.Shared.Contracts.csproj", "Shared/KDVManager.Shared.Contracts/"]
COPY ["Shared/KDVManager.Shared.Domain/KDVManager.Shared.Domain.csproj", "Shared/KDVManager.Shared.Domain/"]
COPY ["Shared/KDVManager.Shared.Infrastructure/KDVManager.Shared.Infrastructure.csproj", "Shared/KDVManager.Shared.Infrastructure/"]

RUN dotnet restore "Services/TenantManagement/Api/Api.csproj"

FROM restore as build

COPY Services/TenantManagement Services/TenantManagement
COPY Shared Shared

WORKDIR "/src/Services/TenantManagement"

FROM build as build-migrator

RUN dotnet tool install -g dotnet-ef --version 9.0.7
ENV PATH $PATH:/root/.dotnet/tools
RUN dotnet ef migrations bundle --self-contained -r linux-x64 --startup-project "./Api"

FROM mcr.microsoft.com/dotnet/runtime-deps:10.0.8 as migrator-runtime

COPY --from=build-migrator /src/Services/TenantManagement/efbundle .

ENTRYPOINT [ "/bin/bash", "-c", "./efbundle --connection \"${ConnectionStrings__KDVManagerTenantManagementConnectionString}\" " ]
