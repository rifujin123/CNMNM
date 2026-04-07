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


class TourPackageOwner(BasePermission):
    message = 'Bạn không có quyền thao tác TourPackage này.'

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)

    def has_object_permission(self, request, view, obj):
        if request.user.is_staff:
            return True
        return bool(
            getattr(request.user, 'is_provider', False)
            and obj.tour.provider_id == request.user.id
        )