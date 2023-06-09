from django.urls import path

from rest_framework_extensions.routers import NestedRouterMixin

from rest_framework import routers

from . import views

class NestedDefaultRouter(NestedRouterMixin, routers.DefaultRouter):
    pass

router = NestedDefaultRouter()

equipment_routes = router.register("equipments", views.EquipmentViewSet, basename="equipments")

stock_routes = router.register("stocks", views.StockViewSet, basename="stocks")

discharge_routes = router.register("discharges", views.DischargeViewSet, basename="discharges")

supplier_routes = router.register("suppliers", views.SupplierViewSet, basename="suppliers")

app_name = "managestock"

urlpatterns=[
    path("", views.home, name="managestock_home")
] + router.urls