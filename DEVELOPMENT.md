# Academix Development Guide

This guide will help you set up Academix for local development.

## Prerequisites

- Node.js 18+
- .NET 8 SDK
- Azure Functions Core Tools v4
- Git
- VS Code (recommended)

## Installation

### 1. Install Azure Functions Core Tools

**macOS:**
```bash
brew tap azure/functions
brew install azure-functions-core-tools@4
```

**Windows:**
```bash
npm install -g azure-functions-core-tools@4 --unsafe-perm true
```

**Linux:**
```bash
wget -q https://packages.microsoft.com/config/ubuntu/20.04/packages-microsoft-prod.deb
sudo dpkg -i packages-microsoft-prod.deb
sudo apt-get update
sudo apt-get install azure-functions-core-tools-4
```

### 2. Clone and Setup

```bash
git clone https://github.com/yourusername/academix.git
cd academix
```

## Frontend Development

```bash
cd frontend
npm install
```

### Environment Variables

Create `frontend/.env`:
```env
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
REACT_APP_API_BASE_URL=http://localhost:7071/api
```

### Run Development Server

```bash
npm start
```

The frontend will be available at http://localhost:3000

## Backend Development

```bash
cd backend
dotnet restore
```

### Environment Variables

Update `backend/local.settings.json`:
```json
{
    "IsEncrypted": false,
    "Values": {
        "AzureWebJobsStorage": "UseDevelopmentStorage=true",
        "FUNCTIONS_WORKER_RUNTIME": "dotnet-isolated",
        "SUPABASE_JWT_SECRET": "your_supabase_jwt_secret",
        "GITHUB_TOKEN": "your_github_personal_access_token",
        "GITHUB_REPO": "yourusername/your-repo-name",
        "GITHUB_BRANCH": "main"
    }
}
```

### Run Azure Functions

```bash
func start
```

The API will be available at http://localhost:7071

## Supabase Setup for Development

1. Create a new Supabase project
2. Copy the project URL and anon key
3. Get the JWT secret from Settings > API > JWT Settings

## GitHub Setup for Development

1. Create a test repository for storing articles
2. Generate a Personal Access Token with `repo` permissions
3. Update your local settings

## Testing

### Frontend Tests
```bash
cd frontend
npm test
```

### Backend Tests
```bash
cd backend
dotnet test
```

### Manual Testing

1. Start both frontend and backend servers
2. Open http://localhost:3000
3. Sign up with a test email
4. Try publishing an article
5. Check that the article appears in your GitHub repository

## Development Workflow

### Adding New Features

1. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes
3. Test locally
4. Commit and push:
   ```bash
   git add .
   git commit -m "Add your feature description"
   git push origin feature/your-feature-name
   ```

5. Create a pull request

### Code Style

**Frontend (TypeScript/React):**
- Use functional components with hooks
- Follow React best practices
- Use TypeScript for type safety
- Format with Prettier

**Backend (C#):**
- Follow Microsoft C# conventions
- Use async/await for asynchronous operations
- Implement proper error handling
- Add XML documentation for public methods

## Debugging

### Frontend
- Use browser DevTools
- React Developer Tools extension
- Check Network tab for API calls

### Backend
- Use VS Code debugger
- Attach to Azure Functions process
- Check Azure Functions logs

## Database Schema (Supabase)

While articles are stored as JSON files, Supabase handles authentication:

```sql
-- Users table is automatically created by Supabase Auth
-- No additional tables needed for MVP
```

## API Endpoints

### GET /api/get-articles
Returns list of article metadata

### POST /api/publish-article
Publishes a new article (requires authentication)

**Request Body:**
```json
{
  "title": "Article Title",
  "author": "Author Name",
  "content": "Article content in markdown"
}
```

### GET /api/get-article/{slug}
Returns full article by slug

## File Structure

```
academix/
├── frontend/                 # React application
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API and auth services
│   │   ├── types/          # TypeScript type definitions
│   │   └── utils/          # Utility functions
│   └── public/             # Static assets
├── backend/                 # Azure Functions
│   ├── Functions/          # Function endpoints
│   ├── Models/             # Data models
│   ├── Services/           # Business logic
│   └── Program.cs          # Application entry point
├── articles/               # Article storage (JSON files)
├── .github/workflows/      # GitHub Actions
└── docs/                   # Documentation
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Troubleshooting

### Common Issues

**Frontend:**
- `Module not found`: Run `npm install`
- CORS errors: Check backend CORS configuration
- Auth errors: Verify Supabase configuration

**Backend:**
- Build errors: Run `dotnet restore`
- JWT validation fails: Check JWT secret
- GitHub API errors: Verify token and permissions

**General:**
- Check all environment variables are set
- Ensure both frontend and backend servers are running
- Clear browser cache if needed

### Getting Help

- Check the GitHub Issues
- Review Azure Functions documentation
- Consult Supabase documentation
- Ask questions in the project discussions
