from rest_framework import permissions

class IsBookingOwnerOrAdmin(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        is_admin = user.is_staff or user.is_superuser
        is_owner = getattr(user, 'is_customer', False) and obj.user_id == user.id

        return is_admin or is_owner

class IsBookingCustomerOrAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        user = request.user
        return bool(
            user
            and user.is_authenticated
            and (
                user.is_staff
                or user.is_superuser
                or getattr(user, 'is_customer', False)
            )
        )
    
class IsBookingOwnerProviderOrAdmin(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        is_admin = user.is_staff or user.is_superuser
        is_owner = (user.is_customer and obj.user_id == user.id)
        is_provider_owner = (user.is_provider and user.is_approved and obj.service.provider_id == user.id)

        return is_admin or is_owner or is_provider_owner

class IsBookingProviderOwnerOrAdmin(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        is_admin = user.is_staff or user.is_superuser
        is_provider_owner = (
            getattr(user, 'is_provider', False)
            and getattr(user, 'is_approved', False)
            and obj.service.provider_id == user.id
        )

        return is_admin or is_provider_owner