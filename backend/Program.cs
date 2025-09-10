using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using EduPressApi.Services;

var host = new HostBuilder()
    .ConfigureFunctionsWorkerDefaults()
    .ConfigureServices(services =>
    {
        services.AddHttpClient();
        services.AddScoped<IGitHubService, GitHubService>();
        services.AddScoped<IJwtService, JwtService>();
    })
    .Build();

host.Run();
