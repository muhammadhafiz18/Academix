# Test Article with Images and Code

This is a test article to demonstrate the new enhanced Academix system!

## What's New?

1. **No Content Type Selection** - Just write however you want!
2. **Automatic Image Upload** - Images get uploaded to GitHub Pages
3. **Flexible Writing** - Plain text or markdown, your choice!

## Code Example

Here's some JavaScript code:

```javascript
function uploadImage(file) {
    const formData = new FormData();
    formData.append('image', file);
    
    return fetch('/api/upload-image', {
        method: 'POST',
        body: formData
    });
}
```

## Plain Text Works Too

You can just write normal text like this paragraph. No special formatting needed!

But if you want **bold text** or *italic text*, that works too.

## Images

When you upload images, they will be automatically:
- Uploaded to your GitHub repository
- Made available via GitHub Pages
- Displayed in your articles with proper styling

The system now handles everything automatically!
