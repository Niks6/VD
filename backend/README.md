c# Fuel EU Compliance Dashboard - Backend API

Backend API for the Fuel EU Compliance Dashboard, built with Node.js, TypeScript, Express, and PostgreSQL using hexagonal architecture.

## 📋 Features

- **Routes Management**: Track vessel routes with fuel consumption and GHG intensity
- **Compliance Calculation**: Compute Compliance Balance (CB) using Fuel EU formula
- **Banking System**: Bank surplus credits and apply them with FIFO logic
- **Pooling System**: Create and validate compliance pools with greedy allocation

## 🏗️ Architecture

Hexagonal Architecture (Ports & Adapters):
```
backend/
├── src/
│   ├── core/
│   │   ├── domain/          # Domain entities
│   │   ├── application/     # Use cases & business logic
│   │   └── ports/           # Interface definitions
│   ├── adapters/
│   │   ├── inbound/         # HTTP controllers
│   │   └── outbound/        # Prisma repositories
│   ├── infrastructure/
│   │   ├── server/          # Express app setup
│   │   └── db/              # Database seed
│   └── shared/              # Constants & utilities
├── prisma/
│   └── schema.prisma        # Database schema
└── tests/                   # Unit & integration tests
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL 14+ (or Docker)

### 1. Start Database
```bash
# Using Docker Compose (recommended)
docker-compose up -d

# Or install PostgreSQL locally and ensure it's running
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment
```bash
# Copy environment template
cp .env.example .env

# Update DATABASE_URL in .env if needed
# Default: postgresql://postgres:password@localhost:5432/fueleu_db
```

### 4. Setup Database
```bash
# Generate Prisma Client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed initial data (5 routes with compliance data)
npm run db:seed
```

### 5. Start Server
```bash
# Development mode with hot reload
npm run dev

# Production build
npm run build
npm start
```

Server will start at: **http://localhost:3000**

## 📡 API Endpoints

### Routes
- `GET /api/routes` - Get all routes
- `POST /api/routes/:routeId/baseline` - Set baseline route
- `GET /api/routes/comparison?routeId=X&baselineId=Y` - Compare routes

### Compliance
- `GET /api/compliance/cb?shipId=X&year=2024` - Get compliance balance
- `GET /api/compliance/adjusted-cb?shipId=X&year=2024` - Get adjusted CB (with banking/pooling)

### Banking
- `POST /api/banking/bank` - Bank surplus credits
  ```json
  { "shipId": "ROUTE-001", "year": 2024, "cbSurplus": 5000 }
  ```
- `POST /api/banking/apply` - Apply banked credits
  ```json
  { "shipId": "ROUTE-002", "year": 2024, "cbDeficit": 3000 }
  ```
- `GET /api/banking/balance?shipId=X` - Get available banked balance

### Pooling
- `POST /api/pools` - Create compliance pool
  ```json
  {
    "poolName": "EU Fleet Pool",
    "year": 2024,
    "memberShipIds": ["ROUTE-001", "ROUTE-002"]
  }
  ```
- `POST /api/pools/validate` - Validate pool allocation
  ```json
  {
    "poolName": "Test Pool",
    "year": 2024,
    "memberShipIds": ["ROUTE-003", "ROUTE-004"]
  }
  ```

### Health Check
- `GET /health` - Server health status

## 🧮 Business Logic

### Fuel EU Formula
```
Target GHG Intensity = 89.3368 gCO₂e/MJ
Energy (MJ) = Fuel Consumption (t) × 41,000 MJ/t
Compliance Balance (gCO₂eq) = (Target - Actual) × Energy
```

### Banking Rules
- Surplus can be banked for future use
- FIFO: Oldest credits applied first
- Max borrowing limit applies

### Pooling Rules
- Greedy algorithm for credit allocation
- Validates feasibility before creation
- Surplus ships subsidize deficit ships

## 🧪 Testing

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

## 📦 Database Management

```bash
# Open Prisma Studio (GUI)
npm run db:studio

# Create new migration
npm run db:migrate

# Reset database
npx prisma migrate reset
```

## 🔧 Development

```bash
# Lint code
npm run lint

# Format code
npm run format

# View database schema
npx prisma studio
```

## 📊 Database Schema

**Tables:**
- `routes` - Vessel route data with fuel & emissions
- `ship_compliance` - Calculated compliance balance per ship/year
- `bank_entries` - Banked credits with timestamps
- `pools` - Compliance pooling groups
- `pool_members` - Ships within each pool

## 🌐 Environment Variables

```env
DATABASE_URL=postgresql://user:pass@localhost:5432/db
PORT=3000
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:5173
```

## 🐳 Docker Setup

```bash
# Start PostgreSQL container
docker-compose up -d

# Stop database
docker-compose down

# View logs
docker-compose logs -f
```

## 🔗 Integration with Frontend

Frontend expects backend at `http://localhost:3000/api`.

Update frontend's `ApiClient.ts` if backend URL changes:
```typescript
const BASE_URL = 'http://localhost:3000/api';
```

## 📝 License

MIT
