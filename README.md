# Scalable Conversion Platform

A platform for converting various digital credits and currencies.

## Setup

1. Clone the repository
2. Install pnpm if you haven't already: `npm install -g pnpm`
3. Install dependencies: `pnpm install`
4. Copy `.env.example` to `.env` and configure your environment variables
5. Run the development server: `pnpm dev`

## API Endpoints

- POST `/api/conversions/convert` - Convert credits
- GET `/api/conversions/rates` - Get current conversion rates

## Features

- Real-time credit conversion
- Secure account management
- Multiple currency support
- Transaction history

## Development

- Run tests: `pnpm test`
- Start development server: `pnpm dev`
- Build for production: `pnpm build`
