import logging
from django.shortcuts import render

from rest_framework import viewsets
from rest_framework import permissions as drf_permissions

from common.permissions import IsEmployeeReadOnlyOrNotAllowed, ModelPermission, IsAuthenticatedAndReadOnly

from . import models, serializers

# Create your views here.
def home(request):
    return render(request, "manageusers.html")

class StructureViewSet(viewsets.ModelViewSet):
    serializer_class = serializers.StructureSerializer
    queryset = models.Structure.objects.all()
    permission_classes = [IsAuthenticatedAndReadOnly, ]

class EmployeeViewSet(viewsets.ModelViewSet):
    serializer_class = serializers.EmployeeSerializer
    queryset = models.Structure.objects.all()
    permission_classes = [ModelPermission, IsEmployeeReadOnlyOrNotAllowed, ]

    STRUCTURE_LOOKUP_KWARG = "parent_lookup_structure"

    @property
    def structure(self) -> models.Structure:
        if self.STRUCTURE_LOOKUP_KWARG in self.kwargs:
            structureId = self.kwargs[self.STRUCTURE_LOOKUP_KWARG]

            try:
                return models.Structure.objects.get(id=structureId)
            except models.Structure.DoesNotExist as e:
                logging.error(f"No structure exists with id {structureId}")
                return None
        
        return None

    def get_queryset(self):
        if self.STRUCTURE_LOOKUP_KWARG in self.kwargs and self.structure:
            return self.structure.employees.all()

        return super().get_queryset()

    