# AlphaDesk

Professional Trading Intelligence Platform for NSE stock analysis, screening, swing trading, positional trading, and algorithmic trading.

## Tech Stack

### Frontend
- React 18 + Vite + TypeScript
- TanStack Query for data fetching
- Zustand for state management
- Tailwind CSS + shadcn/ui
- React Router
- Socket.IO client

### Backend
- Node.js + Express + TypeScript
- MongoDB + Mongoose
- Redis
- Socket.IO
- JWT authentication

## Project Structure

```
alphadesk/
├── apps/
│   ├── frontend/     # React + Vite application
│   └── backend/      # Express API server
├── packages/
│   ├── shared-types/ # Shared TypeScript types
│   └── shared-utils/ # Shared utilities
└── package.json      # Workspace root
```

## Getting Started

### Prerequisites
- Node.js >= 18.0.0
- MongoDB (local or cloud)
- Redis (local or cloud)

### Installation

```bash
npm install
```

### Environment Setup

Configure environment variables:

**Frontend** (`apps/frontend/.env.development`):
```
VITE_API_BASE_URL=http://localhost:3001/api
VITE_WS_URL=ws://localhost:3001
VITE_APP_NAME=AlphaDesk
VITE_APP_ENV=development
```

**Backend** (`apps/backend/.env.development`):
```
NODE_ENV=development
PORT=3001

MONGODB_URI=mongodb://localhost:27017/alphadesk
REDIS_URL=redis://localhost:6379

JWT_ACCESS_SECRET=your-access-secret
JWT_REFRESH_SECRET=your-refresh-secret

JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

CORS_ORIGIN=http://localhost:5173

LOG_LEVEL=debug
```

### Development

Run both frontend and backend:
```bash
npm run dev
```

Or run individually:
```bash
npm run dev:frontend
npm run dev:backend
```

### Build

```bash
npm run build
```

## Features

- Market overview and NSE stock explorer
- Advanced charting with technical indicators
- Stock screener and swing scanner
- Watchlists and trade setups
- Portfolio management and analytics
- Strategy builder and backtesting
- Paper trading
- Real-time alerts
- AI-assisted analysis

## License

MIT
