# Use Case Analysis – Online Travel Booking System

## Overview

| Item | Detail |
|------|--------|
| System Name | Online Travel Booking System |
| Purpose | Support users in searching, booking, and managing travel services online |
| Total Actors | 4 |
| Total Use Cases | 31 |
| Use Case Groups | 5 |

---

## Actors

| ID | Actor | Type | Description |
|----|-------|------|-------------|
| A01 | Customer | Primary | Searches, books, pays for, and reviews travel services |
| A02 | Service Provider | Primary | Posts and manages travel products; views bookings and statistics |
| A03 | Administrator | Primary | Approves accounts, manages the platform, views reports |
| A04 | Payment Gateway | External | Processes online payments (PayPal, Stripe, MoMo, ZaloPay) |

---

## Use Case Groups

### Group 1 — Account Management (5 Use Cases)

| UC ID | Use Case Name | Actor(s) | Description |
|-------|--------------|----------|-------------|
| UC01 | Register Account | Customer, Service Provider | User provides personal information and avatar to create an account |
| UC02 | Login | All authenticated users | User authenticates with credentials; system enforces role-based access |
| UC03 | Role-Based Authorization | System / Admin | System assigns and enforces permissions based on user role (Customer, Provider, Admin) |
| UC04 | Update Profile | Customer, Service Provider | User updates personal info, avatar, and account details |
| UC05 | Approve Service Provider Account | Administrator | Admin reviews and verifies provider registration before granting posting rights |

---

### Group 2 — Service Management (Service Provider) (7 Use Cases)

| UC ID | Use Case Name | Actor(s) | Description |
|-------|--------------|----------|-------------|
| UC06 | Post Travel Service | Service Provider | Provider publishes a tour, hotel room, or transport ticket with name, description, images, price, departure time, and available slots |
| UC07 | Edit Travel Service | Service Provider | Provider updates details of a previously posted service |
| UC08 | Delete Travel Service | Service Provider | Provider removes a service listing from the platform |
| UC09 | View Booking List | Service Provider | Provider views the list of customers who have booked their services |
| UC10 | View Customer Feedback & Ratings | Service Provider | Provider monitors reviews and ratings submitted by customers |
| UC11 | View Revenue Statistics | Service Provider | Provider views booking counts and revenue per service, filtered by month, quarter, or year |
| UC12 | Chat with Customer (Real-time) | Service Provider, Customer | Provider and customer exchange messages in real time via Firebase Realtime Database |

---

### Group 3 — Search & Booking (Customer) (10 Use Cases)

| UC ID | Use Case Name | Actor(s) | Description |
|-------|--------------|----------|-------------|
| UC13 | Search Travel Services | Customer | Customer searches by location, service type, departure time, or price range |
| UC14 | Sort Search Results | Customer | Customer sorts results by price, rating, or popularity |
| UC15 | View Service Detail | Customer | Customer views full information of a specific service (description, images, price, availability) |
| UC16 | Compare Services | Customer | Customer compares multiple services of the same type by price, quality, duration, and ratings |
| UC17 | Book Service | Customer | Customer selects a service, specifies number of seats/rooms, and places a booking |
| UC18 | Cancel Booking | Customer | Customer cancels a previously made booking |
| UC19 | View Booking History | Customer | Customer views a list of all past and active bookings |
| UC20 | Rate & Review Service | Customer | Customer submits a rating and written review after using a service |
| UC21 | Chat with Service Provider (Real-time) | Customer, Service Provider | Customer sends real-time messages to the provider via Firebase Realtime Database |
| UC22 | Paginate Search Results | Customer | System displays search results paginated at a maximum of 20 services per page |

---

### Group 4 — Payment (4 Use Cases)

| UC ID | Use Case Name | Actor(s) | Description |
|-------|--------------|----------|-------------|
| UC23 | Online Payment | Customer, Payment Gateway | Customer pays via PayPal, Stripe, MoMo, or ZaloPay; system integrates with external gateway |
| UC24 | Cash Payment | Customer, Service Provider | Customer pays in cash directly to the provider; system records the transaction |
| UC25 | Record Transaction | System | System logs all payment transactions for auditing and financial transparency |
| UC26 | View Transaction History | Customer | Customer views a list of all past payment records |

