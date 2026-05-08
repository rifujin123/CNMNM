# CNMNM - Travel Booking Platform

## Project Overview

**CNMNM** is a full-stack travel booking platform built with a **Django REST API backend** and a **React Native (Expo) mobile frontend**. The platform connects travelers with service providers, enabling bookings for tours, hotels, and transportation across multiple cities.

---

## Technology Stack

### Backend
- **Framework**: Django 6.0.3 with Django REST Framework
- **Language**: Python
- **Database**: MySQL (`kmtravel`)
- **Authentication**: OAuth2 via `django-oauth2-provider`
- **Storage**: Cloudinary (image/media storage)
- **Documentation**: Drf-Yasg (Swagger/OpenAPI)
- **CORS**: `django-cors-headers`
- **API Format**: RESTful JSON API

### Frontend
- **Framework**: React Native via Expo SDK 54
- **Language**: JavaScript/TypeScript
- **Navigation**: React Navigation 7 (Stack + Bottom Tabs)
- **HTTP Client**: Axios
- **State Management**: React Context (AuthContext)
- **Platforms**: iOS, Android, Web

---

## Project Structure

```
CNMNM/
├── backend/                    # Django REST API
│   ├── app/                    # Django project settings
│   │   ├── settings.py         # Core configuration
│   │   ├── urls.py             # Root URL routing
│   │   ├── wsgi.py / asgi.py   # Server entry points
│   ├── accounts/               # User management
│   │   ├── models.py           # User, ProviderProfile
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   └── permissions.py
│   ├── services/               # Core services (tours, hotels, transport)
│   │   ├── models.py           # BaseService, TravelTour, Hotel, Transport, etc.
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   └── perms.py
│   ├── bookings/               # Booking management
│   │   ├── models.py           # booking model
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   └── permissions.py
│   ├── payments/               # Payment processing
│   │   ├── models.py           # Payment model
│   │   ├── views.py
│   │   ├── payServices/        # Payment gateway integrations
│   │   │   ├── payment_service.py
│   │   │   ├── momo_service.py
│   │   │   └── vnpay_service.py
│   │   └── payServices/
│   ├── locations/              # Geographic data
│   │   └── models.py           # Country, City
│   └── media/                  # User-uploaded files
├── TravelBookingSystem/        # React Native Expo app
│   ├── App.js                  # Root navigation
│   ├── index.js                # Entry point
│   ├── src/
│   │   ├── screens/            # Screen components
│   │   │   ├── HomeScreen.js
│   │   │   ├── ExploreScreen.js
│   │   │   ├── LoginScreen.js
│   │   │   ├── TripsScreen.js
│   │   │   ├── SavedScreen.js
│   │   │   ├── AccountScreen.js
│   │   │   ├── ItemDetailScreen.js
│   │   │   ├── TripDetailScreen.js
│   │   │   ├── CategoryListScreen.js
│   │   │   ├── PersonalInformationScreen.js
│   │   │   ├── SecurityScreen.js
│   │   │   ├── PaymentMethodsScreen.js
│   │   │   ├── NotificationsScreen.js
│   │   │   └── HelpAndSupportScreen.js
│   │   ├── components/         # Reusable UI components
│   │   │   ├── ItemCard.js
│   │   │   ├── ItemCardSave.js
│   │   │   ├── TransportCard.js
│   │   │   ├── CategoryChips.js
│   │   │   ├── TripChips.js
│   │   │   ├── PromoBanner.js
│   │   │   ├── SearchBar.js
│   │   │   ├── UserAvatar.js
│   │   │   └── ...
│   │   ├── navigations/        # Navigation configs
│   │   │   ├── AccountStack.js
│   │   │   └── ExploreStack.js
│   │   ├── assets/             # SVG icons, logos
│   │   └── hooks/              # Custom hooks
│   ├── configs/
│   │   └── Apis.js             # API endpoints config
│   └── package.json
└── README.md
```

---

## Data Models

### Accounts (`accounts`)
| Model | Description |
|-------|-------------|
| **User** | Custom user extending `AbstractUser` with roles: `is_customer`, `is_provider`, `is_approved` |
| **ProviderProfile** | Business profile for providers (business name, license, tax code, verification status) |

### Services (`services`)
| Model | Description |
|-------|-------------|
| **BaseService** | Abstract base for all services (name, description, star_rating, base_price, city, provider, category) |
| **TravelTour** | Tour packages with `time_start`, `empty_slot`, and multiple `TourPackage` options |
| **TourPackage** | Bundled pricing options for a tour (includes multiple `Package` add-ons) |
| **Hotel** | Accommodation with address detail and room management |
| **Room** | Individual hotel rooms (room_type, room_number, bed count, availability) |
| **RoomType** | Room categories with pricing (Unique per hotel) |
| **Transport** | Vehicles (bus, train, flight) with brand, license plate, vehicle type |
| **Route** | Transport routes with departure/arrival times between cities |
| **SeatType** | Seat classes with pricing (Unique per provider) |
| **Category** | Service categories |
| **Comment** | User reviews on travel tours |
| **PromoBanner** | Promotional banners with title, subtitle, image, CTA |

### Bookings (`bookings`)
| Model | Description |
|-------|-------------|
| **booking** | Links users to services; supports rooms and seat types; tracks quantity, total price, and status (pending/confirmed/cancelled/completed) |

### Payments (`payments`)
| Model | Description |
|-------|-------------|
| **Payment** | Payment records with method (MoMo, ZaloPay, VNPay), status tracking, transaction IDs, and refund support |

### Locations (`locations`)
| Model | Description |
|-------|-------------|
| **Country** | Countries |
| **City** | Cities linked to countries (Unique per country) |

---

## API Features

- **OAuth2 Authentication** for secure API access
- **Role-based Permissions** (Customer, Provider, Admin)
- **Swagger/OpenAPI Documentation** via Drf-Yasg
- **Image Upload** to Cloudinary
- **Payment Gateway Integration** (MoMo, ZaloPay, VNPay)
- **Full CRUD** for services, bookings, and user profiles

---

## User Roles & Flow

1. **Customer** — Browse and book services, manage bookings, make payments
2. **Provider** — List and manage services (tours, hotels, transport), view bookings
3. **Admin** — Approve providers, manage categories, oversee all data

---

## Mobile App Features

- **Home Screen** — Featured tours, categories, promotional banners
- **Explore** — Search and filter services by category/location
- **Trip Detail** — Detailed tour info with pricing packages
- **Bookings** — View and manage active/past bookings
- **Account** — Profile management, security, payment methods
- **Login/Register** — Role selection (Customer vs Provider)
- **Save/Favorites** — Bookmark services

---

## Getting Started

### Backend
```bash
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Frontend
```bash
cd TravelBookingSystem
npm install
npx expo start
```

---

*Last updated: May 2026*
