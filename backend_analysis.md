# KMTravel Backend Analysis

## Directory Structure

```
backend/
├── app/              # Django settings
├── accounts/         # User management (UC01-UC05)
├── locations/        # Countries & cities (UC13)
├── services/         # Tours, Hotels, Transports (UC06-UC16)
├── bookings/         # Booking management (UC17-UC20)
├── payments/         # Payment handling (UC23-UC26)
├── provider/         # Provider dashboard (UC09-UC12)
└── media/            # File uploads
```

## API Pattern

**Hybrid Pattern** (không dùng ModelViewSet):

- `ListCreateAPIView` / `RetrieveUpdateDestroyAPIView` cho CRUD operations
- `GenericViewSet` + `@action` decorators cho custom actions (cancel, review, messages)

## Apps Detail

### 1. accounts (UC01-UC05)

**Models:**
- `User` (AbstractUser): Custom user với role flags (`is_customer`, `is_provider`, `is_admin`, `is_approved`)
- `ProviderProfile`: Business verification (business_name, tax_code, business_license, is_verified)

**Endpoints:**

| Endpoint | Method | Action | Use Case |
|----------|--------|--------|----------|
| `/accounts/register/` | POST | register | UC01 |
| `/accounts/logout/` | POST | logout | UC02 |
| `/accounts/me/` | GET/PATCH | me | UC04 |
| `/accounts/me/change-password/` | POST | change_password | UC04 |
| `/accounts/cloudinary/sign/` | POST | cloudinary_sign | Image upload |
| `/provider-admin/pending/` | GET | pending | UC05 |
| `/provider-admin/{id}/verify/` | PATCH | verify | UC05 |

**Permissions:** `IsCustomer`, `IsProvider`, `IsApprovedProvider`, `IsAdmin`

---

### 2. locations (UC13)

**Models:**
- `Country`: name
- `City`: name, country (FK), description, image, is_active

**Endpoints:**

| Endpoint | Method | Action |
|----------|--------|--------|
| `/locations/countries/` | GET | list all |
| `/locations/countries/{id}/cities/` | GET | cities in country |
| `/locations/cities/` | GET | list all |

---

### 3. services (UC06-UC16)

**Models:**
- `Category`: Service categories (Tour, Hotel, Transport)
- `BaseService` (abstract): Common fields
- `TravelTour` (inherits BaseService): Tours with time_start, empty_slot, tour_packages
- `Hotel` (inherits BaseService): Hotels with room_types
- `Transport` (inherits BaseService): Transports with brand_name, license_plate, routes, seat_types
- `ServiceImage`: Images
- `RoomType` / `Room`: Hotel room structure
- `SeatType` / `PhysicalSeat` / `Route` / `SeatStatus`: Transport seat management
- `Package` / `TourPackage`: Package options
- `Comment`: Tour reviews (UC20)
- `Wishlist`: User saved services
- `PromoBanner`: Platform promotions

**Endpoints:**

| Endpoint | View Class | Pattern | Use Cases |
|----------|------------|---------|----------|
| `GET/POST /services/categories/` | `ListCreateAPIView` | APIView | UC31 |
| `GET/PUT/PATCH/DELETE /services/categories/{id}/` | `RetrieveUpdateDestroyAPIView` | APIView | UC31 |
| `GET/POST /services/packages/` | `ListCreateAPIView` | APIView | - |
| `GET/POST /services/tour-packages/` | `ListCreateAPIView` | APIView | UC06-UC07 |
| `GET/PUT/PATCH/DELETE /services/tour-packages/{id}/` | `RetrieveUpdateDestroyAPIView` | APIView | UC08 |
| `GET/POST /services/tours/` | `ListCreateAPIView` | APIView | UC06, UC13-UC16 |
| `GET/PUT/PATCH/DELETE /services/tours/{id}/` | `RetrieveUpdateDestroyAPIView` | APIView | UC07-UC08 |
| `GET/POST /services/hotels/` | `ListCreateAPIView` | APIView | UC06, UC13-UC16 |
| `GET/PUT/PATCH/DELETE /services/hotels/{id}/` | `RetrieveUpdateDestroyAPIView` | APIView | UC07-UC08 |
| `GET/POST /services/transports/` | `ListCreateAPIView` | APIView | UC06, UC13-UC16 |
| `GET/PUT/PATCH/DELETE /services/transports/{id}/` | `RetrieveUpdateDestroyAPIView` | APIView | UC07-UC08 |
| `GET/POST /services/promo-banners/` | `ListCreateAPIView` | APIView | Admin |
| `GET/PUT/PATCH/DELETE /services/promo-banners/{id}/` | `RetrieveUpdateAPIView` | APIView | Admin |
| `GET/POST /services/tours/{id}/comments/` | `TourCommentViewSet` | ViewSet+@action | UC10, UC20 |
| `GET/POST/DELETE /services/wishlist/` | `WishlistViewSet` | ViewSet+@action | Wishlist |

**Search/Filter (UC13-UC14, UC22):**
- Query params: `city`, `category`, `provider`, `min_price`, `max_price`, `min_star`, `ordering`

**Permissions:** `IsApprovedProviderOrAdmin`, `ServiceOwnerOrAdmin`

---

### 4. bookings (UC17-UC20)

**Models:**
- `Booking`: Main booking với status (pending/confirmed/cancelled/completed/refunded)
- `BookingItem`: Line items (rooms, seats, packages, routes)
- `BookingReview`: Reviews for completed bookings

**Endpoints:**

