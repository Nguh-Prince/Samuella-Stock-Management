from django.shortcuts import render

from rest_framework import status, viewsets
from rest_framework.response import Response

from common.viewsets import MultipleSerializerViewSet

from . import models, serializers

# Create your views here.
def home(request):
    return render(request, "managestock/managestock.html")

class EquipmentViewSet(viewsets.ModelViewSet, MultipleSerializerViewSet):
    serializer_classes = {
        "create": serializers.AddEquipmentsSerializer
    }
    serializer_class = serializers.EquipmentSerializer
    queryset = models.Equipment.objects.all()

    def create(self, request, *args, **kwargs):
        serializer: serializers.AddEquipmentsSerializer = self.get_serializer(data=request.data, *args, **kwargs)
        serializer.is_valid(raise_exception=True)
        equipments = serializer.create(serializer.validated_data)

        return Response(data=self.serializer_class(equipments, many=True).data, status=status.HTTP_201_CREATED)

class StockViewSet(viewsets.ModelViewSet):
    serializer_class = serializers.StockSerializer
    queryset = models.Stock.objects.all()