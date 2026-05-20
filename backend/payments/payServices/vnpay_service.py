import hashlib
import hmac
from urllib.parse import urlencode
from zoneinfo import ZoneInfo

from django.conf import settings
from django.utils import timezone

from payments.models import Payment
from .payment_service import PaymentLifecycleService


class VnPayPaymentService:

    @classmethod
    def create_payment(cls, payment, request):
        params = cls._build_payment_params(payment, request)
        secure_hash = cls._make_secure_hash(params)

        payment_url = (
            f"{settings.VNPAY_PAYMENT_URL}"
            f"?{urlencode(params)}"
            f"&vnp_SecureHash={secure_hash}"
        )

        payment.payment_status = Payment.PaymentStatus.PROCESSING
        payment.payment_url = payment_url
        payment.metadata = {
            **(payment.metadata or {}),
            "gateway": "VNPAY",
            "gateway_status": "created",
            "vnpay_params": params,
        }

        payment.save(update_fields=[
            "payment_status",
            "payment_url",
            "metadata",
            "updated_at",
        ])

        return payment
    
    @classmethod
    def _build_payment_params(cls, payment, request):
        vietnam_tz = ZoneInfo("Asia/Ho_Chi_Minh")
        now = timezone.now().astimezone(vietnam_tz)
        expire_at = payment.expires_at.astimezone(vietnam_tz)

        return {
            "vnp_Version": "2.1.0",
            "vnp_Command": "pay",
            "vnp_TmnCode": settings.VNPAY_TMN_CODE,
            "vnp_Amount": str(int(payment.amount * 100)),
            "vnp_CurrCode": "VND",
            "vnp_TxnRef": payment.transaction_id,
            "vnp_OrderInfo": f"Thanh toan booking {payment.booking_id}",
            "vnp_OrderType": "other",
            "vnp_Locale": "vn",
            "vnp_ReturnUrl": settings.VNPAY_RETURN_URL,
            "vnp_IpAddr": request.META.get("REMOTE_ADDR", "127.0.0.1"),
            "vnp_CreateDate": now.strftime("%Y%m%d%H%M%S"),
            "vnp_ExpireDate": expire_at.strftime("%Y%m%d%H%M%S"),
        }
    
    @classmethod
    def _make_secure_hash(cls, params):
        sorted_params = sorted(params.items())
        hash_data = urlencode(sorted_params)

        return hmac.new(
            settings.VNPAY_HASH_SECRET.encode(),
            hash_data.encode(),
            hashlib.sha512,
        ).hexdigest()
    
    @classmethod
    def handle_ipn(cls, query_params):
        data = query_params.dict()

        if not cls._verify_signature(data):
            return {
                "RspCode": "97",
                "Message": "Invalid signature",
            }

        if data.get("vnp_TmnCode") != settings.VNPAY_TMN_CODE:
            return {
                "RspCode": "02",
                "Message": "Invalid merchant",
            }

        payment = Payment.objects.filter(
            transaction_id=data.get("vnp_TxnRef"),
            payment_method=Payment.PaymentMethod.VNPAY,
        ).first()

        if not payment:
            return {
                "RspCode": "01",
                "Message": "Order not found",
            }

        if str(int(payment.amount * 100)) != str(data.get("vnp_Amount")):
            return {
                "RspCode": "04",
                "Message": "Invalid amount",
            }

        response_code = data.get("vnp_ResponseCode")
        transaction_status = data.get("vnp_TransactionStatus")

        if response_code == "00" and transaction_status == "00":
            PaymentLifecycleService.mark_success(
                payment,
                provider_transaction_id=data.get("vnp_TransactionNo"),
                gateway="VNPAY",
                raw_payload=data,
            )

        elif response_code == "24":
            PaymentLifecycleService.cancel_payment(
                payment,
                gateway="VNPAY",
                raw_payload=data,
            )

        elif response_code == "11":
            PaymentLifecycleService.expire_payment(
                payment,
                gateway="VNPAY",
                raw_payload=data,
            )

        elif response_code == "07" or transaction_status == "07":
            PaymentLifecycleService.mark_review(
                payment,
                gateway="VNPAY",
                raw_payload=data,
            )

        else:
            PaymentLifecycleService.mark_failed(
                payment,
                gateway="VNPAY",
                raw_payload=data,
            )

        return {
            "RspCode": "00",
            "Message": "Confirm Success",
        }
    
    @classmethod
    def _verify_signature(cls, data):
        received = data.get("vnp_SecureHash")

        clean_data = {
            key: value
            for key, value in data.items()
            if key not in ["vnp_SecureHash", "vnp_SecureHashType"]
            and value not in [None, ""]
        }

        expected = cls._make_secure_hash(clean_data)

        return hmac.compare_digest(expected, received or "")
    
    @classmethod
    def get_payment_from_return(cls, query_params):
        return Payment.objects.get(
            transaction_id=query_params.get("vnp_TxnRef")
        )