---

### Group 5 — System Administration (Administrator) (5 Use Cases)

| UC ID | Use Case Name | Actor(s) | Description |
|-------|--------------|----------|-------------|
| UC27 | Manage Users | Administrator | Admin views, edits, suspends, or removes user accounts across all roles |
| UC28 | Manage Services | Administrator | Admin reviews, hides, or removes service listings on the platform |
| UC29 | View System Dashboard Report | Administrator | Admin views aggregate metrics: active services, booking frequency, total revenue |
| UC30 | Customize Reports | Administrator | Admin extends and configures reports for strategic management purposes |
| UC31 | System Configuration | Administrator | Admin manages service categories, platform settings, and global configurations |

---

## Actor–Use Case Matrix

| Use Case | Customer | Service Provider | Administrator | Payment Gateway |
|----------|:--------:|:----------------:|:-------------:|:---------------:|
| UC01 Register Account | ✓ | ✓ | | |
| UC02 Login | ✓ | ✓ | ✓ | |
| UC03 Role-Based Authorization | ✓ | ✓ | ✓ | |
| UC04 Update Profile | ✓ | ✓ | | |
| UC05 Approve Provider Account | | | ✓ | |
| UC06 Post Travel Service | | ✓ | | |
| UC07 Edit Travel Service | | ✓ | | |
| UC08 Delete Travel Service | | ✓ | | |
| UC09 View Booking List | | ✓ | | |
| UC10 View Customer Feedback | | ✓ | | |
| UC11 View Revenue Statistics | | ✓ | | |
| UC12 Chat with Customer | ✓ | ✓ | | |
| UC13 Search Travel Services | ✓ | | | |
| UC14 Sort Search Results | ✓ | | | |
| UC15 View Service Detail | ✓ | | | |
| UC16 Compare Services | ✓ | | | |
| UC17 Book Service | ✓ | | | |
| UC18 Cancel Booking | ✓ | | | |
| UC19 View Booking History | ✓ | | | |
| UC20 Rate & Review Service | ✓ | | | |
| UC21 Chat with Service Provider | ✓ | ✓ | | |
| UC22 Paginate Search Results | ✓ | | | |
| UC23 Online Payment | ✓ | | | ✓ |
| UC24 Cash Payment | ✓ | ✓ | | |
| UC25 Record Transaction | ✓ | | | ✓ |
| UC26 View Transaction History | ✓ | | | |
| UC27 Manage Users | | | ✓ | |
| UC28 Manage Services | | | ✓ | |
| UC29 View System Dashboard | | | ✓ | |
| UC30 Customize Reports | | | ✓ | |
| UC31 System Configuration | | | ✓ | |

---

## Key Business Rules

1. **Account approval gate**: Service Provider accounts must be approved and verified by an Administrator before they can post or manage any service.
2. **Role isolation**: Each role (Customer, Provider, Admin) has a distinct permission set; cross-role access is not permitted.
3. **Pagination limit**: Search results are displayed with a maximum of 20 services per page.
4. **Transaction logging**: Every payment transaction (online or cash) must be recorded and stored for auditing.
5. **Real-time chat**: Customer–Provider messaging is powered by Firebase Realtime Database.
6. **Multi-payment support**: Online payment supports PayPal, Stripe, MoMo, and ZaloPay; cash payment is also accepted.
7. **Service fields**: When posting a service, providers must supply: name, detailed description, images, price, departure time, and available slots.
8. **Statistics scope**: Provider statistics cover individual service performance by month/quarter/year; Admin reports cover the entire platform.

---

## Use Case Count Summary

| Group | Use Cases | Count |
|-------|-----------|-------|
| Account Management | UC01–UC05 | 5 |
| Service Management (Provider) | UC06–UC12 | 7 |
| Search & Booking (Customer) | UC13–UC22 | 10 |
| Payment | UC23–UC26 | 4 |
| System Administration (Admin) | UC27–UC31 | 5 |
| **Total** | | **31** |
