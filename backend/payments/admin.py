import json

from django.contrib import admin
from django.utils.html import format_html

from .models import Payment


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = [
        "id",
        "transaction_id",
        "booking",
        "user",
        "payment_method",
        "payment_status",
        "amount",
        "currency",
        "provider_transaction_id",
        "created_at",
        "expires_at",
        "paid_at",
    ]

    list_filter = [
        "payment_method",
        "payment_status",
        "created_at",
        ("booking", admin.RelatedOnlyFieldListFilter),
        ("user", admin.RelatedOnlyFieldListFilter),
    ]

    search_fields = [
        "transaction_id",
        "provider_transaction_id",
        "booking__id",
        "user__username",
        "user__email",
    ]

    readonly_fields = [
        "transaction_id",
        "provider_transaction_id",
        "metadata",
        "metadata_pretty",
        "created_at",
        "updated_at",
        "paid_at",
    ]

    fieldsets = [
        (
            "Thong tin giao dich",
            {
                "fields": [
                    "user",
                    "booking",
                    "payment_method",
                    "payment_status",
                    "amount",
                    "currency",
                ]
            },
        ),
        (
            "Gateway",
            {
                "fields": [
                    "transaction_id",
                    "provider_transaction_id",
                    "payment_url",
                    "expires_at",
                    "paid_at",
                ]
            },
        ),
        (
            "Audit metadata",
            {
                "fields": [
                    "metadata_pretty",
                    "metadata",
                ]
            },
        ),
        (
            "Hoan tien",
            {
                "fields": [
                    "refund_amount",
                ]
            },
        ),
        (
            "Thoi gian",
            {
                "fields": [
                    "created_at",
                    "updated_at",
                ]
            },
        ),
    ]

    ordering = ["-created_at"]
    date_hierarchy = "created_at"
    list_select_related = [
        "user",
        "booking",
    ]

    def metadata_pretty(self, obj):
        if not obj.metadata:
            return "-"

        formatted_metadata = json.dumps(
            obj.metadata,
            ensure_ascii=False,
            indent=2,
            sort_keys=True,
        )
        return format_html("<pre>{}</pre>", formatted_metadata)

    metadata_pretty.short_description = "Metadata formatted"
