import copy

from django.contrib.auth.models import User

from rest_framework import permissions

from manageusers.models import Employee, Structure

class ModelPermission(permissions.DjangoModelPermissions):
    def __init__(self):
        self.perms_map = copy.deepcopy(self.perms_map)
        self.perms_map["GET"] = ["%(app_label)s.view_%(model_name)s"]

class IsStockManagerOrNotAllowed(permissions.BasePermission):
    def has_permission(self, request, view):
        return Employee.objects.filter(user=request.user, isStockManager=True).exists()

class IsHeadOfDepartmentOrNotAllowed(permissions.BasePermission):
    def has_permission(self, request, view):
        return Structure.objects.filter(head__user=request.user).exists()

    def has_object_permission(self, request, view, obj):
        return super().has_object_permission(request, view, obj)

class IsEmployeeReadOnlyOrNotAllowed(permissions.IsAuthenticated):
    """
    Provides read-only permissions for employees and denies access to non-employees
    """
    def has_permission(self, request, view):
        return Employee.objects.filter(user=request.user).exists() and request.method in permissions.SAFE_METHODS

class IsHeadOfDepartmentOrIsStockManagerOrNotAllowed(permissions.IsAuthenticated):
    def has_permission(self, request, view):
        
        return super().has_permission(request, view)