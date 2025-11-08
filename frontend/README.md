# Fuel EU Compliance Dashboard

A comprehensive React + TypeScript dashboard for managing Fuel EU Maritime Regulation compliance with support for Banking (Article 20) and Pooling (Article 21).

## 🏗️ Architecture

This project follows **Hexagonal Architecture** (Ports & Adapters pattern):

```
src/
├── core/
│   ├── domain/          # Domain entities (Route, Banking, Pooling, Comparison)
│   ├── application/     # Use cases (business logic)
│   └── ports/
│       ├── inbound/     # Interface for UI to call use cases
│       └── outbound/    # Interface for use cases to call infrastructure
├── adapters/
│   ├── ui/              # React components (presentation layer)
│   │   └── components/  # Tab components (Routes, Compare, Banking, Pooling)
│   └── infrastructure/  # API clients (data access layer)
│       └── api/         # REST API implementation
└── shared/              # Shared utilities, components, hooks
```

## 🎯 Features

### 1. Routes Tab
- View all routes with filtering (vessel type, fuel type, year)
- Display GHG intensity, fuel consumption, distance, emissions
- Set baseline routes for comparison
- Interactive data table

### 2. Compare Tab
- Compare baseline vs current route performance
- Target: **89.3368 gCO₂e/MJ** (2% below 91.16)
- Visual charts and percentage difference calculations
- Compliance indicators (✅/❌)

### 3. Banking Tab (Article 20)
- View compliance balance (CB) by year
- Bank positive CB for future use
- Apply banked CB to deficit years
- KPIs: CB before, applied amount, CB after
- Input validation and error handling

### 4. Pooling Tab (Article 21)
- Create pools with multiple vessels
- Real-time validation:
  - Pool sum must be ≥ 0
  - Deficit vessels cannot exit worse
  - Surplus vessels cannot exit negative
- Visual pool configuration with before/after CB display
- Multi-select vessel interface

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn
- Backend API running on `http://localhost:3000`

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Environment Variables

Create a `.env` file:

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

## 🎨 Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Hexagonal Architecture** - Clean architecture pattern

## 📡 API Endpoints

The dashboard connects to these backend endpoints:

```
GET    /routes                    # Get all routes with filters
POST   /routes/:routeId/baseline  # Set route as baseline
GET    /routes/comparison         # Get baseline vs comparison data
GET    /compliance/cb?year=YYYY   # Get compliance balance
POST   /banking/bank              # Bank surplus CB
POST   /banking/apply             # Apply banked CB
GET    /compliance/adjusted-cb    # Get adjusted CB for pooling
POST   /pools                     # Create a pool
```

## 🧩 Key Design Decisions

1. **Hexagonal Architecture**: Separates business logic from UI and infrastructure
2. **Dependency Injection**: Use cases injected into UI components via props
3. **Type Safety**: Full TypeScript coverage for domain entities
4. **Stateless Components**: React functional components with hooks
5. **Single Responsibility**: Each tab handles one feature area
6. **Error Handling**: Comprehensive error states and user feedback

## 📂 Project Structure Details

### Core Layer (Business Logic)
- **Domain**: Pure TypeScript interfaces and types
- **Application**: Use case implementations
- **Ports**: Interfaces defining contracts

### Adapters Layer
- **UI**: React components consuming use cases
- **Infrastructure**: API clients implementing repository interfaces

### Shared Layer
- Reusable UI components (Button, Card, Select, Alert)
- Custom hooks (useAsync)
- Utilities

## 🔧 Configuration Files

- `vite.config.ts` - Vite configuration with API proxy
- `tailwind.config.js` - Tailwind CSS customization
- `tsconfig.json` - TypeScript compiler options
- `postcss.config.js` - PostCSS with Tailwind

## 📊 Component Overview

### Routes Tab
- Filterable table with real-time updates
- Baseline selection functionality
- Comprehensive route metrics display

### Compare Tab
- Side-by-side baseline comparison
- Visual progress bars
- Percentage calculations and compliance status

### Banking Tab
- Two-panel interface (Bank/Apply)
- Real-time CB balance display
- Transaction result visualization

### Pooling Tab
- Multi-vessel selection with checkboxes
- Real-time pool validation
- Before/after CB comparison table

## 🎯 Compliance Rules

### Banking (Article 20)
- Only positive CB can be banked
- Banked CB can be applied to future deficits
- Banking preserves surplus for long-term compliance

### Pooling (Article 21)
- Pool total CB must be non-negative
- Deficit vessels protected from worse outcomes
- Surplus vessels protected from negative exit

## 🧪 Development

```bash
# Run with hot reload
npm run dev

# Type check
npx tsc --noEmit

# Lint code
npm run lint
```

## 📝 License

MIT License - See LICENSE file for details

## 👥 Contributing

1. Follow hexagonal architecture principles
2. Maintain type safety
3. Write descriptive commit messages
4. Test all use cases thoroughly

---

Built with ⚓ for maritime compliance
