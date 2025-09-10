using System.Net;
using System.Text.Json;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;
using EduPressApi.Services;

namespace EduPressApi.Functions
{
    public class GetArticlesFunction
    {
        private readonly ILogger _logger;
        private readonly IGitHubService _gitHubService;

        public GetArticlesFunction(ILoggerFactory loggerFactory, IGitHubService gitHubService)
        {
            _logger = loggerFactory.CreateLogger<GetArticlesFunction>();
            _gitHubService = gitHubService;
        }

        [Function("GetArticles")]
        public async Task<HttpResponseData> Run(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "get-articles")] HttpRequestData req)
        {
            _logger.LogInformation("Get articles function triggered.");

            try
            {
                var articles = await _gitHubService.GetArticlesMetadataAsync();

                _logger.LogInformation($"Retrieved {articles.Count} articles");

                var response = req.CreateResponse(HttpStatusCode.OK);
                response.Headers.Add("Content-Type", "application/json");
                response.Headers.Add("Access-Control-Allow-Origin", "*");
                response.Headers.Add("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
                response.Headers.Add("Access-Control-Allow-Headers", "Content-Type, Authorization");
                
                await response.WriteStringAsync(JsonSerializer.Serialize(articles));
                return response;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting articles");
                
                var errorResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
                await errorResponse.WriteStringAsync(JsonSerializer.Serialize(new { message = "Internal server error" }));
                return errorResponse;
            }
        }
    }
}
