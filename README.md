# CardWiseOffer Frontend

A React + TypeScript application for comparing credit card offers across travel platforms.

Lovable contributors must follow [LOVABLE.md](LOVABLE.md).

## Quick Start

```sh
# Install dependencies
npm install

# Start development server (port 8080)
npm run dev

# Build for production
npm run build

# Run tests
npm test
```

## Tech Stack

- **React 18** + TypeScript
- **Vite** for fast development and builds
- **TailwindCSS** for styling
- **shadcn/ui** for UI components
- **Framer Motion** for animations
- **date-fns** for date handling

## Project Structure

```
src/
├── components/     # UI components
├── contexts/       # React contexts (Auth)
├── hooks/          # Custom React hooks
├── pages/          # Page components
├── services/       # API services
├── constants/      # App constants
└── lib/            # Utility functions
```

## Backend Integration

The frontend connects to the FastAPI backend at `http://localhost:8001`.

Set the following in `.env` for backend API mode:

```env
VITE_DATA_SOURCE=api
VITE_API_BASE_URL=https://api.example.com
```

`VITE_DATA_MODE=api` remains a temporary compatibility alias.

## Feature Flags

The app respects feature flags from the backend:
- `authEnabled` - Show/hide login UI
- `offerLockingEnabled` - Lock offers for guests
- `allOffers` - Enable All Offers section
- `savedCards` - Enable Saved Cards feature
- `dailyVisitorsEnabled` - Enable the visitor indicator and stats request

## License

MIT
