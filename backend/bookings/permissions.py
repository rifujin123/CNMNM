from rest_framework import permissions

class IsBookingOwner(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return bool(
            request.user
            and request.user.is_authenticated
            and obj.user_id == request.user.id
        )
    
class IsBookingProvider(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return bool(
            request.user
            and request.user.is_authenticated
            and getattr(request.user, 'is_provider', False)
            and getattr(request.user, 'is_approved', False)
            and obj.service.provider_id == request.user.id
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
    