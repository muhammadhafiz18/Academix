using System.Net;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;

namespace EduPressApi.Functions
{
    public class CorsFunction
    {
        private readonly ILogger _logger;

        public CorsFunction(ILoggerFactory loggerFactory)
        {
            _logger = loggerFactory.CreateLogger<CorsFunction>();
        }

        [Function("Cors")]
        public HttpResponseData Run(
            [HttpTrigger(AuthorizationLevel.Anonymous, "options", Route = "{*route}")] HttpRequestData req)
        {
            _logger.LogInformation("CORS preflight request handled.");

            var response = req.CreateResponse(HttpStatusCode.OK);
            response.Headers.Add("Access-Control-Allow-Origin", "*");
            response.Headers.Add("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
            response.Headers.Add("Access-Control-Allow-Headers", "Content-Type, Authorization");
            response.Headers.Add("Access-Control-Max-Age", "86400");
            
            return response;
        }
    }
}
