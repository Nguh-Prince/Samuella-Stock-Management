from django.urls import path

from rest_framework_extensions.routers import NestedRouterMixin

from rest_framework import routers

from . import views

class NestedDefaultRouter(NestedRouterMixin, routers.DefaultRouter):
    pass

router = NestedDefaultRouter()

# order_routes = router.register("orders", views.OrderViewSet, basename="orders")

purchaseorder_routes = router.register("purchaseorders", views.PurchaseOrderViewSet, basename="purchaseorders")

app_name = "managepurchaseorder"

urlpatterns=[
    path("", views.home, name="managepurchaseorder_home")
] + router.urls