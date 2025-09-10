# Domain Analysis Frontend - Setup Guide

This is the frontend chat interface for the Domain Analysis system.

## Quick Setup for New Repository

### 1. Create New GitHub Repository
1. Create new repository: `domain-analysis-frontend`
2. Clone locally
3. Copy all files from this directory to the new repository

### 2. Set Up Cloud Build Integration

#### Option A: Using Google Cloud Console
1. Go to [Cloud Build Triggers](https://console.cloud.google.com/cloud-build/triggers)
2. Click "Create Trigger"
3. Configure:
   - **Name**: `deploy-frontend`
   - **Event**: Push to a branch
   - **Source**: Connect your GitHub repository
   - **Branch**: `^main$`
   - **Configuration**: Cloud Build configuration file
   - **Location**: `cloudbuild.yaml`

#### Option B: Using gcloud CLI
```bash
gcloud builds triggers create github \
  --repo-name=domain-analysis-frontend \
  --repo-owner=YOUR_GITHUB_USERNAME \
  --branch-pattern=^main$ \
  --build-config=cloudbuild.yaml \
  --description="Deploy frontend on push to main"
```

### 3. Environment Configuration

The frontend is configured to connect to the backend at:
`https://advanced-csv-domain-analysis-456664817971.europe-west1.run.app`

If your backend URL is different, update:
- `next.config.js` (line 8)
- `src/utils/api.ts` (line 3)
- `cloudbuild.yaml` (line 35)

### 4. Deploy

Once the trigger is set up, simply push to the `main` branch:

```bash
git add .
git commit -m "Initial frontend deployment"
git push origin main
```

The Cloud Build trigger will automatically:
1. Build the Docker image
2. Push to Container Registry
3. Deploy to Cloud Run

### 5. Access Your App

After deployment, your frontend will be available at:
`https://domain-analysis-frontend-[hash]-ew.a.run.app`

## Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:3000
```

## Files in This Repository

```
├── src/                     # React components and utilities
│   ├── components/          # Chat interface components
│   ├── pages/              # Next.js pages
│   ├── types/              # TypeScript definitions
│   ├── utils/              # API client and utilities
│   └── styles/             # Global CSS
├── public/                 # Static assets
├── package.json            # Dependencies and scripts
├── next.config.js          # Next.js configuration
├── tailwind.config.js      # Tailwind CSS configuration
├── tsconfig.json           # TypeScript configuration
├── Dockerfile              # Docker build configuration
├── cloudbuild.yaml         # Google Cloud Build configuration
└── .dockerignore          # Docker ignore rules
```

## Support

For issues or questions, check the main repository documentation.