# 🚢 Fuel EU Maritime Compliance Dashboard

A full-stack application for managing and monitoring Fuel EU Maritime Regulation compliance, featuring Banking (Article 20) and Pooling (Article 21) capabilities. Built with clean hexagonal architecture for maintainability and scalability.

## 📋 Overview

The Fuel EU Maritime Regulation requires ships to reduce their greenhouse gas (GHG) intensity. This dashboard helps shipping companies:

- **Track vessel routes** with fuel consumption and GHG emissions
- **Calculate Compliance Balance (CB)** using the official Fuel EU formula
- **Bank surplus credits** for future use (Article 20)
- **Create compliance pools** to share credits across vessels (Article 21)
- **Compare routes** against target GHG intensity levels

### Key Compliance Metrics
- **2024 Target**: 89.3368 gCO₂e/MJ (2% below 91.16 baseline)
- **Compliance Balance (CB)**: Measures deviation from target
- **Banking**: Store positive CB for up to 3 years
- **Pooling**: Share CB across vessels with sum ≥ 0

## 🏗️ Architecture

Both frontend and backend follow **Hexagonal Architecture** (Ports & Adapters):

```
project/
├── backend/          # Node.js + Express + PostgreSQL API
│   ├── core/         # Domain entities & business logic
│   ├── adapters/     # HTTP controllers & database repositories
│   ├── infrastructure/ # Server setup & database seed
│   └── prisma/       # Database schema & migrations
│
├── frontend/         # React + TypeScript + Vite dashboard
│   ├── core/         # Domain entities & use cases
│   ├── adapters/     # UI components & API clients
│   └── shared/       # Reusable components & hooks
```

**Benefits:**
- ✅ Clean separation of concerns
- ✅ Easy to test and maintain
- ✅ Independent of frameworks
- ✅ Flexible adapter swapping

## 🎯 Features

### 1. Routes Management
- View all vessel routes with comprehensive details
- Filter by vessel type, fuel type, and year
- Display GHG intensity, fuel consumption, distance, and emissions
- Set baseline routes for performance comparison

### 2. Route Comparison
- Compare baseline vs current route performance
- Visual charts and percentage difference calculations
- Compliance indicators (✅ compliant / ❌ non-compliant)
- Target tracking against 89.3368 gCO₂e/MJ

### 3. Banking System (Article 20)
- View Compliance Balance (CB) by ship and year
- Bank positive CB for future use (valid up to 3 years)
- Apply banked credits to deficit years with FIFO logic
- Real-time KPIs: CB before, applied amount, CB after

### 4. Pooling System (Article 21)
- Create compliance pools with multiple vessels
- Real-time validation:
  - Pool sum must be ≥ 0
  - Deficit vessels cannot exit worse
  - Surplus vessels cannot exit negative
- Visual pool configuration with before/after CB display
- Greedy allocation algorithm for optimal credit distribution

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ and npm
- **PostgreSQL** 14+ (or Docker)
- **Git**

### 1. Clone the Repository
```bash
git clone <repository-url>
cd VD
```

### 2. Start Database
```bash
# Using Docker (recommended)
cd backend
docker-compose up -d

# Database will be available at localhost:5432
```

### 3. Setup Backend
```bash
cd backend

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Update DATABASE_URL if needed (default: postgresql://postgres:password@localhost:5432/fueleu_db)

# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed database with sample data
npm run db:seed

# Start backend server
npm run dev
```

Backend will run at: **http://localhost:3000**

### 4. Setup Frontend
```bash
cd frontend

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Update VITE_API_BASE_URL if needed (default: http://localhost:3000/api)

# Start development server
npm run dev
```

Frontend will run at: **http://localhost:5173**

### 5. Access the Dashboard
Open your browser and navigate to: **http://localhost:5173**

## 📡 API Endpoints

### Routes
- `GET /api/routes` - Get all routes with optional filters
- `POST /api/routes/:routeId/baseline` - Set a route as baseline
- `GET /api/routes/comparison?routeId=X&baselineId=Y` - Compare two routes

### Compliance
- `GET /api/compliance/cb?shipId=X&year=2024` - Get compliance balance
- `GET /api/compliance/adjusted-cb?shipId=X&year=2024` - Get adjusted CB (with banking/pooling)

### Banking
- `POST /api/banking/bank` - Bank surplus credits
- `POST /api/banking/apply` - Apply banked credits to deficit

### Pooling
- `POST /api/pooling/validate` - Validate pool configuration
- `POST /api/pooling/create` - Create a compliance pool

## 🛠️ Technology Stack

