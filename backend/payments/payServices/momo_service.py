import base64
import hashlib
import hmac
import json
import requests

from django.conf import settings
from rest_framework.exceptions import ValidationError

from payments.models import Payment
from .payment_service import PaymentLifecycleService

class MoMoPaymentService:
    CANCELLED_RESULT_CODES = {"1003", "1006"}
    EXPIRED_RESULT_CODES = {"1005"}

    @classmethod
    def create_payment(cls, payment, request):
        amount = str(int(payment.amount))
        order_id = payment.transaction_id
        request_id = payment.transaction_id
        order_info = f"Thanh toan booking {payment.booking_id}"
        extra_data = base64.b64encode(
            json.dumps({"payment_id": payment.id, "booking_id": payment.booking_id}).encode()
        ).decode()

        payload = {
            "partnerCode": settings.MOMO_PARTNER_CODE,
            "accessKey": settings.MOMO_ACCESS_KEY,
            "requestId": request_id,
            "amount": amount,
            "orderId": order_id,
            "orderInfo": order_info,
            "redirectUrl": settings.MOMO_REDIRECT_URL,
            "ipnUrl": settings.MOMO_IPN_URL,
            "extraData": extra_data,
            "requestType": "captureWallet",
            "lang": "vi",
        }

        payload["signature"] = cls._make_create_signature(payload)

        response = requests.post(settings.MOMO_ENDPOINT, json=payload, timeout=15)
        data = response.json()

        if response.status_code >= 400 or str(data.get("resultCode")) != "0":
            raise ValidationError(data.get("message") or "Không tạo được thanh toán MoMo.")

        payment.payment_status = Payment.PaymentStatus.PROCESSING
        payment.payment_url = data.get("payUrl")
        payment.provider_transaction_id = str(data.get("transId") or "")
        payment.metadata = {
            **(payment.metadata or {}),
            "gateway": "MOMO",
            "gateway_status": "created",
            "gateway_links": {
                "payUrl": data.get("payUrl"),
                "deeplink": data.get("deeplink"),
                "qrCodeUrl": data.get("qrCodeUrl"),
            },
            "momo_request": payload,
            "momo_response": data,
        }
        payment.save(update_fields=["payment_status", "payment_url", "provider_transaction_id", "metadata", "updated_at"])

        return payment
    
    @classmethod
    def _make_create_signature(cls, payload):
        raw = (
            f"accessKey={settings.MOMO_ACCESS_KEY}"
            f"&amount={payload['amount']}"
            f"&extraData={payload['extraData']}"
            f"&ipnUrl={payload['ipnUrl']}"
            f"&orderId={payload['orderId']}"
            f"&orderInfo={payload['orderInfo']}"
            f"&partnerCode={payload['partnerCode']}"
            f"&redirectUrl={payload['redirectUrl']}"
            f"&requestId={payload['requestId']}"
            f"&requestType={payload['requestType']}"
        )

        return hmac.new(
            settings.MOMO_SECRET_KEY.encode(),
            raw.encode(),
            hashlib.sha256,
        ).hexdigest()
    
    @classmethod
    def handle_ipn(cls, data):
        if not cls._verify_ipn_signature(data):
            raise ValidationError("Invalid MoMo signature")

        if data.get("partnerCode") != settings.MOMO_PARTNER_CODE:
            raise ValidationError("Invalid MoMo partnerCode")

        payment = (
            Payment.objects
            .select_related("booking")
            .filter(
                transaction_id=data.get("orderId"),
                payment_method=Payment.PaymentMethod.MOMO,
            )
            .first()
        )

        if not payment:
            raise ValidationError("MoMo payment not found")

        if str(int(payment.amount)) != str(data.get("amount")):
            raise ValidationError("Invalid MoMo amount")

        result_code = str(data.get("resultCode"))
        provider_transaction_id = str(data.get("transId") or "")

        if result_code == "0":
            return PaymentLifecycleService.mark_success(
                payment,
                provider_transaction_id=provider_transaction_id,
                gateway="MOMO",
                raw_payload=data,
            )

        if result_code in cls.CANCELLED_RESULT_CODES:
            return PaymentLifecycleService.cancel_payment(
                payment,
                gateway="MOMO",
                raw_payload=data,
            )

        if result_code in cls.EXPIRED_RESULT_CODES:
            return PaymentLifecycleService.expire_payment(
                payment,
                gateway="MOMO",
                raw_payload=data,
            )

        return PaymentLifecycleService.mark_failed(
            payment,
            gateway="MOMO",
            raw_payload=data,
        )
    
    @classmethod
    def _verify_ipn_signature(cls, data):
        received = data.get("signature")

        raw = (
            f"accessKey={settings.MOMO_ACCESS_KEY}"
            f"&amount={data.get('amount')}"
            f"&extraData={data.get('extraData')}"
            f"&message={data.get('message')}"
            f"&orderId={data.get('orderId')}"
            f"&orderInfo={data.get('orderInfo')}"
            f"&orderType={data.get('orderType')}"
            f"&partnerCode={data.get('partnerCode')}"
            f"&payType={data.get('payType')}"
            f"&requestId={data.get('requestId')}"
            f"&responseTime={data.get('responseTime')}"
            f"&resultCode={data.get('resultCode')}"
            f"&transId={data.get('transId')}"
        )

        expected = hmac.new(
            settings.MOMO_SECRET_KEY.encode(),
            raw.encode(),
            hashlib.sha256,
        ).hexdigest()

        return hmac.compare_digest(expected, received or "")
    
    @classmethod
    def get_payment_from_return(cls, query_params):
        return Payment.objects.get(
            transaction_id=query_params.get("orderId")
        )
