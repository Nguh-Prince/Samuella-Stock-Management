from django.core.exceptions import ImproperlyConfigured
from django.utils.translation import gettext as _

from rest_framework import viewsets


class MultipleSerializerViewSet(viewsets.GenericViewSet):
    serializer_classes = {

    }
    
    def get_serializer_class(self):
        if not isinstance(self.serializer_classes, dict):
            raise ImproperlyConfigured(_("serializer_classes variable must be a dict mapping"))

        if self.action in self.serializer_classes.keys():
            return self.serializer_classes[self.action]
        
        return super().get_serializer_class()

class DepartmentSpecificViewSet(viewsets.GenericViewSet):
    def get_queryset(self):
        queryset = self.queryset

        if not self.request.user.is_superuser and not self.request.user.employee.isStockManager and self.request.user.employee.is_structure_head():
            queryset = queryset.filter(structureId=self.request.user.employee.structureId)

        return queryset