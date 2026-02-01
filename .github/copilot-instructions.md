# TraceTrash - AI Agent Instructions

## Project Overview
Real-time garbage truck tracking system for Mexican municipalities. Multi-role React Native app (resident/driver) with Firebase backend, GPS tracking, and route optimization.

**⚠️ Important:** This is the **mobile app repository** (users + drivers). The admin panel is in a separate Next.js project at `c:\Users\kenne\Visual Studio Code\admin-trace`.

## Repository Structure

This project is part of a **3-repository architecture**:

1. **TraceTrash (This repo)** - Mobile app (React Native/Expo)
   - Residents: Track garbage trucks
   - Drivers: GPS tracking + route control
   
2. **admin-trace** - Admin panel (Next.js)
   - Dashboard with metrics
   - Driver management
   - Route management
   
3. **Trace (Landing)** - Marketing site (GitHub Pages)
   - Static HTML/CSS/JS
   - Hosted on `docs` branch

## Architecture & Patterns

### Service Layer Architecture
Firebase services are **modular** - each service handles one domain:
- `services/firebase/auth-service.ts` → Login, registration, session
- `services/firebase/user-service.ts` → User CRUD operations
- `services/firebase/ruta-service.ts` → Route management
- `services/firebase/incidencia-service.ts` → Incident reports
- `services/firebase/ubicacion-service.ts` → Real-time location tracking

**Pattern**: Always use specific service imports in new code:
```typescript
// ✅ Preferred
import { authService } from "@/services/firebase/auth-service";
await authService.login(email, password);

// ⚠️ Legacy (for existing code only)
import { firebaseService } from "@/services/firebase";
await firebaseService.login(email, password);
```

### Role-Based UI Structure
File-based routing via Expo Router with role separation:
- `app/(tabs)/index.tsx` → Resident home (truck tracking map)
- `app/(tabs)/conductor-index.tsx` → Driver home (route control)
- `app/(tabs)/reportar.tsx` → Report incidents (both roles)
- `app/(tabs)/reportes.tsx` → Incident history (both roles)
- `app/(tabs)/ajustes.tsx` → Settings (both roles)

**Note:** Admin features (`conductores.tsx`) are present but **deprecated** - admin panel is now a separate Next.js app.

**Pattern**: Check `user.rol` from `useAuthContext()` to conditionally render features.

### State Management
- **Global**: Context-based (`auth-context.tsx`, `theme-context.tsx`)
- **Local**: React hooks with Firestore real-time subscriptions
- **Session**: Secure storage via `expo-secure-store` (mobile) or AsyncStorage fallback (web)

### Data Types
All Firebase interfaces are centralized in `services/firebase/types.ts`:
- `UserData` → uid, email, nombre, rol, rutaId, location coords
- `RutaData` → route info with coordenadas array, polyline, estado
- `UbicacionData` → real-time GPS tracking snapshot
- `IncidenciaData` → incident reports with images, estado, prioridad

## Critical Development Patterns

### Security Constraints (READ THIS)
1. **Never** store passwords in Firestore - authentication is Firebase Auth only
2. **GPS coordinates** must be within Mexico bounds: `lat: 14.5-32.7, lon: -118.4 - -86.7`
3. **User roles** cannot be self-modified - only admins can change roles
4. **Input sanitization** is mandatory - use `utils/input-sanitizer.ts` and `utils/input-validator.ts`

Example validation pattern:
```typescript
import { validateEmail, validatePassword } from "@/utils/input-validator";
import { sanitizeInput } from "@/utils/input-sanitizer";

const nombre = sanitizeInput(rawNombre); // Strip malicious content
const { valid, error } = validateEmail(email); // Validate format
if (!valid) throw new Error(error);
```

### Real-Time Subscriptions
Use Firestore `onSnapshot` for live updates - see `ubicacion-service.ts`:
```typescript
// Driver location tracking
const unsubscribe = ubicacionService.subscribeToUbicacionConductor(
  conductorId,
  (ubicacion) => setUbicacionCamion(ubicacion)
);
return () => unsubscribe(); // Cleanup in useEffect
```

### Map Components
- Mobile: `react-native-maps` (MapView + Marker + Polyline)
- Web: Would use `react-leaflet` (not implemented in current codebase)
- Shared utilities in `utils/map-utils.ts`: distance calculation, center coords, zoom levels

