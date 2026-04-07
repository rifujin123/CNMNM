from rest_framework import permissions
from rest_framework.permissions import BasePermission


class IsProvider(BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and getattr(request.user, 'is_provider', False)
        )


class IsApprovedProvider(BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and getattr(request.user, 'is_provider', False)
            and getattr(request.user, 'is_approved', False)
        )


class IsApprovedProviderOrAdmin(BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and (
                request.user.is_staff
                or (
                    getattr(request.user, 'is_provider', False)
                    and getattr(request.user, 'is_approved', False)
                )
            )
        )


class TourPackageOwner(permissions.IsAuthenticated):
    def has_object_permission(self, request, view, tour_package):
        return super().has_permission(request, view) and (
            request.user.is_staff or tour_package.tour.provider_id == request.user.id
        )

class ServiceOwner(permissions.IsAuthenticated):
    def has_object_permission(self, request, view, service):
        return super().has_permission(request, view) and service.provider_id == request.user.id


class ServiceOwnerOrAdmin(permissions.IsAuthenticated):
    def has_object_permission(self, request, view, service):
        return super().has_permission(request, view) and (
            request.user.is_staff or service.provider_id == request.user.id
        )