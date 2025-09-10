# Academix Deployment Guide

This guide will help you deploy the Academix platform to production.

## Prerequisites

- Node.js 18+
- .NET 8 SDK
- Azure account
- GitHub account
- Supabase account

## 1. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings > API
3. Copy your project URL and anon key
4. Go to Settings > Auth and configure:
   - Enable email authentication
   - Set up email templates (optional)

## 2. GitHub Repository Setup

1. Create a new GitHub repository for your Academix instance
2. Push this code to your repository:
   ```bash
   git init
   git add .
   git commit -m "Initial Academix setup"
   git branch -M main
   git remote add origin https://github.com/yourusername/your-repo.git
   git push -u origin main
   ```
3. Create a Personal Access Token:
   - Go to GitHub Settings > Developer settings > Personal access tokens
   - Generate a token with `repo` permissions
   - Save the token securely

## 3. Frontend Deployment (GitHub Pages)

1. Update `frontend/package.json`:
   ```json
   {
     "homepage": "https://yourusername.github.io/your-repo-name"
   }
   ```

2. Create environment secrets in your GitHub repository:
   - Go to Settings > Secrets and variables > Actions
   - Add these secrets:
     - `REACT_APP_SUPABASE_URL`: Your Supabase project URL
     - `REACT_APP_SUPABASE_ANON_KEY`: Your Supabase anon key
     - `REACT_APP_API_BASE_URL`: Your Azure Functions URL

3. Enable GitHub Pages:
   - Go to Settings > Pages
   - Select "GitHub Actions" as the source

4. The GitHub Action will automatically deploy on pushes to main

## 4. Backend Deployment (Azure Functions)

### Using Azure Portal

1. Create an Azure Function App:
   - Runtime: .NET 8
   - Operating System: Linux or Windows
   - Plan: Consumption (for free tier)

2. Configure Application Settings:
   ```
   SUPABASE_JWT_SECRET=your_supabase_jwt_secret
   GITHUB_TOKEN=your_github_personal_access_token
   GITHUB_REPO=yourusername/your-repo-name
   GITHUB_BRANCH=main
   ```

3. Deploy using Visual Studio Code with Azure Functions extension, or:

### Using Azure CLI

```bash
# Login to Azure
az login

# Create resource group
az group create --name academix-rg --location eastus

# Create storage account
az storage account create --name academixstorage --location eastus --resource-group academix-rg --sku Standard_LRS

# Create function app
az functionapp create --resource-group academix-rg --consumption-plan-location eastus --runtime dotnet-isolated --functions-version 4 --name academix-api --storage-account academixstorage

# Configure app settings
az functionapp config appsettings set --name academix-api --resource-group academix-rg --settings \
  "SUPABASE_JWT_SECRET=your_supabase_jwt_secret" \
  "GITHUB_TOKEN=your_github_personal_access_token" \
  "GITHUB_REPO=yourusername/your-repo-name" \
  "GITHUB_BRANCH=main"

# Deploy
cd backend
func azure functionapp publish academix-api
```

## 5. Configure Frontend API URL

After deploying the backend, update your GitHub repository secrets with the Azure Functions URL:
- `REACT_APP_API_BASE_URL`: `https://your-function-app.azurewebsites.net/api`

## 6. Test the Deployment

1. Visit your GitHub Pages URL
2. Sign up for an account
3. Try publishing an article
4. Verify the article appears in the list and is saved to your repository

## 7. Custom Domain (Optional)

### For Frontend (GitHub Pages)
1. Add a `CNAME` file to `frontend/public/`
2. Configure your domain's DNS to point to GitHub Pages

### For Backend (Azure Functions)
1. Configure a custom domain in Azure Portal
2. Update CORS settings if needed

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure your Azure Functions has proper CORS configuration
2. **JWT Validation Fails**: Verify your Supabase JWT secret is correct
3. **GitHub API Errors**: Check your GitHub token permissions
4. **Build Failures**: Ensure all environment variables are set

### Debug Logs

- Frontend: Check browser console for errors
- Backend: View logs in Azure Portal under Functions > Monitor

## Cost Estimation

- **Supabase**: Free tier includes 50MB database, 500MB storage
- **GitHub**: Free for public repositories
- **GitHub Pages**: Free
- **Azure Functions**: Free tier includes 1M requests/month

Total cost for small usage: **$0/month** 🎉

## Security Considerations

1. Use environment variables for all secrets
2. Regularly rotate GitHub tokens
3. Monitor Supabase auth logs
4. Enable rate limiting if needed
5. Consider adding input validation

## Scaling

As your platform grows:
1. Upgrade Supabase plan for more database capacity
2. Consider Azure Functions Premium plan for better performance
3. Add CDN for static assets
4. Implement caching strategies
5. Add monitoring and alerting
