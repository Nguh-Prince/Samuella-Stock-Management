from django.urls import path

from rest_framework_extensions.routers import NestedRouterMixin

from rest_framework import routers

from . import views

class NestedDefaultRouter(NestedRouterMixin, routers.DefaultRouter):
    pass

router = NestedDefaultRouter()

equipment_routes = router.register("equipments", views.EquipmentViewSet, basename="equipments")

urlpatterns=[
    path("managestock", views.home, name="managestock_home")
] + router.urls