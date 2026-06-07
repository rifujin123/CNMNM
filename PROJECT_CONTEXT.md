# KMTravel Project Context

## Purpose of this file

This file is the **quick business/context brief** for future sessions.

Use it together with:
- `CLAUDE.md` for commands, repo architecture, and implementation guidance
- `business_core.md` for the full 31-use-case specification
- `rules.md` for project rules

If you only need to get productive quickly:
1. Read `rules.md`
2. Read `business_core.md`
3. Read this file
4. Read `CLAUDE.md`

---

## 1. Project summary

**KMTravel** là hệ thống đặt dịch vụ du lịch online.

Ba vai trò chính:
- **Customer**: tìm kiếm, đặt, thanh toán, review, chat
- **Service Provider**: đăng và quản lý dịch vụ, xem booking, xem doanh thu, chat
- **Administrator**: duyệt provider, quản lý nền tảng, xem báo cáo

Có thêm actor ngoài hệ thống:
- **Payment Gateway**: xử lý thanh toán online qua PayPal / Stripe / MoMo / ZaloPay

---

## 2. Business scope

Từ `business_core.md`, hệ thống có **31 use cases**, chia thành 5 nhóm:

1. **Account Management** — UC01 đến UC05
2. **Service Management (Provider)** — UC06 đến UC12
3. **Search & Booking (Customer)** — UC13 đến UC22
4. **Payment** — UC23 đến UC26
5. **System Administration** — UC27 đến UC31

Khi làm feature mới, luôn map về use case tương ứng.

Ví dụ:
- booking flow => UC17 / UC18 / UC19 / UC20
- provider service management => UC06 / UC07 / UC08
- chat => UC12 / UC21
- payment => UC23 / UC24 / UC25 / UC26
- admin management/reporting => UC27–UC31

---

## 3. Business rules quan trọng

Đây là các rule quan trọng nhất cần nhớ:

1. **Provider phải được admin approve** trước khi có quyền đăng / quản lý service
2. **Role-based authorization** phải tách biệt rõ giữa Customer / Provider / Admin
3. **Search results tối đa 20 item / page**
4. **Mọi payment transaction phải được log**
5. **Chat Customer–Provider theo business requirement phải dùng Firebase Realtime Database**
6. **Online payment** hỗ trợ PayPal, Stripe, MoMo, ZaloPay
7. Khi provider đăng service, phải có tối thiểu:
   - name
   - detailed description
   - images
   - price
   - departure time
   - available slots
8. Provider stats xem theo tháng / quý / năm; Admin report ở mức toàn platform

---

## 4. Project rules cần nhớ

Từ `rules.md`:

1. **Low effort, clean code** — không over-engineering
2. **Check business_core.md** trước khi làm feature mới
3. **DRF View Selection:**
   - `APIView` → hành động hệ thống (payment, auth, webhooks)
   - `Concrete Views` → CRUD đơn lẻ (ListAPIView, RetrieveAPIView, v.v.)
   - `GenericViewSet` → custom actions (comments, wishlist, booking actions)
   - ❌ Cấm `ModelViewSet` (sinh API thừa)
4. **Authorization** → tạo permission class trong `perms.py`
5. **Serializer** → tách read/write, không gộp
6. **Performance** → dùng `select_related`/`prefetch_related` để tránh N+1

---

## 5. Repo mental model

Repo có 2 phần chính:

- `backend/`: Django + DRF API
- `TravelBookingSystem/`: Expo / React Native app

Nếu cần command, cấu trúc code, routing pattern, auth pattern, hoặc frontend navigation, đọc `CLAUDE.md`.

---

## 6. Backend domain summary

Các app backend chính:
- `accounts`: user, role, auth, provider approval
- `locations`: country, city
- `services`: tours, hotels, transports, packages, wishlist, comments, promo banners
- `bookings`: booking flow, booking items, review
- `payments`: payment records, transaction log
- `provider`: provider stats, chat

Domain trung tâm là **service**:
- `BaseService` là abstraction chính
- các loại service hiện có: `TravelTour`, `Hotel`, `Transport`
- booking, wishlist, review, seat/room/package flow đều xoay quanh service này

