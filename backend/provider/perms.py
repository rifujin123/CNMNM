from rest_framework.permissions import BasePermission

class IsProviderOwner(BasePermission):
    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        if user.is_staff:
            return True
        return bool(user.is_provider and user.is_approved)

    def has_object_permission(self, request, view, obj):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        if user.is_staff:
            return True

        provider = getattr(obj,'provider', None)
        if provider is None:
            provider = getattr(getattr(obj, "service",None), "provider",None)

        return provider == user


class IsProviderOrAdmin(BasePermission):
    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        if user.is_staff:
            return True
        return bool(user.is_provider)
