FROM mcr.microsoft.com/dotnet/sdk:10.0 AS restore
WORKDIR /src
COPY ["Services/Scheduling/Api/Api.csproj", "Services/Scheduling/Api/"]
COPY ["Services/Scheduling/Application/Application.csproj", "Services/Scheduling/Application/"]
COPY ["Services/Scheduling/Domain/Domain.csproj", "Services/Scheduling/Domain/"]
COPY ["Services/Scheduling/Infrastructure/Infrastructure.csproj", "Services/Scheduling/Infrastructure/"]

# Shared projects
COPY ["Shared/KDVManager.Shared.Contracts/KDVManager.Shared.Contracts.csproj", "Shared/KDVManager.Shared.Contracts/"]
COPY ["Shared/KDVManager.Shared.Domain/KDVManager.Shared.Domain.csproj", "Shared/KDVManager.Shared.Domain/"]
COPY ["Shared/KDVManager.Shared.Infrastructure/KDVManager.Shared.Infrastructure.csproj", "Shared/KDVManager.Shared.Infrastructure/"]

# Set up github source for NuGet packages
ARG NUGET_GITHUB_TOKEN
RUN dotnet nuget add source "https://nuget.pkg.github.com/LuukLabs/index.json" --name "github" --username "LuukVH" --password "$NUGET_GITHUB_TOKEN" --store-password-in-clear-text

RUN dotnet restore "Services/Scheduling/Api/Api.csproj"

FROM restore as build

COPY Services/Scheduling Services/Scheduling
COPY Shared Shared

WORKDIR "/src/Services/Scheduling"

FROM build as build-migrator

RUN dotnet tool install -g dotnet-ef --version 9.0.7
ENV PATH $PATH:/root/.dotnet/tools
RUN dotnet ef migrations bundle --self-contained -r linux-x64 --project ./Infrastructure --startup-project ./Api

FROM mcr.microsoft.com/dotnet/runtime-deps:10.0 as migrator-runtime

COPY --from=build-migrator /src/Services/Scheduling/efbundle .

ENTRYPOINT [ "/bin/bash", "-c", "./efbundle --verbose --connection \"${ConnectionStrings__KDVManagerSchedulingConnectionString}\" " ]
