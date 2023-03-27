from django.contrib import admin

from manageusers.models import Employee, Users, Structure


admin.site.register(Users)
admin.site.register(Structure)
admin.site.register(Employee)