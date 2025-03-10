#!/bin/bash

# Variables
RESOURCE_GROUP="scalable-conversion-platform-rg"
LOCATION="eastus"
COSMOS_ACCOUNT="scalable-conversion-cosmos"
DATABASE_NAME="conversion-platform"
CONTAINER_NAME="conversions"

# Create Resource Group
echo "Creating Resource Group..."
az group create --name $RESOURCE_GROUP --location $LOCATION

# Create Cosmos DB account with MongoDB API
echo "Creating Cosmos DB account..."
az cosmosdb create \
    --name $COSMOS_ACCOUNT \
    --resource-group $RESOURCE_GROUP \
    --kind MongoDB \
    --capabilities EnableMongo \
    --default-consistency-level Session \
    --locations regionName=$LOCATION

# Create MongoDB database
echo "Creating MongoDB database..."
az cosmosdb mongodb database create \
    --account-name $COSMOS_ACCOUNT \
    --resource-group $RESOURCE_GROUP \
    --name $DATABASE_NAME

# Create collections
echo "Creating collections..."
az cosmosdb mongodb collection create \
    --account-name $COSMOS_ACCOUNT \
    --resource-group $RESOURCE_GROUP \
    --database-name $DATABASE_NAME \
    --name conversions \
    --shard id

az cosmosdb mongodb collection create \
    --account-name $COSMOS_ACCOUNT \
    --resource-group $RESOURCE_GROUP \
    --database-name $DATABASE_NAME \
    --name accounts \
    --shard id

# Get connection string
echo "Getting connection string..."
CONNECTION_STRING=$(az cosmosdb keys list \
    --name $COSMOS_ACCOUNT \
    --resource-group $RESOURCE_GROUP \
    --type connection-strings \
    --query "connectionStrings[0].connectionString" \
    --output tsv)

echo "MongoDB Connection String: $CONNECTION_STRING"
echo "Use this connection string in your Azure App Service settings."
