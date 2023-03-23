from django.contrib import admin

from managestock.models import Stock, Equipment, Supplier


admin.site.register(Stock)
admin.site.register(Equipment)
admin.site.register(Supplier)