### Backend
- **Node.js** + **TypeScript** - Runtime & language
- **Express.js** - Web framework
- **PostgreSQL** - Database
- **Prisma ORM** - Database toolkit
- **Docker** - Containerization

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool & dev server
- **Tailwind CSS** - Utility-first styling

### DevOps
- **Docker Compose** - Multi-container orchestration
- **ESLint** - Code linting
- **Prettier** - Code formatting

## 📊 Database Schema

```prisma
model Route {
  id                String   @id @default(uuid())
  routeId           String   @unique
  vesselType        String
  fuelType          String
  year              Int
  ghgIntensity      Float
  fuelConsumption   Float
  distance          Float
  totalEmissions    Float
  isBaseline        Boolean  @default(false)
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}

model Banking {
  id           String   @id @default(uuid())
  shipId       String
  year         Int
  cbBanked     Float
  expiryYear   Int
  isUsed       Boolean  @default(false)
  createdAt    DateTime @default(now())
}

model Pooling {
  id           String   @id @default(uuid())
  poolId       String   @unique
  year         Int
  vesselIds    String[]
  totalCB      Float
  createdAt    DateTime @default(now())
}

model Compliance {
  id               String   @id @default(uuid())
  shipId           String
  year             Int
  complianceBalance Float
  adjustedCB       Float?
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
  
  @@unique([shipId, year])
}
```

## 🧪 Development Scripts

### Backend
```bash
npm run dev          # Start dev server with hot reload
npm run build        # Build for production
npm start            # Start production server
npm run db:generate  # Generate Prisma client
npm run db:migrate   # Run database migrations
npm run db:seed      # Seed database with sample data
npm run db:studio    # Open Prisma Studio (GUI)
npm test             # Run tests
npm run lint         # Lint code
```

### Frontend
```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Lint code
```

## 📁 Project Structure

### Backend
```
backend/
├── src/
│   ├── core/
│   │   ├── domain/           # Domain entities (Route, Banking, Pooling)
│   │   ├── application/      # Business logic & use cases
│   │   └── ports/            # Interface definitions
│   ├── adapters/
│   │   ├── inbound/http/     # REST API controllers & routes
│   │   └── outbound/postgres/ # Prisma repository implementations
│   ├── infrastructure/
│   │   ├── server/           # Express app & server setup
│   │   └── db/               # Database seed scripts
│   └── shared/               # Shared utilities & calculations
├── prisma/
│   ├── schema.prisma         # Database schema
│   └── migrations/           # Database migrations
└── docker-compose.yml        # Docker services configuration
```

### Frontend
```
frontend/
├── src/
│   ├── core/
│   │   ├── domain/           # Domain entities
│   │   ├── application/      # Use cases (business logic)
│   │   └── ports/            # Inbound/outbound interfaces
│   ├── adapters/
│   │   ├── ui/               # React components & tabs
│   │   └── infrastructure/   # API clients & repositories
│   └── shared/
│       ├── components/       # Reusable UI components
│       └── hooks/            # Custom React hooks
├── index.html                # HTML entry point
└── vite.config.ts            # Vite configuration
```

## 🔒 Environment Variables

### Backend `.env`
```env
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/fueleu_db"

# Server
PORT=3000
NODE_ENV=development

# API
API_VERSION=v1
```

### Frontend `.env`
```env
# API Base URL
VITE_API_BASE_URL=http://localhost:3000/api
```

## 🧮 Compliance Calculations

### GHG Intensity (gCO₂e/MJ)
```
GHG Intensity = Total Emissions (tons CO₂e) / Energy Consumed (MJ)
```

### Compliance Balance (CB)
```
CB = (Target Intensity - Actual Intensity) × Energy Consumed
```

### Banking Logic
- Surplus CB (positive) can be banked for up to 3 years
- Applied using FIFO (First In, First Out) method
- Cannot bank negative CB

### Pooling Logic
- Sum of all vessels' adjusted CB must be ≥ 0
- Deficit vessels cannot end up worse
- Surplus vessels cannot end up negative
- Uses greedy allocation algorithm

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For issues, questions, or contributions:
- Open an issue on GitHub
- Contact the development team
- Check the documentation in `/backend/README.md` and `/frontend/README.md`

## 🎓 Learn More

- [Fuel EU Maritime Regulation](https://ec.europa.eu/transport/modes/maritime/fueleu_maritime_en)
- [Hexagonal Architecture](https://alistair.cockburn.us/hexagonal-architecture/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [React Documentation](https://react.dev)
- [Vite Guide](https://vitejs.dev/guide/)

---

**Built with ❤️ for sustainable maritime shipping**
