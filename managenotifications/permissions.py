from rest_framework import permissions

from . import views

class IsAuthenticatedAndReadOnly(permissions.IsAuthenticated):
    def has_permission(self, request, view):
        if isinstance(view, views.NotificationViewSet) and view.action not in ["mark_as_read", "mark_as_seen"]:
            return request.method in permissions.SAFE_METHODS
        else:
            return True