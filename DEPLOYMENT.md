# Two-Service Deployment Guide

## Overview
This setup creates **two independent Cloud Run services**:

1. **Backend Service** - API for domain analysis
2. **Frontend Service** - Chat UI that calls backend

## Step 1: Backend Service (Already Done!)

Your backend is already deployed and working at:
`https://domain-analysis-backend-456664817971.europe-west1.run.app`

✅ **Keep this exactly as it is!**

## Step 2: Frontend Service (New Repository)

### Create New GitHub Repository
1. Create repository: `domain-analysis-frontend` 
2. Copy all files from this directory to new repo
3. **Don't copy `node_modules/`** - it will be installed during build

### Set Up Cloud Build Trigger
1. Go to [Cloud Build Triggers](https://console.cloud.google.com/cloud-build/triggers)
2. Click **"Create Trigger"**
3. Configure:
   - **Name**: `deploy-frontend`
   - **Event**: Push to a branch  
   - **Source**: Your new frontend repository
   - **Branch**: `^main$`
   - **Configuration**: Cloud Build configuration file
   - **Location**: `cloudbuild.yaml`

### Configure Backend URL
In the Cloud Build trigger, add this **substitution variable**:
- **Variable**: `_BACKEND_URL`  
- **Value**: `https://domain-analysis-backend-456664817971.europe-west1.run.app`

### Deploy
1. Push code to `main` branch
2. Cloud Build automatically deploys
3. Frontend service will be available at new URL

## Final Architecture

```
Backend Service:
https://domain-analysis-backend-456664817971.europe-west1.run.app
├── Repository: your-current-backend-repo
├── Environment: API keys, BigQuery config  
└── Endpoint: /analyze (returns JSON)

Frontend Service:
https://domain-analysis-frontend-xxx.run.app
├── Repository: domain-analysis-frontend (new)
├── Environment: BACKEND_URL points to backend service
└── UI: Chat interface that calls backend
```

## Testing

1. **Backend**: `curl https://domain-analysis-backend-456664817971.europe-west1.run.app/health`
2. **Frontend**: Open the frontend URL in browser
3. **Integration**: Enter email in chat, verify it calls backend

## Benefits

✅ **Independent scaling** - Scale each service separately
✅ **Independent deployment** - Update frontend without touching backend  
✅ **Clear separation** - Each service has single responsibility
✅ **Easy debugging** - Issues isolated per service

Perfect microservices architecture! 🚀