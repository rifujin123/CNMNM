# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository layout

This repo has two main parts:

- `backend/`: Django 6 + Django REST Framework API for KMTravel
- `TravelBookingSystem/`: Expo / React Native client app

There is also project-level business documentation:

- `business_core.md`: source of truth for the 31 use cases and business rules
- `rules.md`: project-specific implementation rules
- `PROJECT_CONTEXT.md`: condensed project context for fast onboarding
- `backend_analysis.md`: backend-focused analysis

Before implementing any new feature, map it back to the relevant use case(s) in `business_core.md`.

## Project rules that matter

From `rules.md`:

1. Prefer low-effort, clean solutions; avoid over-engineering.
2. When adding anything new, check `business_core.md` first.
3. For authorization, add dedicated permission classes in `perms.py` rather than scattering role checks in views.
4. Do not use `ModelViewSet` or `APIView` for new API work. Only use DRF generic or concrete view classes.
5. The current backend already uses DRF generic API views in multiple places. Treat this as an existing repo inconsistency and be careful not to assume the codebase already fully follows the rule set.

## Common commands

### Backend setup and development

Run from `backend/`:

```bash
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
python manage.py test
```

Run tests for a single app:

```bash
python manage.py test accounts
python manage.py test services
python manage.py test bookings
python manage.py test payments
python manage.py test provider
python manage.py test locations
```

There are app-level `tests.py` files in the backend apps, but no dedicated pytest configuration was found.

### Frontend setup and development

Run from `TravelBookingSystem/`:

```bash
npm install
npm start
npm run android
npm run ios
npm run web
```

The frontend `package.json` does not define lint or test scripts.

## Backend architecture

The backend is organized by business domain rather than by technical layer. The main apps are:

- `accounts`: custom user model, role flags, provider approval flow
- `locations`: countries and cities used for search/filtering
- `services`: the core travel inventory domain (tours, hotels, transports, media, packages, wishlist, comments, promo banners)
- `bookings`: booking lifecycle, booking items, booking reviews
- `payments`: payment records and transaction audit log
- `provider`: provider revenue reporting and customer/provider chat
- `app`: project settings and top-level URL routing

### Domain model shape

The central domain is `services.BaseService`, an abstract parent for:

- `TravelTour`
- `Hotel`
- `Transport`

Many other parts of the system hang off this service abstraction:

- `Booking.service -> BaseService`
- `Wishlist.service -> BaseService`
- ratings and comments are attached to tours
- hotel inventory is modeled via `RoomType` and `Room`
- transport inventory is modeled via `SeatType`, `PhysicalSeat`, `Route`, and `SeatStatus`
- tour configuration is modeled via `Package` and `TourPackage`

This means most user-facing flows ultimately start from a service object and then branch into type-specific detail.

### Auth and roles

The project uses a custom `accounts.User` model with role flags:

- `is_customer`
- `is_provider`
- `is_admin`
- `is_approved`

OAuth2 is used for API authentication through `django-oauth-toolkit`.

Important consequence: provider access is not just role-based; it is gated by admin approval. When working on provider-facing features, check both provider role and approval status.

### Permissions pattern

Permissions are intentionally split into app-local permission modules such as:

- `accounts/perms.py`
- `services/perms.py`
- `bookings/permissions.py`
- `provider/perms.py`

Existing code follows a pattern of encoding business authorization in dedicated permission classes like `IsApprovedProviderOrAdmin`, `ServiceOwnerOrAdmin`, and booking ownership/provider ownership checks. Continue that pattern for new authorization rules.

### API routing pattern

Top-level API routes are mounted in `backend/app/urls.py` under:

- `/api/accounts/` — user accounts, auth, provider admin, user admin
- `/api/admin/providers/` — provider approval (same router as accounts)
- `/api/provider/` — provider stats, chat rooms
- `/api/services/` — tours, hotels, transports, categories, wishlist, comments
- `/api/locations/` — countries, cities
- `/api/bookings/` — booking CRUD and actions (cancel, complete, refund, review)
- `/api/payments/` — payment CRUD and actions (cancel, confirm), admin dashboard
- `/o/` for OAuth2

**View Selection per rules.md:**

