from django.urls import path
from . import views

urlpatterns=[
    path("manageusers", views.home, name="manageusers_home")
]