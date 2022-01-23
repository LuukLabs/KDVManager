#See https://aka.ms/containerfastmode to understand how Visual Studio uses this Dockerfile to build your images for faster debugging.
FROM mcr.microsoft.com/dotnet/sdk:6.0 AS build
WORKDIR /src
COPY ["Services/ChildManagement/Api/KDVManager.Services.ChildManagement.Api.csproj", "Services/ChildManagement/Api/"]
COPY ["Services/ChildManagement/Application/KDVManager.Services.ChildManagement.Application.csproj", "Services/ChildManagement/Application/"]
COPY ["Services/ChildManagement/Domain/KDVManager.Services.ChildManagement.Domain.csproj", "Services/ChildManagement/Domain/"]
COPY ["Services/ChildManagement/Infrastructure/KDVManager.Services.ChildManagement.Infrastructure.csproj", "Services/ChildManagement/Infrastructure/"]
RUN dotnet restore "Services/ChildManagement/Api/KDVManager.Services.ChildManagement.Api.csproj"
COPY . .
WORKDIR "/src/Services/ChildManagement/KDVManager.Services.ChildManagement.Infrastructure"

RUN dotnet tool install -g dotnet-ef --version 6.0.1
ENV PATH $PATH:/root/.dotnet/tools
RUN dotnet ef migrations bundle --self-contained -r linux-x64 --startup-project "../Api" --context MigrationDbContext

FROM ubuntu:latest AS migrator

RUN apt-get update && apt-get install -qqq libicu-dev libssl-dev

WORKDIR /migrator
COPY --from=build /src/Services/ChildManagement/KDVManager.Services.ChildManagement.Infrastructure/efbundle .

ENTRYPOINT [ "/bin/bash", "-c", "./efbundle --verbose --connection \"${ConnectionStrings__KDVManagerChildManagementConnectionString}\" " ]
