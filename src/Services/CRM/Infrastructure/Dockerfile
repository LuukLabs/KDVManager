#See https://aka.ms/containerfastmode to understand how Visual Studio uses this Dockerfile to build your images for faster debugging.
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS dotnet-tools


FROM mcr.microsoft.com/dotnet/sdk:9.0 AS restore
WORKDIR /src
COPY ["Services/CRM/Api/Api.csproj", "Services/CRM/Api/"]
COPY ["Services/CRM/Application/Application.csproj", "Services/CRM/Application/"]
COPY ["Services/CRM/Domain/Domain.csproj", "Services/CRM/Domain/"]
COPY ["Services/CRM/Infrastructure/Infrastructure.csproj", "Services/CRM/Infrastructure/"]

# Shared projects
COPY ["Shared/KDVManager.Shared.Contracts/KDVManager.Shared.Contracts.csproj", "Shared/KDVManager.Shared.Contracts/"]
COPY ["Shared/KDVManager.Shared.Domain/KDVManager.Shared.Domain.csproj", "Shared/KDVManager.Shared.Domain/"]
COPY ["Shared/KDVManager.Shared.Infrastructure/KDVManager.Shared.Infrastructure.csproj", "Shared/KDVManager.Shared.Infrastructure/"]

RUN dotnet restore "Services/CRM/Api/Api.csproj"

FROM restore as build

COPY Services/CRM Services/CRM
COPY Shared Shared

WORKDIR "/src/Services/CRM"

FROM build as build-migrator

RUN dotnet tool install -g dotnet-ef --version 9.0.7
ENV PATH $PATH:/root/.dotnet/tools
RUN dotnet ef migrations bundle --self-contained -r linux-x64 --startup-project "./Api"

FROM mcr.microsoft.com/dotnet/runtime-deps:9.0 as migrator-runtime

COPY --from=build-migrator /src/Services/CRM/efbundle .

ENTRYPOINT [ "/bin/bash", "-c", "./efbundle --connection \"${ConnectionStrings__KDVManagerCRMConnectionString}\" " ]
