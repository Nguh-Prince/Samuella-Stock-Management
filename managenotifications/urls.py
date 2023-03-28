from django.urls import path

from rest_framework_extensions.routers import NestedRouterMixin

from rest_framework import routers

from . import views

class NestedDefaultRouter(NestedRouterMixin, routers.DefaultRouter):
    pass

router = NestedDefaultRouter()

notification_routes = router.register("notifications", views.NotificationViewSet)

app_name = "managenotifications"

urlpatterns = router.urls