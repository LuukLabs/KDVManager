#See https://aka.ms/containerfastmode to understand how Visual Studio uses this Dockerfile to build your images for faster debugging.
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["Services/Scheduling/Api/Api.csproj", "Services/Scheduling/Api/"]
COPY ["Services/Scheduling/Application/Application.csproj", "Services/Scheduling/Application/"]
COPY ["Services/Scheduling/Domain/Domain.csproj", "Services/Scheduling/Domain/"]
COPY ["Services/Scheduling/Infrastructure/Infrastructure.csproj", "Services/Scheduling/Infrastructure/"]
RUN dotnet restore "Services/Scheduling/Api/Api.csproj"
COPY . .
WORKDIR "/src/Services/Scheduling/Infrastructure"

RUN dotnet tool install -g dotnet-ef --version 8.0.8
ENV PATH $PATH:/root/.dotnet/tools
RUN dotnet ef migrations bundle --self-contained -r linux-x64 --startup-project "../Api" --context SchedulingDbContext

FROM ubuntu:24.04 AS migrator

RUN apt-get update && apt-get install -qqq libicu-dev libssl-dev

WORKDIR /migrator
COPY --from=build /src/Services/Scheduling/Infrastructure/efbundle .

ENTRYPOINT [ "/bin/bash", "-c", "./efbundle --verbose --connection \"${ConnectionStrings__KDVManagerSchedulingConnectionString}\" " ]
