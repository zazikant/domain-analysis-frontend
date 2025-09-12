#!/bin/bash

# Next.js Frontend - Cloud Run Deployment Script

set -e

# Configuration
PROJECT_ID="${GCP_PROJECT_ID:-feisty-outrider-471302-k6}"
SERVICE_NAME="domain-analysis-frontend"
REGION="europe-west1"
IMAGE_NAME="gcr.io/$PROJECT_ID/$SERVICE_NAME"
BACKEND_URL="https://domain-analysis-backend-456664817971.europe-west1.run.app"

echo "🚀 Starting deployment of Domain Analysis Frontend..."
echo "📋 Configuration:"
echo "   Project ID: $PROJECT_ID"
echo "   Service: $SERVICE_NAME"
echo "   Region: $REGION"
echo "   Image: $IMAGE_NAME"
echo "   Backend URL: $BACKEND_URL"

# Set the active project
echo "🔧 Setting GCP project..."
gcloud config set project $PROJECT_ID

# Enable required APIs
echo "🔧 Enabling required APIs..."
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com

# Build the Docker image
echo "🏗️  Building Next.js Docker image..."
docker build -t $IMAGE_NAME .

# Push the image to Google Container Registry
echo "📦 Pushing image to GCR..."
docker push $IMAGE_NAME

# Deploy to Cloud Run
echo "🚀 Deploying to Cloud Run..."
gcloud run deploy $SERVICE_NAME \
    --image $IMAGE_NAME \
    --platform managed \
    --region $REGION \
    --allow-unauthenticated \
    --memory 512Mi \
    --cpu 0.5 \
    --timeout 300 \
    --max-instances 5 \
    --min-instances 0 \
    --concurrency 1000 \
    --port 3000 \
    --set-env-vars "NEXT_PUBLIC_API_URL=$BACKEND_URL"

# Get the service URL
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --platform managed --region $REGION --format 'value(status.url)')

echo ""
echo "🎉 Frontend deployment successful!"
echo "🌐 Frontend URL: $SERVICE_URL"
echo "🔗 Backend URL: $BACKEND_URL"
echo ""
echo "💡 Test the application:"
echo "   Open: $SERVICE_URL"
echo ""
echo "🔍 View logs:"
echo "   gcloud logs tail $SERVICE_NAME --project=$PROJECT_ID"