from rest_framework.permissions import BasePermission


class IsCustomer(BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user and request.user.is_authenticated
            and getattr(request.user, 'is_customer', False)
        )


class IsProvider(BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user and request.user.is_authenticated
            and getattr(request.user, 'is_provider', False)
        )


class IsApprovedProvider(BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user and request.user.is_authenticated
            and getattr(request.user, 'is_provider', False)
            and getattr(request.user, 'is_approved', False)
        )


class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user and request.user.is_authenticated
            and (request.user.is_staff or getattr(request.user, 'is_admin', False))
        )


# UC27 - Admin user management permission
class IsSuperAdmin(BasePermission):
    """Only superuser can manage all users (including other admins)."""

    def has_permission(self, request, view):
        return bool(
            request.user and request.user.is_authenticated
            and request.user.is_superuser
        )
