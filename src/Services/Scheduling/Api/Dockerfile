#See https://aka.ms/containerfastmode to understand how Visual Studio uses this Dockerfile to build your images for faster debugging.

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY ["Services/Scheduling/Api/Api.csproj", "Services/Scheduling/Api/"]
COPY ["Services/Scheduling/Application/Application.csproj", "Services/Scheduling/Application/"]
COPY ["Services/Scheduling/Domain/Domain.csproj", "Services/Scheduling/Domain/"]
COPY ["Services/Scheduling/Infrastructure/Infrastructure.csproj", "Services/Scheduling/Infrastructure/"]
RUN dotnet restore "Services/Scheduling/Api/Api.csproj"
COPY . .
WORKDIR "/src/Services/Scheduling/Api"
RUN dotnet build "Api.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "Api.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "Api.dll"]