### Theming System
Dark/light mode via `theme-context.tsx` with consolidated hook:
```typescript
// ✅ ALWAYS use this pattern (hook with memoization)
import { useModernStyles } from "@/hooks/use-modern-styles";
const { isDarkMode, styles, theme } = useModernStyles();

// ❌ NEVER do this (old repetitive pattern - refactored out)
// const { theme } = useThemeContext();
// const isDarkMode = theme === "dark";
// const styles = getModernStyles(isDarkMode);
```
All screens use `ThemedView` and `ThemedText` components with the `useModernStyles()` hook.

## Development Workflow

### Environment Setup
1. Copy `.env.example` → `.env` and fill Firebase credentials
2. Install: `npm install`
3. Run: `expo start` (uses Expo Go app or dev client)
   - Android: `expo start --android`
   - iOS: `expo start --ios`
   - Web: `expo start --web`

### Firebase Deployment
```bash
# Deploy Firestore rules
firebase login
firebase use --add  # Select your project
firebase deploy --only firestore:rules

# Deploy indexes (if modified)
firebase deploy --only firestore:indexes
```

**Note**: Cloud Functions setup scripts exist (`install-functions.ps1`) but `/functions` directory is not yet implemented.

### Testing (Placeholder)
- Jest config present but no tests written yet
- TODO: Run with `npm test` when implemented

### Administrative Scripts
Location: `scripts/` directory
- `registrarAdmin.ts` → Create admin user
- `crearRutaPrueba.ts` → Generate test route
- `marcarRutaDefault.ts` → Set default route for new users
- `migration-remove-passwords.ts` → Security cleanup script

Run with: `npx ts-node scripts/scriptName.ts`

## Common Tasks

### Adding a New Screen
1. Create file in `app/(tabs)/screen-name.tsx`
2. Use `ThemedView`, `ThemedText`, and `useModernStyles(isDarkMode)`
3. Wrap with auth check:
```typescript
const { user } = useAuthContext();
if (!user) return <Redirect href="/login" />;
```

### Adding a New Firestore Collection
1. Define TypeScript interface in `services/firebase/types.ts`
2. Create service file `services/firebase/new-service.ts`
3. Add Firestore security rules in `firestore.rules`
4. Export service from `services/firebase.ts`
5. Deploy rules: `firebase deploy --only firestore:rules`

### Working with Routes
Routes have two coordinate arrays:
- `direcciones[]` → Street addresses (strings) - legacy/user input
- `coordenadas[]` → Geocoded GPS points - used for map rendering
- `polyline[]` → Optimized path from OSRM routing service

Use `routing-service.ts` to geocode addresses and `route-optimizer.ts` for path optimization.

### Adding Push Notifications
See `services/notification-service.ts` and `hooks/use-push-notifications.ts`:
```typescript
const { expoPushToken } = usePushNotifications();
// Token is auto-saved to user document on login
```

## Code Style Conventions

- **Imports**: Path alias `@/` maps to project root (tsconfig.json)
- **Logging**: Prefix with component name: `console.log("[CONDUCTOR] Ruta iniciada")`
- **Comments**: Spanish OK for business logic, English for technical architecture
- **File naming**: kebab-case for files, PascalCase for components
- **Firestore IDs**: Auto-generated via `addDoc()` or manual via `doc(collection, id)`

## Known Limitations

1. **AsyncStorage persistence disabled** in Firebase Auth - using memory-only auth state (see TODO in `firebaseconfig.ts`)
2. **No CI/CD pipeline** - deployments are manual via EAS Build
3. **No automated tests** - manual QA only
4. **Cloud Functions not deployed** - all logic is client-side or Firestore rules
5. **TypeScript error**: `expo/tsconfig.base` not found - can be ignored, builds work fine

## External Dependencies

- **Geocoding**: OpenStreetMap Nominatim API (free, rate-limited)
- **Routing**: OSRM (Open Source Routing Machine) public instance
- **Maps**: Google Maps (Android), Apple Maps (iOS)
- **Push**: Expo Push Notification service

## Business Context

- **Target**: Municipal garbage collection services in Mexico
- **Pricing model**: B2G SaaS (see MODELO_DE_NEGOCIOS.md)
- **Stakeholders**: Residents, truck drivers, municipal admins
- **Security priority**: High - handles citizen PII and real-time location
