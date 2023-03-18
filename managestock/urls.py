from django.urls import path
from . import views

urlpatterns=[
    path("managestock", views.home, name="managestock_home")
]