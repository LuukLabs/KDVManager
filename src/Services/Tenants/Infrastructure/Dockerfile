#See https://aka.ms/containerfastmode to understand how Visual Studio uses this Dockerfile to build your images for faster debugging.
FROM mcr.microsoft.com/dotnet/sdk:10.0.301 AS dotnet-tools


FROM mcr.microsoft.com/dotnet/sdk:10.0.301 AS restore
WORKDIR /src
COPY ["Services/Tenants/Api/Api.csproj", "Services/Tenants/Api/"]
COPY ["Services/Tenants/Application/Application.csproj", "Services/Tenants/Application/"]
COPY ["Services/Tenants/Domain/Domain.csproj", "Services/Tenants/Domain/"]
COPY ["Services/Tenants/Infrastructure/Infrastructure.csproj", "Services/Tenants/Infrastructure/"]

# Shared projects
COPY ["Shared/KDVManager.Shared.Contracts/KDVManager.Shared.Contracts.csproj", "Shared/KDVManager.Shared.Contracts/"]
COPY ["Shared/KDVManager.Shared.Domain/KDVManager.Shared.Domain.csproj", "Shared/KDVManager.Shared.Domain/"]
COPY ["Shared/KDVManager.Shared.Infrastructure/KDVManager.Shared.Infrastructure.csproj", "Shared/KDVManager.Shared.Infrastructure/"]

RUN dotnet restore "Services/Tenants/Api/Api.csproj"

FROM restore AS build

COPY Services/Tenants Services/Tenants
COPY Shared Shared

WORKDIR "/src/Services/Tenants"

FROM build AS build-migrator

RUN dotnet tool install -g dotnet-ef --version 9.0.7
ENV PATH="$PATH:/root/.dotnet/tools"
RUN dotnet ef migrations bundle --self-contained -r linux-x64 --startup-project "./Api"

FROM mcr.microsoft.com/dotnet/runtime-deps:10.0.9 AS migrator-runtime

COPY --from=build-migrator /src/Services/Tenants/efbundle .

ENTRYPOINT [ "/bin/bash", "-c", "./efbundle --connection \"${ConnectionStrings__KDVManagerTenantsConnectionString}\" " ]