---

## 7. Current implementation status

### ✅ Đã cover đầy đủ
- UC01–UC05: account management
- UC06–UC08: provider CRUD services (Tour, Hotel, Transport)
- UC09: provider xem booking list
- UC10: feedback + aggregate rating (star_rating, review_count auto-update on comment)
- UC11: provider revenue statistics
- UC13: search với filters (city, category, price, star, time range, q search)
- UC14: sort (newest, oldest, price_asc/desc, rating_asc/desc, popularity)
- UC17–UC20: booking flow + review
- UC22: pagination 20/page enforced cho tour/hotel/transport search
- UC23–UC26: payment + transaction history
- UC27: admin manage users (list, edit, suspend/activate)

### ⚠️ Mới cover một phần / chưa đúng hoàn toàn
- UC12 / UC21: chat infrastructure ready (ChatRoom metadata), messages qua Firebase (frontend cần implement)
- UC15: service detail — có endpoint riêng, cần verify đầy đủ
- UC16: compare services — chưa có endpoint chuyên biệt
- UC28–UC31: admin features (manage services, dashboard, reports, config) — mới partial

### ❌ Chưa có
- UC16: Compare Services endpoint
- UC28: Admin manage services (hide/delete service listings)
- UC29: Admin system dashboard report
- UC30: Admin customize reports
- UC31: Admin system configuration (categories, platform settings)

---

## 8. Các mismatch / gap quan trọng (đã fix / còn lại)

### ✅ Đã fix
1. **Chat infrastructure** — Message model đã xóa, ChatRoom giữ lại metadata + firebase_key. Messages qua Firebase (frontend pending).
2. **Rating aggregate** — star_rating và review_count auto-update khi tạo comment.
3. **Pagination 20/page** — đã enforce qua ServicePageNumberPagination.
4. **Transport filters** — đã thêm min_star/max_star.
5. **Admin user management** — UserAdminViewSet với list/edit/suspend/activate.

### ⚠️ Còn lại
1. **Compare Services (UC16)** — chưa có endpoint so sánh service cùng loại.
2. **Admin features (UC28–UC31)** — manage services, dashboard, reports, config chưa đầy đủ.
3. **Firebase frontend** — chat messages chưa implement ở frontend.

### ⚠️ Repo inconsistency
- Backend đã tuân thủ rules.md — APIView cho hành động hệ thống, Concrete Views cho CRUD, GenericViewSet cho custom actions.

---

## 9. Nên ưu tiên gì khi phát triển tiếp?

Ưu tiên hợp lý:

1. Chốt lại API architecture rule cho thống nhất với code thực tế
2. Fix chat theo Firebase nếu bám business chuẩn
3. Bổ sung compare services
4. Enforce pagination 20/page rõ ràng
5. Hoàn thiện aggregate rating / review count
6. Mở rộng admin features theo UC27–UC31

---

## 10. Đọc gì đầu tiên?

Nếu là session mới, nên đọc theo thứ tự:

1. `rules.md`
2. `business_core.md`
3. `PROJECT_CONTEXT.md`
4. `CLAUDE.md`

Nếu làm backend sâu hơn, đọc tiếp:
- `backend/app/settings.py`
- `backend/app/urls.py`
- `backend/services/models.py`
- `backend/bookings/models.py`
- `backend/payments/models.py`
- `backend/accounts/models.py`

---

## 11. Tóm tắt ngắn

KMTravel là hệ thống booking du lịch online với 3 vai trò chính: Customer, Provider, Admin. Business định nghĩa 31 use cases bao phủ account, service management, search/booking, payment và admin.

**Backend** (Django/DRF): tuân thủ rules.md với APIView cho hành động hệ thống, Concrete Views cho CRUD, GenericViewSet cho custom actions.

**Frontend** (Expo/React Native): role-driven navigation.

**Đã hoàn thành:**
- UC01–UC14, UC17–UC20, UC22–UC27
- Rating aggregate, pagination 20/page, chat infrastructure (Firebase ready)

**Còn lại:**
- UC16: Compare Services
- UC28–UC31: Admin features
- Firebase frontend implementation
