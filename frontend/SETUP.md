# 🚀 Quick Start Guide

## Prerequisites
- Node.js 18 or higher
- npm or yarn package manager
- Backend API running on port 3000

## Step-by-Step Setup

### 1. Install Dependencies

```powershell
npm install
```

This will install:
- React 18 & React DOM
- TypeScript
- Vite (build tool)
- Tailwind CSS
- All dev dependencies

### 2. Configure Environment

Create a `.env` file in the root directory:

```powershell
Copy-Item .env.example .env
```

Or manually create `.env`:
```
VITE_API_BASE_URL=http://localhost:3000/api
```

### 3. Start Development Server

```powershell
npm run dev
```

The app will be available at: **http://localhost:5173**

### 4. Access the Dashboard

Open your browser and navigate to:
```
http://localhost:5173
```

You should see the Fuel EU Compliance Dashboard with four tabs:
- **Routes** 🚢
- **Compare** 📊
- **Banking** 🏦
- **Pooling** 🤝

## 📡 Backend API Requirements

Ensure your backend API is running and provides these endpoints:

### Routes
- `GET /routes` - List all routes (with optional filters)
- `POST /routes/:routeId/baseline` - Set route as baseline
- `GET /routes/comparison` - Get comparison data

### Banking
- `GET /compliance/cb?year=YYYY` - Get compliance balance
- `POST /banking/bank` - Bank surplus CB
  ```json
  { "year": 2024, "amount": 100.5 }
  ```
- `POST /banking/apply` - Apply banked CB
  ```json
  { "deficitYear": 2024, "amount": 50.25 }
  ```

### Pooling
- `GET /compliance/adjusted-cb?year=YYYY` - Get adjusted CB
- `POST /pools` - Create a pool
  ```json
  { "year": 2024, "vessels": ["VESSEL-001", "VESSEL-002"] }
  ```

## 🧪 Testing the Features

### Routes Tab
1. Use filters to narrow down routes
2. Click "Set Baseline" on any route
3. Observe the baseline indicator

### Compare Tab
1. Ensure baseline is set (from Routes tab)
2. View comparison metrics
3. Check compliance status against target (89.3368 gCO₂e/MJ)

### Banking Tab
1. Select a year
2. If CB > 0, try banking surplus
3. Try applying banked CB to a deficit year

### Pooling Tab
1. Select a year
2. Choose 2+ vessels using checkboxes
3. Click "Validate Pool" to check rules
4. If valid, click "Create Pool"

## 🛠️ Development Commands

```powershell
# Start dev server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint

# Type check without emitting
npx tsc --noEmit
```

## 📁 Project Structure

```
src/
├── core/
│   ├── domain/              # Business entities
│   ├── application/         # Use cases
│   └── ports/              # Interfaces
├── adapters/
│   ├── ui/                 # React components
│   │   ├── components/     # Tab components
│   │   └── App.tsx        # Main app
│   └── infrastructure/     # API clients
│       └── api/
└── shared/
    ├── components/         # Reusable UI
    └── hooks/             # Custom hooks
```

## 🎨 Styling

This project uses **Tailwind CSS** with custom configuration:
- Responsive design (mobile-first)
- Consistent color scheme
- Accessibility-friendly components

## 🔧 Troubleshooting

### Port already in use
```powershell
# Change port in vite.config.ts or
npm run dev -- --port 3001
```

### API connection errors
1. Check backend is running on port 3000
2. Verify `.env` has correct `VITE_API_BASE_URL`
3. Check browser console for CORS issues

### TypeScript errors
```powershell
# Reinstall dependencies
Remove-Item node_modules -Recurse -Force
Remove-Item package-lock.json
npm install
```

### Tailwind not working
```powershell
# Ensure PostCSS is configured
npm install -D tailwindcss postcss autoprefixer
```

## 📚 Architecture Overview

### Hexagonal Architecture Benefits
1. **Testability** - Business logic isolated from UI/API
2. **Maintainability** - Clear separation of concerns
3. **Flexibility** - Easy to swap implementations
4. **Scalability** - Add features without touching core logic

### Data Flow
```
UI Component → Use Case → Repository → API
     ↓            ↓            ↓         ↓
  (Adapter)   (Core)     (Adapter)   (External)
```

## 🎯 Key Features Checklist

- [x] Routes table with filters
- [x] Baseline route selection
- [x] Comparison with target (89.3368 gCO₂e/MJ)
- [x] Banking surplus CB (Article 20)
- [x] Apply banked CB to deficits
- [x] Pooling validation (Article 21)
- [x] Pool creation with rules enforcement
- [x] Real-time compliance status
- [x] Responsive design
- [x] Error handling & user feedback

## 🔐 Security Notes

- No authentication implemented (add as needed)
- API calls are proxied through Vite dev server
- Use environment variables for sensitive config
- Validate all user inputs on backend

## 📱 Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🚀 Deployment

### Build for production:
```powershell
npm run build
```

Output: `dist/` folder

### Deploy to:
- **Vercel**: `vercel deploy`
- **Netlify**: Drag & drop `dist/` folder
- **Static hosting**: Upload `dist/` contents

### Environment variables for production:
Set `VITE_API_BASE_URL` to your production API URL

---

## 💡 Tips

1. **Use React DevTools** for debugging component state
2. **Check Network tab** to inspect API calls
3. **Read console logs** for detailed error messages
4. **Validate backend** responses match expected types
5. **Test with different data** to ensure robustness

## 📞 Support

For issues or questions:
1. Check `README.md` for detailed documentation
2. Review backend API requirements
3. Inspect browser console for errors
4. Verify environment configuration

Happy coding! ⚓
