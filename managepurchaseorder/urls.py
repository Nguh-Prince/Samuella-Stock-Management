from django.urls import path
from . import views

urlpatterns=[
    path("managepurchaseorder", views.home, name="managepurchaseorder_home")
]