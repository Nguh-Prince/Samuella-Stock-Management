from django.contrib import admin

from managepurchaseorder.models import PurchaseOrder, Order


admin.site.register(PurchaseOrder)
admin.site.register(Order)