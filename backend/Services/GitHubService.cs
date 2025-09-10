using Octokit;
using Newtonsoft.Json;
using EduPressApi.Models;

namespace EduPressApi.Services
{
    public interface IGitHubService
    {
        Task<Article> SaveArticleAsync(Article article);
        Task<List<ArticleMetadata>> GetArticlesMetadataAsync();
        Task<Article?> GetArticleAsync(string slug);
        Task<List<string>> SaveImagesAsync(string articleId, List<byte[]> imageData, List<string> imageNames);
    }

    public class GitHubService : IGitHubService
    {
        private readonly GitHubClient _gitHubClient;
        private readonly string _repoOwner;
        private readonly string _repoName;
        private readonly string _branch;

        public GitHubService()
        {
            var gitHubToken = Environment.GetEnvironmentVariable("GITHUB_TOKEN")
                ?? throw new InvalidOperationException("GITHUB_TOKEN is not configured");
            
            var repoFullName = Environment.GetEnvironmentVariable("GITHUB_REPO")
                ?? throw new InvalidOperationException("GITHUB_REPO is not configured");
            
            var repoParts = repoFullName.Split('/');
            if (repoParts.Length != 2)
                throw new InvalidOperationException("GITHUB_REPO must be in format 'owner/repo'");
            
            _repoOwner = repoParts[0];
            _repoName = repoParts[1];
            _branch = Environment.GetEnvironmentVariable("GITHUB_BRANCH") ?? "main";

            _gitHubClient = new GitHubClient(new ProductHeaderValue("AcademixApi"))
            {
                Credentials = new Credentials(gitHubToken)
            };
        }

        public async Task<Article> SaveArticleAsync(Article article)
        {
            try
            {
                // Generate ID and slug if not provided
                if (string.IsNullOrEmpty(article.Id))
                {
                    article.Id = Guid.NewGuid().ToString();
                }

                if (string.IsNullOrEmpty(article.Slug))
                {
                    article.Slug = GenerateSlug(article.Title);
                }

                if (article.PublishedAt == default)
                {
                    article.PublishedAt = DateTime.UtcNow;
                }

                // Convert article to JSON
                var articleJson = JsonConvert.SerializeObject(article, Formatting.Indented);
                var fileName = $"articles/{article.Id}.json";

                // Check if file already exists
                try
                {
                    var existingFile = await _gitHubClient.Repository.Content.GetAllContents(_repoOwner, _repoName, fileName);
                    // Update existing file
                    var updateRequest = new UpdateFileRequest(
                        $"Update article: {article.Title}",
                        articleJson,
                        existingFile.First().Sha)
                    {
                        Branch = _branch
                    };
                    
                    await _gitHubClient.Repository.Content.UpdateFile(_repoOwner, _repoName, fileName, updateRequest);
                }
                catch (NotFoundException)
                {
                    // Create new file
                    var createRequest = new CreateFileRequest(
                        $"Add new article: {article.Title}",
                        articleJson)
                    {
                        Branch = _branch
                    };
                    
                    await _gitHubClient.Repository.Content.CreateFile(_repoOwner, _repoName, fileName, createRequest);
                }

                return article;
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException($"Failed to save article to GitHub: {ex.Message}", ex);
            }
        }

        public async Task<List<ArticleMetadata>> GetArticlesMetadataAsync()
        {
            try
            {
                var articles = new List<ArticleMetadata>();
                
                try
                {
                    var contents = await _gitHubClient.Repository.Content.GetAllContents(_repoOwner, _repoName, "articles");
                    
                    foreach (var file in contents.Where(f => f.Name.EndsWith(".json")))
                    {
                        try
                        {
                            var fileContent = await _gitHubClient.Repository.Content.GetAllContents(_repoOwner, _repoName, file.Path);
                            var jsonContent = fileContent.First().Content;
                            
                            // Decode the Base64 content properly
                            string decodedContent;
                            try
                            {
                                // Clean up the Base64 string (remove whitespace and newlines)
                                var cleanBase64 = jsonContent.Replace("\n", "").Replace("\r", "").Replace(" ", "");
                                decodedContent = System.Text.Encoding.UTF8.GetString(Convert.FromBase64String(cleanBase64));
                            }
                            catch
                            {
                                // If Base64 decoding fails, assume content is already decoded
                                decodedContent = jsonContent;
                            }
                            
                            var article = JsonConvert.DeserializeObject<Article>(decodedContent);
                            if (article != null)
                            {
                                articles.Add(new ArticleMetadata
                                {
                                    Id = article.Id,
                                    Title = article.Title,
                                    Author = article.Author,
                                    PublishedAt = article.PublishedAt,
                                    Slug = article.Slug
                                });
                            }
                        }
                        catch (Exception ex)
                        {
                            // Log error but continue processing other files
                            Console.WriteLine($"Error processing file {file.Name}: {ex.Message}");
                        }
                    }
                }
                catch (NotFoundException)
                {
                    // Articles folder doesn't exist yet, return empty list
                    return new List<ArticleMetadata>();
                }
                
                return articles.OrderByDescending(a => a.PublishedAt).ToList();
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException($"Failed to get articles from GitHub: {ex.Message}", ex);
            }
        }

