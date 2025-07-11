#See https://aka.ms/containerfastmode to understand how Visual Studio uses this Dockerfile to build your images for faster debugging.
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS restore
WORKDIR /src

# Copy project files for better caching
COPY ["Services/CRM/Api/Api.csproj", "Services/CRM/Api/"]
COPY ["Services/CRM/Application/Application.csproj", "Services/CRM/Application/"]
COPY ["Services/CRM/Domain/Domain.csproj", "Services/CRM/Domain/"]
COPY ["Services/CRM/Infrastructure/Infrastructure.csproj", "Services/CRM/Infrastructure/"]

# Restore dependencies (this layer can be cached)
RUN dotnet restore "Services/CRM/Api/Api.csproj" --verbosity minimal

FROM restore AS build
# Copy source code after restore
COPY . .
WORKDIR "/src/Services/CRM/Infrastructure"

# Install EF tools and create migration bundle
RUN dotnet tool install -g dotnet-ef --version 9.0.6
ENV PATH $PATH:/root/.dotnet/tools
RUN dotnet ef migrations bundle --self-contained -r linux-x64 \
    --startup-project "../Api" \
    --context ApplicationDbContext \
    --verbosity minimal

FROM ubuntu:24.04 AS migrator

RUN apt-get update && apt-get install -qqq libicu-dev libssl-dev

WORKDIR /migrator
COPY --from=build /src/Services/CRM/Infrastructure/efbundle .

ENTRYPOINT [ "/bin/bash", "-c", "./efbundle --verbose --connection \"${ConnectionStrings__KDVManagerCRMConnectionString}\" " ]