| Feature Type | View Class | Examples |
|--------------|------------|----------|
| System actions | `APIView` | Admin dashboard, payment callbacks |
| CRUD operations | Concrete Views | ListAPIView, RetrieveAPIView, ListCreateAPIView |
| Custom actions | `GenericViewSet` + `@action` | Comments, wishlist, booking actions |

**Routing style:**
- Path-based for concrete views (ListAPIView, etc.)
- DefaultRouter for GenericViewSet custom actions

Examples:
- `locations/urls.py` uses path-based concrete views
- `services/urls.py` uses concrete views + router for comments/wishlist
- `bookings/urls.py` uses concrete views + router actions for cancel/complete/refund
- `payments/urls.py` uses concrete views + router actions + APIView for dashboard

### Settings and external integrations

Important backend settings from `backend/app/settings.py`:

- MySQL is the configured database backend
- Cloudinary is used for media storage
- OAuth2 is the default authentication mechanism for DRF
- default DRF pagination is page-number based with `PAGE_SIZE = 20`
- CORS is explicitly configured for local Expo development hosts
- booking/payment expiration behavior is controlled by env vars:
  - `BOOKING_HOLD_MINUTES`
  - `PAYMENT_EXPIRE_MINUTES`
- static QR payment behavior is configured by env vars like:
  - `STATIC_QR_IMAGE_BASE_URL`
  - `STATIC_QR_BANK_CODE`
  - `STATIC_QR_ACCOUNT_NUMBER`
  - `STATIC_QR_ACCOUNT_NAME`
  - `STATIC_QR_TEMPLATE`

The app also expects OAuth client credentials in env vars and Cloudinary credentials for uploads.

## Frontend architecture

The mobile app is an Expo app with role-driven navigation.

### Navigation structure

`TravelBookingSystem/App.js` selects the root navigator based on auth state and user role:

- guest: public bottom tabs + login/account-not-logged-in screens
- admin: `AdminTabs` + account stack
- provider: `ProviderTabs` + account stack + trip detail
- customer: main tabs + account stack

This means role handling is not just UI-level; it determines the root navigation tree.

### Frontend structure

Under `TravelBookingSystem/src/` the code is grouped into:

- `screens/`: guest, shared, provider, admin, account flows
- `navigations/`: stacks and tab navigators
- `components/`: reusable UI and service form sections
- `hooks/`: data-fetching and mutation hooks
- `api/`: API wrappers
- `config/`: OAuth and cloudinary-related config
- `utils/`: formatting, auth role helpers, image helpers

### Role model on the client

`src/utils/authRole.js` derives role from the backend user payload. Admin currently maps from Django staff/superuser flags, while provider/customer are inferred from the custom booleans. If role behavior looks inconsistent, inspect the backend response shape before changing navigation logic.

### Data-fetching pattern

Although `@tanstack/react-query` is installed, much of the current frontend logic uses custom hooks with `useEffect` / `useState` and imperative API calls.

Examples:

- `useBookings` supports polling via `refetchIntervalMs`
- `usePayment` polls active payments every 5 seconds
- admin APIs aggregate across multiple service endpoints and normalize paginated responses client-side

Do not assume the frontend uses a single uniform query abstraction.

## Known business/implementation status

These are important when working on specific features:

1. **Chat (UC12/UC21):** Backend has `ChatRoom` model for metadata. `Message` model removed — messages go to Firebase Realtime Database. Frontend implementation pending.
2. **Compare Services (UC16):** No dedicated backend endpoint yet.
3. **Pagination (UC22):** Enforced at 20/page via `ServicePageNumberPagination` for tour/hotel/transport search.
4. **Rating aggregate (UC10):** `star_rating` and `review_count` auto-update on comment creation.
5. **Admin features (UC28–UC31):** User management done (UC27). Services management, dashboard, reports, config still partial.

## Files worth reading first for most tasks

For business and repo context:

- `business_core.md`
- `rules.md`
- `PROJECT_CONTEXT.md`

For backend entry points:

- `backend/app/settings.py`
- `backend/app/urls.py`
- `backend/services/models.py`
- `backend/bookings/models.py`
- `backend/payments/models.py`
- `backend/accounts/models.py`

For frontend entry points:

- `TravelBookingSystem/App.js`
- `TravelBookingSystem/src/navigations/BottomTabs.js`
- `TravelBookingSystem/src/utils/authRole.js`
- representative hooks in `TravelBookingSystem/src/hooks/`