        public async Task<Article?> GetArticleAsync(string slug)
        {
            try
            {
                var contents = await _gitHubClient.Repository.Content.GetAllContents(_repoOwner, _repoName, "articles");
                
                foreach (var file in contents.Where(f => f.Name.EndsWith(".json")))
                {
                    try
                    {
                        var fileContent = await _gitHubClient.Repository.Content.GetAllContents(_repoOwner, _repoName, file.Path);
                        var jsonContent = fileContent.First().Content;
                        
                        // Decode the Base64 content properly
                        string decodedContent;
                        try
                        {
                            // Clean up the Base64 string (remove whitespace and newlines)
                            var cleanBase64 = jsonContent.Replace("\n", "").Replace("\r", "").Replace(" ", "");
                            decodedContent = System.Text.Encoding.UTF8.GetString(Convert.FromBase64String(cleanBase64));
                        }
                        catch
                        {
                            // If Base64 decoding fails, assume content is already decoded
                            decodedContent = jsonContent;
                        }
                        
                        var article = JsonConvert.DeserializeObject<Article>(decodedContent);
                        if (article?.Slug == slug)
                        {
                            return article;
                        }
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"Error processing file {file.Name}: {ex.Message}");
                    }
                }
                
                return null;
            }
            catch (NotFoundException)
            {
                return null;
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException($"Failed to get article from GitHub: {ex.Message}", ex);
            }
        }

        public async Task<List<string>> SaveImagesAsync(string articleId, List<byte[]> imageData, List<string> imageNames)
        {
            var imageUrls = new List<string>();
            
            try
            {
                for (int i = 0; i < imageData.Count; i++)
                {
                    var imageBytes = imageData[i];
                    var originalFileName = imageNames[i];
                    var fileExtension = Path.GetExtension(originalFileName);
                    var fileName = $"images/articles/{articleId}/{i}_{Guid.NewGuid()}{fileExtension}";
                    
                    // Convert image bytes to base64 for GitHub API
                    var base64Content = Convert.ToBase64String(imageBytes);
                    
                    try
                    {
                        // Create new image file in GitHub
                        var createRequest = new CreateFileRequest(
                            $"Add image for article {articleId}",
                            base64Content)
                        {
                            Branch = _branch
                        };
                        
                        await _gitHubClient.Repository.Content.CreateFile(_repoOwner, _repoName, fileName, createRequest);
                        
                        // Generate the public URL for GitHub Pages
                        var imageUrl = $"https://{_repoOwner}.github.io/{_repoName}/{fileName}";
                        imageUrls.Add(imageUrl);
                    }
                    catch (Exception ex)
                    {
                        throw new InvalidOperationException($"Failed to upload image {originalFileName}: {ex.Message}", ex);
                    }
                }
                
                return imageUrls;
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException($"Failed to save images to GitHub: {ex.Message}", ex);
            }
        }

        private static string GenerateSlug(string title)
        {
            // Simple slug generation - convert to lowercase, replace spaces with hyphens, remove special characters
            var slug = title.ToLowerInvariant()
                .Replace(" ", "-")
                .Replace("'", "")
                .Replace("\"", "");
            
            // Remove any non-alphanumeric characters except hyphens
            slug = System.Text.RegularExpressions.Regex.Replace(slug, @"[^a-z0-9\-]", "");
            
            // Remove multiple consecutive hyphens
            slug = System.Text.RegularExpressions.Regex.Replace(slug, @"-+", "-");
            
            // Remove leading/trailing hyphens
            slug = slug.Trim('-');
            
            // Limit length
            if (slug.Length > 50)
                slug = slug.Substring(0, 50).TrimEnd('-');
                
            return slug;
        }
    }
}
