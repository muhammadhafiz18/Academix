using System.ComponentModel.DataAnnotations;

namespace EduPressApi.Models
{
    public class Article
    {
        public string Id { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Author { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public string ContentType { get; set; } = "plaintext"; // "markdown" or "plaintext"
        public List<string>? Images { get; set; }
        public DateTime PublishedAt { get; set; }
        public string Slug { get; set; } = string.Empty;
    }

    public class ArticleMetadata
    {
        public string Id { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Author { get; set; } = string.Empty;
        public DateTime PublishedAt { get; set; }
        public string Slug { get; set; } = string.Empty;
    }

    public class PublishArticleRequest
    {
        [Required]
        [StringLength(200, MinimumLength = 3)]
        public string Title { get; set; } = string.Empty;

        [Required]
        [StringLength(100, MinimumLength = 2)]
        public string Author { get; set; } = string.Empty;

        [Required]
        [StringLength(50000, MinimumLength = 10)]
        public string Content { get; set; } = string.Empty;

        public string ContentType { get; set; } = "plaintext"; // "markdown" or "plaintext"
    }
}
