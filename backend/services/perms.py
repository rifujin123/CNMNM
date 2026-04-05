class IsProvider(BasePermission.IsAuthenticated):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_provider

class IsApprovedProvider(BasePermission.IsAuthenticated):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_provider and request.user.is_approved