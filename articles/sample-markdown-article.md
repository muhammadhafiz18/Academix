# Sample Rich Text Article with Code Blocks

Welcome to the enhanced **Academix** article system! This article demonstrates the new rich text capabilities including:

## Features Implemented

### ✨ Rich Text Formatting
- **Bold text** and *italic text*
- Headers (H1, H2, H3, etc.)
- Lists (bulleted and numbered)
- Links and much more!

### 💻 Code Block Support
Here's a JavaScript example:

```javascript
function publishArticle(content) {
  return fetch('/api/publish-article', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      title: 'My Article',
      content: content,
      contentType: 'markdown'
    })
  });
}
```

And a C# example:

```csharp
public class Article
{
    public string Id { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Author { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string ContentType { get; set; } = "plaintext";
    public List<string>? Images { get; set; }
    public DateTime PublishedAt { get; set; }
    public string Slug { get; set; } = string.Empty;
}
```

### 📸 Image Support
The system now supports image uploads! You can:
- Upload multiple images at once
- Preview images before publishing
- Images are processed and stored with the article

### 📝 Content Types
Choose between:
1. **Markdown** - Full rich text with formatting, code blocks, tables, etc.
2. **Plain Text** - Simple text format for basic articles

## Tables Support

| Feature | Status | Notes |
|---------|--------|-------|
| Markdown Editor | ✅ Complete | Full-featured editor with preview |
| Code Highlighting | ✅ Complete | Supports 100+ programming languages |
| Image Upload | ✅ Complete | Multiple image support |
| Tables | ✅ Complete | Full table formatting support |

## Blockquotes

> "The best way to learn is by teaching others. Share your knowledge and help the community grow!"
> 
> — Academix Team

## What's Next?

This enhanced article system opens up many possibilities:

- **Better Learning Materials**: Create comprehensive tutorials with code examples
- **Technical Documentation**: Write detailed guides with proper formatting
- **Research Papers**: Present findings with tables, images, and citations
- **Code Tutorials**: Step-by-step programming guides with syntax highlighting

---

*Happy writing with the new Academix system!* 🚀
