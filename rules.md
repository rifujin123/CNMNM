always thinking in low effort do not over engineering and clean code.
whenever do something new always looks back business core @KMTravel/business_core.md

# Django REST Framework (DRF) View Selection Rules

Mục đích: định hướng chọn đúng loại View Class dựa trên bản chất tính năng (Business Logic).

---

## 🛑 BẢNG TRA CỨU NHANH

| Loại Tính Năng | Loại View Phải Chọn | Lý Do |
| :--- | :--- | :--- |
| Hành động hệ thống, Thanh toán, Auth, Logic đặc biệt phi CRUD | `APIView` | Không phụ thuộc Model QuerySet tuần túy |
| CRUD đơn lẻ, độc lập, cần phân quyền nghiêm ngặt | `Concrete View Classes` | Tối giản code, kiểm soát chặt chẽ Endpoint |
| Một thực thể chính quản lý nhiều hành động con (Custom Actions) | `GenericViewSet` | Gom nhóm logic, tối ưu Nested Routing |

---

## 1. Khi nào chọn `APIView`

Tính chất: **Hành động hệ thống**, xử lý logic thuần túy, tích hợp bên thứ ba.

* **Áp dụng cho:**
  * Login, Register, OTP verification
  * Payment callbacks (VnPay, MoMo, Stripe)
  * OAuth2 token exchange
  * Webhook handlers

* **Quy định:** Không khai báo `queryset` hay `serializer_class` ở class level nếu data vào/ra phức tạp.

---

## 2. Khi nào chọn `Concrete View Classes`

Tính chất: **CRUD độc lập**, thực hiện thao tác tiêu chuẩn trên một bảng.

* **Các Class được phép dùng:**
  - `ListAPIView`, `CreateAPIView`, `RetrieveAPIView`
  - `UpdateAPIView`, `DestroyAPIView`
  - `ListCreateAPIView`, `RetrieveUpdateDestroyAPIView`
  - `RetrieveUpdateAPIView`

* **Áp dụng cho:**
  - Category list (public)
  - User profile update (self)
  - Service detail view
  - Promo banner management

* **Quy định:** Tách riêng file cho role khác nhau nếu cần phân quyền khác nhau.

---

## 3. Khi nào chọn `GenericViewSet`

Tính chất: **Một thực thể chính** quản lý nhiều hành động con.

* **Áp dụng cho:**
  - `TourCommentViewSet`: comments của tour, wishlist actions
  - `ChatViewSet`: room management, message actions
  - `BookingViewSet`: cancel, confirm, refund, review actions

* **Quy định:**
  - ❌ Cấm dùng `ModelViewSet` (sinh API thừa)
  - ✅ Dùng `GenericViewSet` + `@action(detail=True/False)`
  - ✅ Cấu hình `DefaultRouter` trong `urls.py`

---

## ⚠️ QUY ĐỊNH BẮT BUỘC VỀ HIỆU NĂNG

Khi trả về danh sách dữ liệu liên kết bảng, BẮT BUỘC:
1. `.select_related()` cho `ForeignKey` (1-Nhiều, chiều xuôi)
2. `.prefetch_related()` cho `ManyToMany` hoặc chiều ngược (`related_name`)
3. Không để xảy ra N+1 Query

---

## 4. Authorization

Tạo permission class trong `perms.py` — không scatter role checks trong views.

* **Các pattern phổ biến:**
  - `IsAdmin` — staff hoặc is_admin flag
  - `IsApprovedProvider` — provider + approved
  - `IsServiceOwner` — owner check cho service

---

## 5. Serializer Pattern

Tách read/write serializer riêng:
- `XxxReadSerializer` — fields hiển thị, computed fields
- `XxxWriteSerializer` — fields write, validation

Không gộp chung một serializer.