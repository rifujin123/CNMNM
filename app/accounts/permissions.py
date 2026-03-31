from rest_framework import permissions

class IsCustomer(permissions.BasePermission):
    pass

class IsProvider(permissions.BasePermission):
    pass

class IsApprovedProvider(permissions.BasePermission):
    pass
