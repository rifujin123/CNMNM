# Kế hoạch Seed Data (Travel Booking System)

## 1. Mục tiêu & Yêu cầu
- Cung cấp dữ liệu mẫu bám sát schema (Models: `accounts.User`, `provider.ProviderProfile`, `services.*`, `bookings.Booking`, `payments.Payment`).
- Số lượng:
  - **Account**: 5 tài khoản (1 Admin, 1 Provider chưa verify, 1 Provider đã verify, 2 User thường).
  - **Dịch vụ**: Mỗi loại 10 items (10 Tours, 10 Hotels, 10 Transports).
  - **Liên kết**: Dữ liệu khớp nhau để test dashboard/thống kê `ProviderStatsViewSet` (Bookings có `payment_status="paid"`, Payments có `payment_status="SUCCESS"`, date trong tháng hiện tại/tuần hiện tại).

## 2. Checklist chi tiết

### Giai đoạn 1: Tạo Accounts & Provider Profiles
- [x] Xóa/Reset dữ liệu cũ (script xóa toàn bộ dữ liệu app trước khi seed).
- [x] Tạo **Admin** (`is_staff=True`, `is_superuser=True`).
- [x] Tạo **Provider 1 (Đã verified)**: `is_provider=True`, `is_approved=True`. Tạo `ProviderProfile` kèm theo với `is_verified=True`.
- [x] Tạo **Provider 2 (Chưa verified)**: `is_provider=True`, `is_approved=False`. Tạo `ProviderProfile` kèm theo với `is_verified=False`.
- [x] Tạo **User 1 (Customer)**: `is_customer=True`.
- [x] Tạo **User 2 (Customer)**: `is_customer=True`.

### Giai đoạn 2: Tạo Dữ liệu Phụ thuộc (Locations & Categories)
- [x] Đảm bảo có ít nhất 2-3 `City` (đã tạo 5 city: Hà Nội, Đà Nẵng, TP.HCM, Huế, Nha Trang).
- [x] Tạo/Lấy các `Category` (Tour, Hotel, Transport).

### Giai đoạn 3: Tạo Services (Gán cho Provider 1 - Verified để test thống kê)
**Tạo 10 Travel Tours:**
- [x] Seed 10 `TravelTour` với tên thật hơn (VD: Hành Trình Di Sản Hà Nội, Khám Phá Biển Đà Nẵng, Sapa Bản Làng Tây Bắc).
- [x] Tạo `Package` và `TourPackage` cho mỗi Tour với tên gói thật hơn (VD: Gói Tiêu Chuẩn, Gói Cao Cấp, Gói Du Thuyền Luxury).

**Tạo 10 Hotels:**
- [x] Seed 10 `Hotel` với tên thật hơn (VD: Hanoi Lotus Boutique Hotel, Danang Ocean Pearl Resort).
- [x] Tạo `RoomType` (2 loại) cho mỗi Hotel.
- [x] Tạo `Room` (6 phòng) cho mỗi Hotel.

**Tạo 10 Transports:**
- [x] Seed 10 `Transport` với tên thật hơn (VD: Hanoi Express Limousine, Saigon Airport Transfer, Sapa Night Express).
- [x] Tạo `SeatType` cho Provider 1.
- [x] Tạo `PhysicalSeat` (20 ghế) cho mỗi Transport.
- [x] Tạo `Route` (2 tuyến) và `SeatStatus` (trạng thái ghế) cho Transport.

### Giai đoạn 4: Tạo Bookings & Payments (Để thống kê Dashboard có số liệu)
- [x] Tạo Booking cho Tour (Customer 1 & 2 đặt).
- [x] Tạo Booking cho Hotel.
- [x] Tạo Booking cho Transport.
- [x] Gán **BookingStatus** = `COMPLETED`.
- [x] Tạo `Payment` cho các Booking này:
  - `payment_status` = `"SUCCESS"`.
  - `created_date` = phân bổ trong ngày (`today`), tuần (`week`), tháng (`month`) hiện tại để test filter thống kê.
  - Tính `total_price` hợp lý theo base price + package/room/seat price.

### Giai đoạn 5: Cập nhật `seed_services.py`
- [x] Viết lại script `backend/seed_services.py` thực thi toàn bộ checklist trên.
- [x] Xác nhận script chạy không lỗi Ràng buộc (Unique constraints: `uniq_seat_status_per_route`, `uniq_room_type_per_hotel`).

### Giai đoạn 6: Kiểm thử dữ liệu sau seed
- [x] Chạy script seed bằng `./venv/Scripts/python.exe backend/seed_services.py`.
- [x] Kiểm tra tổng số account = 5.
- [x] Kiểm tra Provider verified có đủ 30 services (10 tour + 10 hotel + 10 transport).
- [x] Kiểm tra Provider chưa verified không có service active.
- [ ] Kiểm tra dashboard provider qua API/login token:
  - Revenue tổng có số > 0.
  - `by_service_type` có đủ `tour`, `hotel`, `transport`.
  - `top_services` có dữ liệu.
- [ ] Kiểm tra API thống kê service riêng lẻ trả đúng `total_bookings`, `total_revenue`.

## 3. Mapping dữ liệu đề xuất

| Role | Username | Email | Ghi chú |
|---|---|---|---|
| Admin | `admin` | `admin@kmtravel.test` | Quản trị toàn hệ thống |
| Provider verified | `provider_verified` | `provider.verified@kmtravel.test` | Có service + booking + payment để xem thống kê |
| Provider unverified | `provider_pending` | `provider.pending@kmtravel.test` | Chưa được duyệt, dùng test permission |
| User 1 | `user_one` | `user1@kmtravel.test` | Customer đặt tour/hotel/transport |
| User 2 | `user_two` | `user2@kmtravel.test` | Customer đặt tour/hotel/transport |

## 4. Lưu ý kỹ thuật quan trọng
- `BaseService.provider` phải trỏ tới Provider verified để dashboard filter theo `service__provider=user` ra số liệu.
- `Booking.service` phải trỏ tới service của Provider verified.
- `Payment.booking` phải trỏ tới booking tương ứng.
- `ProviderStatsViewSet` đã dùng `created_date` trên `Booking` và `payments__payment_status="SUCCESS"` để khớp model hiện tại.
- Script seed hiện xóa dữ liệu app theo thứ tự an toàn trước khi tạo dữ liệu mới.

## 5. Thứ tự triển khai đề xuất
1. [x] Sửa mismatch trong `ProviderStatsViewSet`: `created_at` -> `created_date`, `payment__payment_status="paid"` -> `payments__payment_status="SUCCESS"`.
2. [x] Tạo/điều chỉnh seed script.
3. [x] Chạy migrations nếu cần (không cần migration mới).
4. [x] Chạy seed.
5. [ ] Test endpoint provider revenue theo `today`, `week`, `month`, `year`.
