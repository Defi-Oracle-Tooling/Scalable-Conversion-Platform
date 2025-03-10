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

- **GET** `/api/conversions/rates`
  - Get current conversion rates
  - Query parameters:
    - `from`: Source currency (e.g., BTC)
    - `to`: Target currency (e.g., ETH)

### Accounts (Coming Soon)

- **POST** `/api/accounts/create`
  - Create a new blockchain wallet
- **GET** `/api/accounts/:id`
  - Get account details

## Development

- Start development server: `pnpm dev`
- Run tests: `pnpm test`
- Build for production: `pnpm build`
- Lint code: `pnpm lint`

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
