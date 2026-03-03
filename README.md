# CardWiseOffer Frontend

A React + TypeScript application for comparing credit card offers across travel platforms.

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

Set `VITE_API_BASE_URL` in `.env` to override.

## Feature Flags

The app respects feature flags from the backend:
- `authEnabled` - Show/hide login UI
- `offerLockingEnabled` - Lock offers for guests
- `allOffers` - Enable All Offers section
- `savedCards` - Enable Saved Cards feature

## License

MIT
