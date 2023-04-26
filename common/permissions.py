import copy

from django.contrib.auth.models import User

from rest_framework import permissions
from managestock.models import Discharge

from manageusers.models import Employee, Structure

class ModelPermission(permissions.DjangoModelPermissions):
    def __init__(self):
        self.perms_map = copy.deepcopy(self.perms_map)
        self.perms_map["GET"] = ["%(app_label)s.view_%(model_name)s"]

class IsAuthenticatedAndReadOnly(permissions.IsAuthenticated):
    def has_permission(self, request, view):
        return request.method in permissions.SAFE_METHODS

class IsEmployee(permissions.IsAuthenticated):
    def has_permission(self, request, view):
        if request.user.is_superuser:
            return True
            
        return Employee.objects.filter(user=request.user)

class IsStockManagerOrNotAllowed(IsEmployee):
    def has_permission(self, request, view):
        if request.user.is_superuser:
            return True

        is_employee = super().has_permission(request, view)

        if not is_employee:
            return is_employee

        return Employee.objects.filter(user=request.user, isStockManager=True).exists()

class IsHeadOfDepartmentOrNotAllowed(IsEmployee):
    def has_permission(self, request, view):
        if request.user.is_superuser:
            return True

        is_employee = super().has_permission(request, view)

        if not is_employee:
            return is_employee
            
        return Structure.objects.filter(head__user=request.user).exists()

    def has_object_permission(self, request, view, obj):
        return super().has_object_permission(request, view, obj)

class IsEmployeeReadOnlyOrNotAllowed(IsEmployee):
    """
    Provides read-only permissions for employees and denies access to non-employees
    """
    def has_permission(self, request, view):
        if request.user.is_superuser:
            return True

        return Employee.objects.filter(user=request.user).exists() and request.method in permissions.SAFE_METHODS

class IsHeadOfDepartmentOrIsStockManagerOrNotAllowed(IsEmployee):
    def has_permission(self, request, view):
        if request.user.is_superuser:
            return True

        is_employee = super().has_permission(request, view)

        if not is_employee:
            return is_employee
            
        return request.user.employee.isStockManager or request.user.employee.is_structure_head()

class IsStockManagerOrIsHeadOfDepartmentReadOnlyOrNotAllowed(IsEmployee):
    """
    Stock manager has full access, department head can only read, everyone else is unauthorized
    """
    def has_permission(self, request, view):
        if request.user.is_superuser:
            return True

        is_employee = super().has_permission(request, view)

        if not is_employee:
            return is_employee
            
        employee = request.user.employee

        if employee.isStockManager:
            return True

        elif employee.is_structure_head() and request.method in permissions.SAFE_METHODS:
            return True

        return False

    def has_object_permission(self, request, view, obj):
        """
        Stock manager can read all discharges
        HODs can only read discharges given to their departments
        """
        if request.user.is_superuser:
            return True

        employee = request.user.employee

        if employee.isStockManager:
            return True

        if isinstance(obj, Discharge) and request.method in permissions.SAFE_METHODS:
            return employee.structureId == obj.structureId

        return False

