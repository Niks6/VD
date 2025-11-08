# 🚀 Setup Instructions for Fuel EU Compliance Dashboard

## ✅ What's Already Done

### Frontend (Completed ✨)
- ✅ React + TypeScript + Vite + Tailwind CSS
- ✅ Hexagonal architecture with 4 layers
- ✅ 4 functional tabs: Routes, Compare, Banking, Pooling
- ✅ Running at http://localhost:5173

### Backend (Completed ✨)
- ✅ Node.js + TypeScript + Express + Prisma
- ✅ Hexagonal architecture mirroring frontend
- ✅ All business logic implemented (CB formula, Banking FIFO, Pooling greedy algorithm)
- ✅ 5 database tables with complete schema
- ✅ REST API with 12 endpoints
- ✅ Dependencies installed
- ✅ Seed data ready with 5 routes

## 🔧 Next Steps - Start the Backend

### Option 1: Using Docker (Recommended)

#### 1. Install Docker Desktop
- Download from: https://www.docker.com/products/docker-desktop/
- Install and start Docker Desktop
- Wait for Docker to be running (check system tray icon)

#### 2. Start PostgreSQL
```powershell
cd c:\Users\lenovo\Desktop\VD\backend
docker run -d --name fueleu_postgres -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=fueleu_db -p 5432:5432 postgres:16-alpine
```

Or use Docker Compose:
```powershell
docker-compose up -d
```

#### 3. Run Migrations & Seed
```powershell
npm run db:migrate
npm run db:seed
```

#### 4. Start Backend Server
```powershell
npm run dev
```

### Option 2: Using Local PostgreSQL

#### 1. Install PostgreSQL
- Download from: https://www.postgresql.org/download/windows/
- Install with default settings
- Remember your postgres password

#### 2. Create Database
```powershell
# Open PowerShell and run:
psql -U postgres -c "CREATE DATABASE fueleu_db;"
```

#### 3. Update .env (if password differs)
```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/fueleu_db?schema=public"
```

#### 4. Run Migrations & Seed
```powershell
cd c:\Users\lenovo\Desktop\VD\backend
npm run db:migrate
npm run db:seed
```

#### 5. Start Backend Server
```powershell
npm run dev
```

## 🎯 Verify Everything Works

### 1. Check Backend is Running
- Open: http://localhost:3000/health
- Should show: `{"status":"ok","timestamp":"..."}`

### 2. Test API Endpoints
```powershell
# Get all routes
curl http://localhost:3000/api/routes

# Get compliance balance for ROUTE-001
curl http://localhost:3000/api/compliance/cb?shipId=ROUTE-001&year=2024
```

### 3. Connect Frontend to Backend
- Frontend is already configured to use backend at `http://localhost:3000/api`
- Refresh frontend at http://localhost:5173
- Click through the 4 tabs - they should now load real data!

## 📊 What Each Tab Does

### Routes Tab
- View all 5 vessel routes with fuel consumption and GHG intensity
- Set baseline route for comparisons
- See total emissions and distance

### Compare Tab
- Compare any route against the baseline
- See percentage differences in fuel, emissions, and GHG intensity
- Visual indicators for better/worse performance

### Banking Tab
- Bank surplus compliance credits from ships that overperform
- Apply banked credits to ships with deficits
- FIFO logic: oldest credits used first
- See available balance

### Pooling Tab
- Create compliance pools with multiple ships
- Greedy algorithm allocates credits optimally
- Validates pool feasibility before creation
- Shows surplus/deficit for each member

## 🧮 Business Logic Implemented

### Fuel EU Formula
```
Target GHG Intensity = 89.3368 gCO₂e/MJ
Energy (MJ) = Fuel Consumption (t) × 41,000 MJ/t
Compliance Balance (gCO₂eq) = (Target - Actual) × Energy

If CB > 0: Surplus (ship performed better than target)
If CB < 0: Deficit (ship needs credits)
```

### Banking Rules
- Surplus credits can be banked for future years
- When applying: FIFO (First In, First Out)
- Oldest credits are used first
- Tracks timestamp for each bank entry

### Pooling Rules
- Greedy allocation algorithm
- Distributes surplus from best performers to ships with deficits
- Validates that total pool CB ≥ 0
- Creates pool only if feasible

## 📁 Project Structure

```
VD/
├── frontend/                 # React Dashboard (RUNNING ✅)
│   ├── src/
│   │   ├── core/            # Domain, Application, Ports
│   │   ├── adapters/        # UI Components, API Clients
│   │   └── shared/          # Reusable components
│   └── package.json
│
└── backend/                  # Express API (READY TO START 🔜)
    ├── src/
    │   ├── core/
    │   │   ├── domain/      # Route, Compliance, Banking, Pool entities
    │   │   ├── application/ # 4 Service classes with business logic
    │   │   └── ports/       # Interface definitions
    │   ├── adapters/
    │   │   ├── inbound/     # HTTP Controllers + Routes
    │   │   └── outbound/    # Prisma Repositories
    │   ├── infrastructure/
    │   │   ├── server/      # Express app + DI container
    │   │   └── db/          # Seed data
    │   └── shared/          # Constants & calculations
    ├── prisma/
    │   └── schema.prisma    # 5 tables: routes, ship_compliance, bank_entries, pools, pool_members
    ├── .env                 # Database connection
    └── package.json
```

## 🐛 Troubleshooting

### Frontend shows "Loading..." forever
- Backend is not running yet
- Check backend console for errors
- Verify http://localhost:3000/health returns OK

### Database connection error (P1001)
- PostgreSQL not running
- Wrong password in .env
- Port 5432 already in use

### "Cannot find module" errors
- Run `npm install` in backend directory
- Make sure you're in the correct folder

### Docker not starting
- Docker Desktop needs to be installed and running
- Check system tray for Docker icon
- Try restarting Docker Desktop

## 📚 Useful Commands

### Backend
```powershell
cd c:\Users\lenovo\Desktop\VD\backend

npm run dev              # Start development server
npm run db:studio        # Open Prisma Studio (database GUI)
npm run db:seed          # Re-seed data
npm test                 # Run tests
npm run build            # Build for production
```

### Frontend
```powershell
cd c:\Users\lenovo\Desktop\VD

npm run dev              # Start frontend (already running)
npm run build            # Build for production
```

## 🎉 You're All Set!

Once PostgreSQL is running and you've completed the steps above, you'll have:
- ✅ Frontend Dashboard with 4 interactive tabs
- ✅ Backend API with 12 REST endpoints
- ✅ PostgreSQL database with 5 sample routes
- ✅ Full Fuel EU compliance calculations working
- ✅ Banking and Pooling features operational

Enjoy your Fuel EU Compliance Dashboard! 🚢⚡
