FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

COPY lolguide-api.csproj .
RUN dotnet restore lolguide-api.csproj

COPY . .
RUN dotnet publish lolguide-api.csproj -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app

EXPOSE 8080

ENV ASPNETCORE_URLS=http://+:8080
ENV OPENAI_API_KEY=
ENV ConnectionStrings__DefaultConnection=

COPY --from=build /app/publish .

ENTRYPOINT ["dotnet", "lolguide-api.dll"]
