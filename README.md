# Scalable Conversion Platform

A platform for converting various digital credits and cryptocurrencies using blockchain technology and the Tatum.io SDK.

## Overview

The Scalable Conversion Platform provides a robust API for converting between different digital assets, cryptocurrencies, and tokens. It leverages the Tatum.io SDK to access real-time market data and perform secure conversions across multiple blockchains.

## Features

- **Real-time Cryptocurrency Conversion**: Convert between various cryptocurrencies and tokens with up-to-date exchange rates
- **Multi-blockchain Support**: Interact with multiple blockchains including Ethereum, Bitcoin, Binance Smart Chain, and more
- **Secure Account Management**: Create and manage blockchain wallets and accounts securely
- **Transaction History**: Track all conversions and transactions with detailed history
- **Rate Monitoring**: Access real-time and historical exchange rates
- **Tatum.io Integration**: Leverage the powerful Tatum SDK for blockchain operations
- **API Rate Limiting**: Protect against abuse with tiered rate limiting for different endpoints
- **System Monitoring**: Track system health and API performance with detailed metrics
- **Production-Ready Logging**: Comprehensive request logging for both development and production environments

## Prerequisites

- Node.js (v14 or higher)
- pnpm package manager
- MongoDB (local or remote instance)
- Tatum.io API key (sign up at [tatum.io](https://tatum.io))

## Setup

1. Clone the repository
   ```bash
   git clone https://github.com/Defi-Oracle-Tooling/Scalable-Conversion-Platform.git
   cd Scalable-Conversion-Platform
   ```

2. Install pnpm if you haven't already
   ```bash
   npm install -g pnpm
   ```

3. Install dependencies
   ```bash
   pnpm install
   ```

4. Configure environment variables
   ```bash
   cp .env.example .env
   ```
   Edit the `.env` file and add your Tatum API key and other required variables:
   ```
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/conversion-platform
   JWT_SECRET=your-secret-key
   API_KEY=your-api-key
   TATUM_API_KEY=your-tatum-api-key
   ```

5. Run the development server
   ```bash
   pnpm dev
   ```

## API Endpoints

### Conversions

- **POST** `/api/conversions/convert`
  - Convert between cryptocurrencies
  - Request body:
    ```json
    {
      "fromCurrency": "BTC",
      "toCurrency": "ETH",
      "amount": "0.5"
    }
    ```
  - Rate limited to 10 requests per 5 minutes

- **GET** `/api/conversions/rates`
  - Get current conversion rates
  - Query parameters:
    - `from`: Source currency (e.g., BTC)
    - `to`: Target currency (e.g., ETH)
  - Rate limited to 10 requests per 5 minutes

- **GET** `/api/conversions/history`
  - Get conversion history
  - Returns the most recent 50 conversions
  - Rate limited to 10 requests per 5 minutes

### Accounts

- **POST** `/api/accounts/create`
  - Create a new blockchain wallet
  - Request body:
    ```json
    {
      "blockchain": "ethereum"
    }
    ```

- **GET** `/api/accounts/:id`
  - Get account details by ID

- **GET** `/api/accounts`
  - Get all accounts

### System Monitoring

- **GET** `/health`
  - Get system health metrics
  - Returns CPU, memory, and OS information
  - No authentication required

- **GET** `/metrics` (Non-production environments only)
  - Get detailed system metrics
  - Returns additional metrics including Node.js version and process uptime
  - Only available in development and test environments

## Development

- Start development server: `pnpm dev`
- Run tests: `pnpm test`
- Build for production: `pnpm build`
- Lint code: `pnpm lint`

## Monitoring and Rate Limiting

The platform includes comprehensive monitoring and rate limiting features:

### Rate Limiting

- **Global Rate Limiting**: 100 requests per 15 minutes per IP address
- **API Rate Limiting**: 50 requests per 15 minutes per IP address for all API endpoints
- **Conversion Rate Limiting**: 10 requests per 5 minutes per IP address for conversion-related endpoints

When a rate limit is exceeded, the API responds with a 429 status code and a JSON response:

```json
{
  "success": false,
  "error": "Too many requests, please try again later."
}
```

Rate limiting can be configured in the `src/middleware/rateLimiter.js` file to adjust window sizes and request limits based on your specific requirements.

### Monitoring

- **System Health**: Access real-time system health metrics via the `/health` endpoint
- **Detailed Metrics**: Access detailed metrics via the `/metrics` endpoint (non-production environments only)
- **Request Logging**: All API requests are logged with detailed information including:
  - Request duration
  - HTTP method and URL
  - Status code
  - User agent and IP
  - System metrics at the time of the request

Example health endpoint response:

```json
{
  "status": "ok",
  "uptime": 3600,
  "timestamp": "2025-03-10T18:30:00Z",
  "cpu": {
    "loadAvg": [0.5, 0.3, 0.2],
    "cores": 4
  },
  "memory": {
    "total": 8589934592,
    "free": 4294967296,
    "used": 4294967296,
    "usagePercentage": 50
  },
  "os": {
    "platform": "linux",
    "release": "5.4.0"
  }
}
```

### Production Logging

In production environments, request logs are stored in the `logs` directory with the following format:
```
logs/api-metrics-YYYY-MM-DD.log
```

The logging configuration can be customized in the `src/config/monitoring-config.js` file, allowing you to adjust:

- Log file size and rotation
- Log content detail level
- Metrics collection interval
- System metrics to collect

## Docker Support

The platform includes Docker support for easy deployment:

```bash
# Build and start containers
pnpm docker:up

# Build containers only
pnpm docker:build

# Stop containers
pnpm docker:down
```

## Azure Deployment

This project can be deployed to Azure using GitHub Actions. Follow these steps to set up the deployment:

### Prerequisites

- Azure account with an active subscription
- GitHub account with access to this repository
- Azure CLI installed locally

### Setup Azure Resources

1. Run the Azure Cosmos DB setup script:
   ```bash
   ./scripts/setup-azure-cosmos.sh
   ```

2. Run the Azure App Service setup script:
   ```bash
   ./scripts/setup-azure-app-service.sh
   ```

3. Add the publish profile as a GitHub secret:
   - Copy the contents of `publish_profile.xml`
   - Go to your GitHub repository
   - Navigate to Settings > Secrets and variables > Actions
   - Create a new repository secret with the name `AZURE_WEBAPP_PUBLISH_PROFILE`
   - Paste the contents of the publish profile

4. Configure environment variables in Azure App Service:
   - Go to the Azure Portal
   - Navigate to your App Service
   - Go to Settings > Configuration
   - Add the following application settings:
     - `MONGODB_URI`: Your Cosmos DB connection string
     - `JWT_SECRET`: Your JWT secret
     - `API_KEY`: Your API key
     - `TATUM_API_KEY`: Your Tatum API key

### Deployment

The application will be automatically deployed to Azure when changes are pushed to the `main` branch. You can also manually trigger the deployment from the GitHub Actions tab.

## Tatum.io SDK Integration

This platform uses the Tatum.io JavaScript SDK for blockchain operations. The SDK provides:

- Wallet management across multiple blockchains
- Transaction creation and signing
- Real-time exchange rate data
- NFT and token management
- And much more

For more information about the Tatum SDK, visit [tatum.io/sdk](https://tatum.io/sdk).

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.