| Endpoint | View Class | Pattern | Use Cases |
|----------|------------|---------|----------|
| `GET/POST /bookings/` | `ListCreateAPIView` | APIView | UC17, UC19 |
| `GET /bookings/{id}/` | `RetrieveAPIView` | APIView | UC15 |
| `POST /bookings/{id}/cancel/` | `BookingActionViewSet` | ViewSet+@action | UC18 |
| `POST /bookings/{id}/complete/` | `BookingActionViewSet` | ViewSet+@action | Provider |
| `POST /bookings/{id}/refund/` | `BookingActionViewSet` | ViewSet+@action | Admin |
| `GET/POST /bookings/{id}/review/` | `BookingActionViewSet` | ViewSet+@action | UC20 |

**Permissions:** `IsBookingOwnerOrAdmin`, `IsBookingCustomerOrAdmin`, `IsBookingOwnerProviderOrAdmin`

---

### 5. payments (UC23-UC26)

**Models:**
- `Payment`: Multi-method (PayPal, Stripe, MoMo, ZaloPay, Cash)
- `Transaction`: Audit log

**Endpoints:**

| Endpoint | View Class | Pattern | Use Cases |
|----------|------------|---------|----------|
| `GET/POST /payments/` | `ListCreateAPIView` | APIView | UC23-UC26 |
| `GET /payments/{id}/` | `RetrieveAPIView` | APIView | UC26 |
| `POST /payments/{id}/cancel/` | `PaymentActionViewSet` | ViewSet+@action | Customer |
| `POST /payments/{id}/confirm/` | `PaymentActionViewSet` | ViewSet+@action | Admin |
| `GET /payments/admin-dashboard/` | `AdminDashboardView` | GenericAPIView | UC29 |

---

### 6. provider (UC09-UC12)

**Models:**
- `ProviderRevenue`: Revenue statistics
- `ChatRoom`: Customer-Provider chat rooms
- `Message`: Chat messages

**Endpoints:**

| Endpoint | View Class | Pattern | Use Cases |
|----------|------------|---------|----------|
| `GET /provider/stats/revenue/` | `ProviderStatsViewSet` | ViewSet+@action | UC11 |
| `GET /provider/stats/services/{id}/` | `ProviderStatsViewSet` | ViewSet+@action | UC11 |
| `GET /provider/chats/` | `ChatViewSet` | ViewSet+@action | UC12 |
| `POST /provider/chats/` | `ChatViewSet` | ViewSet+@action | UC12 |
| `GET/POST /provider/chats/{id}/messages/` | `ChatViewSet` | ViewSet+@action | UC12 |

**Permissions:** `IsApprovedProviderOrAdmin`, `IsProviderOwner`

---

## Permission System

| Permission | Location | Purpose |
|------------|----------|---------|
| `IsCustomer` | accounts/perms.py | Customer role check |
| `IsProvider` | accounts/perms.py | Provider role check |
| `IsApprovedProvider` | accounts/perms.py | Provider + approval status |
| `IsAdmin` | accounts/perms.py | Admin/staff check |
| `IsApprovedProviderOrAdmin` | services/perms.py | Service creation |
| `ServiceOwnerOrAdmin` | services/perms.py | Service modification |
| `IsBookingOwnerOrAdmin` | bookings/permissions.py | Cancel/review |
| `IsBookingCustomerOrAdmin` | bookings/permissions.py | Booking creation |
| `IsBookingOwnerProviderOrAdmin` | bookings/permissions.py | View booking list |
| `IsProviderOwner` | provider/perms.py | Provider dashboard |

---

## Use Case Coverage

| Use Case Group | Coverage | Notes |
|----------------|----------|-------|
| UC01-UC05 (Account) | ✅ Full | Register, login, profile, provider approval |
| UC06-UC08 (Service CRUD) | ✅ Full | Tour, Hotel, Transport creation/editing |
| UC09 (View Bookings) | ✅ Full | Provider sees bookings via filtered list |
| UC10 (Feedback/Ratings) | ⚠️ Partial | Comments on tours; aggregate ratings not updated |
| UC11 (Revenue Stats) | ✅ Full | Provider revenue by period, service type |
| UC12 (Real-time Chat) | ⚠️ Implemented | NOT Firebase - uses Django DB |
| UC13-UC16 (Search/Compare) | ⚠️ Partial | Search/sort; comparison view missing |
| UC17-UC20 (Booking) | ✅ Full | Book, cancel, history, review |
| UC22 (Pagination) | ⚠️ Partial | Implemented but not limited to 20/page |
| UC23-UC26 (Payment) | ✅ Full | Multi-payment methods, transactions |
| UC27-UC31 (Admin) | ⚠️ Partial | Manage via existing; reports/customize not full |

---

## Gaps & Issues

### 1. Firebase Integration Missing (UC12, UC21)
- Chat uses Django DB instead of Firebase Realtime Database
- Real-time messaging not implemented per requirements

### 2. Service Comparison (UC16)
- No dedicated endpoint to compare multiple services side-by-side

### 3. Pagination Limit (UC22)
- Business rule: max 20 services/page
- Not enforced in services app

### 4. Aggregate Ratings (UC10)
- `star_rating` and `review_count` fields exist
- Not updated when new reviews submitted

### 5. Report Customization (UC30)
- Admin can view dashboard
- Cannot customize reports

### 6. System Configuration (UC31)
- Category management exists
- Other platform settings not found

### 7. Provider Rejection Flow
- `ProviderProfile.is_rejected` field exists
- Rejection reason not used in approval flow

### 8. Hotel/Transport Search by Location
- `departure_time` filter not exposed in list view

---

## Summary

| Metric | Value |
|--------|-------|
| Total Apps | 6 |
| Total Models | ~25+ |
| Total Endpoints | ~40+ |
| Primary Pattern | APIView + GenericViewSet with @action |
| Auth Framework | Django OAuth Toolkit |
| Image Storage | Cloudinary |