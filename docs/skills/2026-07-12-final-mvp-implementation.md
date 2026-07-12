# Final MVP implementation

The MVP uses `VITE_DATA_SOURCE=local|api` behind a repository boundary. Production
offer ownership belongs to `cwo_backend/data/source/offers.csv`; the frontend local
snapshot is generated from the backend distribution. Demo authentication was removed.
Five product feature flags control phase-two placeholders, public catalogue visibility,
coupon exposure, analytics and optional booking-amount comparison.

The backend remains the calculation authority. Local calculations exist only in the
local repository domain and are verified against API scenarios. Generated synthetic
fixtures are visibly classified test data and production snapshot builds reject them.
