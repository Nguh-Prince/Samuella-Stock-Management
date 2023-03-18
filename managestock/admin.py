from django.contrib import admin

from managestock.models import Stock, Equipment


admin.site.register(Stock)
admin.site.register(Equipment)