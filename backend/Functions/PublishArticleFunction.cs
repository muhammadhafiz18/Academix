using System.ComponentModel.DataAnnotations;
using System.Net;
using System.Text.Json;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;
using EduPressApi.Models;
using EduPressApi.Services;
using System.Text;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.Net.Http.Headers;

namespace EduPressApi.Functions
{
    public class PublishArticleFunction
    {
        private readonly ILogger _logger;
        private readonly IGitHubService _gitHubService;
        private readonly IJwtService _jwtService;

        public PublishArticleFunction(ILoggerFactory loggerFactory, IGitHubService gitHubService, IJwtService jwtService)
        {
            _logger = loggerFactory.CreateLogger<PublishArticleFunction>();
            _gitHubService = gitHubService;
            _jwtService = jwtService;
        }

        [Function("PublishArticle")]
        public async Task<HttpResponseData> Run(
            [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "publish-article")] HttpRequestData req)
        {
            _logger.LogInformation("Publish article function triggered.");

            try
            {
                // Validate JWT token
                if (!req.Headers.TryGetValues("Authorization", out var authHeaders))
                {
                    var unauthorizedResponse = req.CreateResponse(HttpStatusCode.Unauthorized);
                    await unauthorizedResponse.WriteStringAsync(JsonSerializer.Serialize(new { message = "Authorization header is required" }));
                    return unauthorizedResponse;
                }

                var authHeader = authHeaders.FirstOrDefault();
                if (string.IsNullOrEmpty(authHeader) || !authHeader.StartsWith("Bearer "))
                {
                    var unauthorizedResponse = req.CreateResponse(HttpStatusCode.Unauthorized);
                    await unauthorizedResponse.WriteStringAsync(JsonSerializer.Serialize(new { message = "Bearer token is required" }));
                    return unauthorizedResponse;
                }

                var token = authHeader.Substring("Bearer ".Length);
                var principal = await _jwtService.ValidateTokenAsync(token);
                
                if (principal == null)
                {
                    var unauthorizedResponse = req.CreateResponse(HttpStatusCode.Unauthorized);
                    await unauthorizedResponse.WriteStringAsync(JsonSerializer.Serialize(new { message = "Invalid or expired token" }));
                    return unauthorizedResponse;
                }

                // Parse request body (handle both JSON and multipart form data)
                PublishArticleRequest publishRequest;
                List<byte[]> imageData = new List<byte[]>();
                List<string> imageNames = new List<string>();

                string? contentType = null;
                if (req.Headers.TryGetValues("Content-Type", out var contentTypeValues))
                {
                    contentType = contentTypeValues.FirstOrDefault();
                }
                
                if (contentType != null && contentType.Contains("multipart/form-data"))
                {
                    // Handle multipart form data for image uploads
                    publishRequest = await ParseMultipartFormData(req, imageData, imageNames);
                }
                else
                {
                    // Handle JSON request
                    var requestBody = await new StreamReader(req.Body).ReadToEndAsync();
                    publishRequest = JsonSerializer.Deserialize<PublishArticleRequest>(requestBody, new JsonSerializerOptions
                    {
                        PropertyNameCaseInsensitive = true
                    });
                }

                if (publishRequest == null)
                {
                    var badRequestResponse = req.CreateResponse(HttpStatusCode.BadRequest);
                    await badRequestResponse.WriteStringAsync(JsonSerializer.Serialize(new { message = "Invalid request body" }));
                    return badRequestResponse;
                }

                // Validate the request
                var validationResults = new List<ValidationResult>();
                var validationContext = new ValidationContext(publishRequest);
                if (!Validator.TryValidateObject(publishRequest, validationContext, validationResults, true))
                {
                    var errors = validationResults.Select(vr => vr.ErrorMessage).ToList();
                    var validationResponse = req.CreateResponse(HttpStatusCode.BadRequest);
                    await validationResponse.WriteStringAsync(JsonSerializer.Serialize(new { message = "Validation failed", errors }));
                    return validationResponse;
                }

                // Create article
                var article = new Article
                {
                    Id = Guid.NewGuid().ToString(),
                    Title = publishRequest.Title.Trim(),
                    Author = publishRequest.Author.Trim(),
                    Content = publishRequest.Content.Trim(),
                    ContentType = publishRequest.ContentType ?? "plaintext",
                    PublishedAt = DateTime.UtcNow,
                    Slug = ""  // Will be generated in GitHubService
                };

                // Handle image uploads if present
                if (imageData.Any())
                {
                    var imageUrls = await _gitHubService.SaveImagesAsync(article.Id, imageData, imageNames);
                    article.Images = imageUrls;
                }

                // Save to GitHub
                var savedArticle = await _gitHubService.SaveArticleAsync(article);

                _logger.LogInformation($"Article published successfully: {savedArticle.Id}");

                var response = req.CreateResponse(HttpStatusCode.Created);
                response.Headers.Add("Content-Type", "application/json");
                response.Headers.Add("Access-Control-Allow-Origin", "*");
                response.Headers.Add("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
                response.Headers.Add("Access-Control-Allow-Headers", "Content-Type, Authorization");
                await response.WriteStringAsync(JsonSerializer.Serialize(savedArticle));
                return response;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error publishing article");
                
                var errorResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
                await errorResponse.WriteStringAsync(JsonSerializer.Serialize(new { message = "Internal server error" }));
                return errorResponse;
            }
        }

        private async Task<PublishArticleRequest> ParseMultipartFormData(HttpRequestData req, List<byte[]> imageData, List<string> imageNames)
        {
            var publishRequest = new PublishArticleRequest();
            
            // This is a simplified multipart parser. In production, you'd use a proper multipart parser library
            var boundary = GetBoundary(req.Headers.GetValues("Content-Type").FirstOrDefault());
            if (string.IsNullOrEmpty(boundary))
            {
                throw new InvalidOperationException("Invalid multipart boundary");
            }

            var reader = new MultipartReader(boundary, req.Body);
            var section = await reader.ReadNextSectionAsync();

            while (section != null)
            {
                var contentDisposition = section.GetContentDispositionHeader();
                
                if (contentDisposition != null)
                {
                    if (contentDisposition.IsFormDisposition())
                    {
                        var name = contentDisposition.Name.Value?.Trim('"');
                        var value = await new StreamReader(section.Body).ReadToEndAsync();

                        switch (name?.ToLower())
                        {
                            case "title":
                                publishRequest.Title = value;
                                break;
                            case "author":
                                publishRequest.Author = value;
                                break;
                            case "content":
                                publishRequest.Content = value;
                                break;
                            case "contenttype":
                                publishRequest.ContentType = value;
                                break;
                        }
                    }
                    else if (contentDisposition.IsFileDisposition())
                    {
                        var fileName = contentDisposition.FileName.Value?.Trim('"');
                        if (!string.IsNullOrEmpty(fileName) && IsImageFile(fileName))
                        {
                            using var memoryStream = new MemoryStream();
                            await section.Body.CopyToAsync(memoryStream);
                            imageData.Add(memoryStream.ToArray());
                            imageNames.Add(fileName);
                        }
                    }
                }

                section = await reader.ReadNextSectionAsync();
            }

            return publishRequest;
        }

        private string? GetBoundary(string? contentType)
        {
            if (string.IsNullOrEmpty(contentType))
                return null;

            var elements = contentType.Split(' ');
            var element = elements.FirstOrDefault(entry => entry.StartsWith("boundary="));
            if (element == null)
                return null;

            var boundary = element.Substring("boundary=".Length);
            var result = HeaderUtilities.RemoveQuotes(boundary);
            return result.Value;
        }

        private bool IsImageFile(string fileName)
        {
            var extension = Path.GetExtension(fileName)?.ToLower();
            return extension switch
            {
                ".jpg" or ".jpeg" or ".png" or ".gif" or ".bmp" or ".webp" => true,
                _ => false
            };
        }
    }
}
