from django.db import models
from django.conf import settings


class ProviderRevenue(models.Model):
    """Revenue statistics for providers."""

    class Period(models.TextChoices):
        MONTH = 'month', 'Month'
        QUARTER = 'quarter', 'Quarter'
        YEAR = 'year', 'Year'

    provider = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='revenues'
    )
    period = models.CharField(max_length=20, choices=Period.choices)
    period_value = models.CharField(max_length=20)  # e.g., "2024-06" or "Q1-2024"
    total_bookings = models.PositiveIntegerField(default=0)
    total_revenue = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    service_breakdown = models.JSONField(default=dict)
    calculated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['provider', 'period', 'period_value']
        ordering = ['-period_value']

    def __str__(self):
        return f"{self.provider.username} - {self.period}: {self.period_value}"


class ChatRoom(models.Model):
    """Chat room between provider and customer."""

    provider = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='chat_rooms_as_provider'
    )
    customer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='chat_rooms_as_customer'
    )
    booking = models.ForeignKey(
        'bookings.Booking',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='chat_rooms'
    )
    last_message_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['provider', 'customer']
        ordering = ['-last_message_at', '-created_at']

    def __str__(self):
        return f"Chat: {self.provider.username} ↔ {self.customer.username}"


class Message(models.Model):
    """Chat message in a chat room."""

    room = models.ForeignKey('ChatRoom', on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='messages'
    )
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"{self.sender.username}: {self.message[:50]}"