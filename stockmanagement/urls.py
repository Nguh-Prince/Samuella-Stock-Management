from django.contrib import admin
from django.urls import path, include
from  . import views

urlpatterns = [
    path("", views.dashboard, name="dashboard"),
    path("login/", views.login_view, name="login"),
    path("admin/", admin.site.urls),
    path('managepurchaseorder/', include("managepurchaseorder.urls")),
    path('managestock/', include("managestock.urls")),
    path('manageusers/', include("manageusers.urls"))
]
