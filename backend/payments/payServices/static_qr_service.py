from urllib.parse import urlencode

from django.conf import settings
from rest_framework.exceptions import ValidationError


def get_static_qr_config():
    if not settings.STATIC_QR_BANK_CODE:
        raise ValidationError("Chua cau hinh ngan hang nhan tien Static QR.")

    if not settings.STATIC_QR_ACCOUNT_NUMBER:
        raise ValidationError("Chua cau hinh so tai khoan nhan tien Static QR.")

    if not settings.STATIC_QR_ACCOUNT_NAME:
        raise ValidationError("Chua cau hinh ten tai khoan nhan tien Static QR.")

    return {
        "image_base_url": settings.STATIC_QR_IMAGE_BASE_URL.rstrip("/"),
        "bank_code": settings.STATIC_QR_BANK_CODE,
        "account_number": settings.STATIC_QR_ACCOUNT_NUMBER,
        "account_name": settings.STATIC_QR_ACCOUNT_NAME,
        "template": settings.STATIC_QR_TEMPLATE or "compact2",
    }


def build_static_qr_url(payment):
    config = get_static_qr_config()

    query = urlencode({
        "amount": int(payment.amount),
        "addInfo": payment.transaction_id,
        "accountName": config["account_name"],
    })

    return (
        f"{config['image_base_url']}/"
        f"{config['bank_code']}-{config['account_number']}-{config['template']}.png"
        f"?{query}"
    )


def build_static_qr_metadata(payment):
    config = get_static_qr_config()
    qr_url = build_static_qr_url(payment)

    return {
        "gateway": "STATIC_QR",
        "gateway_status": "qr_created",
        "receiver": "PLATFORM",
        "qr_provider": "VIETQR",
        "qr_url": qr_url,
        "receiver_bank_code": config["bank_code"],
        "receiver_account_number": config["account_number"],
        "receiver_account_name": config["account_name"],
        "qr_template": config["template"],
        "transfer_content": payment.transaction_id,
        "amount": str(payment.amount),
        "booking_id": payment.booking_id,
        "service_provider_id": getattr(payment.booking.service, "provider_id", None),
    }