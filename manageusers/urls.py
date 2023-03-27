from django.urls import path

from rest_framework_extensions.routers import NestedRouterMixin

from rest_framework import routers

from . import views

class NestedDefaultRouter(NestedRouterMixin, routers.DefaultRouter):
    pass

router = NestedDefaultRouter()

structure_routes = router.register("structures", views.StructureViewSet, basename="structures")
structure_routes.register(
    "employees", 
    views.EmployeeViewSet,
    basename="structure-employees",
    parents_query_lookups=["structure"]
)

employee_routes = router.register("employees", views.EmployeeViewSet, basename="employees")

app_name = "manageusers"

urlpatterns=[
    path("manageusers/", views.home, name="manageusers_home")
] + router.urls