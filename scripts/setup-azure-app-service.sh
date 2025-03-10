#!/bin/bash

# Variables
RESOURCE_GROUP="scalable-conversion-platform-rg"
LOCATION="eastus"
APP_SERVICE_PLAN="scalable-conversion-plan"
WEB_APP_NAME="scalable-conversion-platform"

# Create App Service Plan
echo "Creating App Service Plan..."
az appservice plan create \
    --name $APP_SERVICE_PLAN \
    --resource-group $RESOURCE_GROUP \
    --location $LOCATION \
    --sku B1 \
    --is-linux

# Create Web App
echo "Creating Web App..."
az webapp create \
    --name $WEB_APP_NAME \
    --resource-group $RESOURCE_GROUP \
    --plan $APP_SERVICE_PLAN \
    --runtime "NODE|20-lts"

# Configure Web App settings
echo "Configuring Web App settings..."
az webapp config appsettings set \
    --name $WEB_APP_NAME \
    --resource-group $RESOURCE_GROUP \
    --settings \
    NODE_ENV="production" \
    PORT="8080" \
    WEBSITES_PORT="8080"

# Get publish profile
echo "Getting publish profile..."
az webapp deployment list-publishing-profiles \
    --name $WEB_APP_NAME \
    --resource-group $RESOURCE_GROUP \
    --xml > publish_profile.xml

echo "Publish profile saved to publish_profile.xml"
echo "Add this as a secret in your GitHub repository with the name AZURE_WEBAPP_PUBLISH_PROFILE"
