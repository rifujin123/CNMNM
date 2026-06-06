from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    """User model with role-based access control."""

    email = models.EmailField(unique=True)
    avatar = models.ImageField(upload_to='profiles/', blank=True)
    date_of_birth = models.DateField(null=True, blank=True)

    # Role flags
    is_customer = models.BooleanField(default=True)
    is_provider = models.BooleanField(default=False)
    is_admin = models.BooleanField(default=False)
    is_approved = models.BooleanField(default=False)  # For provider approval

    class Meta:
        pass


class ProviderProfile(models.Model):
    """Provider business profile for verification."""

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='provider_profile')
    business_name = models.CharField(max_length=255)
    business_license = models.ImageField(upload_to='licenses/')
    tax_code = models.CharField(max_length=20)
    is_verified = models.BooleanField(default=False)
    rejection_reason = models.TextField(blank=True)
    verified_at = models.DateTimeField(null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.business_name} ({self.user.username})"