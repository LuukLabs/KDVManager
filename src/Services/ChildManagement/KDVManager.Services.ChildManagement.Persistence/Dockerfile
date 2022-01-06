#See https://aka.ms/containerfastmode to understand how Visual Studio uses this Dockerfile to build your images for faster debugging.
FROM mcr.microsoft.com/dotnet/sdk:6.0 AS build
WORKDIR /src
COPY ["Services/ChildManagement/KDVManager.Services.ChildManagement.Api/KDVManager.Services.ChildManagement.Api.csproj", "Services/ChildManagement/KDVManager.Services.ChildManagement.Api/"]
COPY ["Services/ChildManagement/KDVManager.Services.ChildManagement.Application/KDVManager.Services.ChildManagement.Application.csproj", "Services/ChildManagement/KDVManager.Services.ChildManagement.Application/"]
COPY ["Services/ChildManagement/KDVManager.Services.ChildManagement.Domain/KDVManager.Services.ChildManagement.Domain.csproj", "Services/ChildManagement/KDVManager.Services.ChildManagement.Domain/"]
COPY ["Services/ChildManagement/KDVManager.Services.ChildManagement.Persistence/KDVManager.Services.ChildManagement.Persistence.csproj", "Services/ChildManagement/KDVManager.Services.ChildManagement.Persistence/"]
RUN dotnet restore "Services/ChildManagement/KDVManager.Services.ChildManagement.Api/KDVManager.Services.ChildManagement.Api.csproj"
COPY . .
WORKDIR "/src/Services/ChildManagement/KDVManager.Services.ChildManagement.Persistence"

RUN dotnet tool install -g dotnet-ef --version 6.0.1
ENV PATH $PATH:/root/.dotnet/tools
RUN dotnet ef migrations bundle --self-contained -r linux-x64 --startup-project "../KDVManager.Services.ChildManagement.Api"

FROM ubuntu:latest AS migrator

RUN apt-get update && apt-get install -qqq libicu-dev

WORKDIR /migrator
COPY --from=build /src/Services/ChildManagement/KDVManager.Services.ChildManagement.Persistence/efbundle .

ENTRYPOINT [ "/bin/bash", "-c", "./efbundle --verbose --connection \"${ConnectionStrings__KDVManagerChildManagementConnectionString}\" " ]
