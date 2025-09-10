using System.Net;
using System.Text.Json;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;
using EduPressApi.Services;

namespace EduPressApi.Functions
{
    public class GetArticleFunction
    {
        private readonly ILogger _logger;
        private readonly IGitHubService _gitHubService;

        public GetArticleFunction(ILoggerFactory loggerFactory, IGitHubService gitHubService)
        {
            _logger = loggerFactory.CreateLogger<GetArticleFunction>();
            _gitHubService = gitHubService;
        }

        [Function("GetArticle")]
        public async Task<HttpResponseData> Run(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "get-article/{slug}")] HttpRequestData req)
        {
            _logger.LogInformation("Get article function triggered.");

            try
            {
                var slug = req.FunctionContext.BindingContext.BindingData["slug"]?.ToString();
                
                if (string.IsNullOrEmpty(slug))
                {
                    var badRequestResponse = req.CreateResponse(HttpStatusCode.BadRequest);
                    await badRequestResponse.WriteStringAsync(JsonSerializer.Serialize(new { message = "Slug is required" }));
                    return badRequestResponse;
                }

                var article = await _gitHubService.GetArticleAsync(slug);

                if (article == null)
                {
                    var notFoundResponse = req.CreateResponse(HttpStatusCode.NotFound);
                    await notFoundResponse.WriteStringAsync(JsonSerializer.Serialize(new { message = "Article not found" }));
                    return notFoundResponse;
                }

                _logger.LogInformation($"Retrieved article: {article.Id}");

                var response = req.CreateResponse(HttpStatusCode.OK);
                response.Headers.Add("Content-Type", "application/json");
                response.Headers.Add("Access-Control-Allow-Origin", "*");
                response.Headers.Add("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
                response.Headers.Add("Access-Control-Allow-Headers", "Content-Type, Authorization");
                
                await response.WriteStringAsync(JsonSerializer.Serialize(article));
                return response;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting article");
                
                var errorResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
                await errorResponse.WriteStringAsync(JsonSerializer.Serialize(new { message = "Internal server error" }));
                return errorResponse;
            }
        }
    }
}
