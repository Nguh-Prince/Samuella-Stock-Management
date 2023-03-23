from django.contrib.auth.decorators import login_required
from django.shortcuts import render

from rest_framework import status, viewsets
from rest_framework.response import Response

from common.viewsets import MultipleSerializerViewSet
from manageusers.models import Structure

from . import models, serializers

@login_required
def home(request):
    context = {
        'suppliers': models.Supplier.objects.all(),
        'equipments': models.Equipment.objects.all(),
        'structures': Structure.objects.all()
    }
    return render(request, "managestock/managestock.html", context=context)

def suppliers(request):
    return render(request, "managestock/managesuppliers.html")

def entries(request):
    return render(request, "managestock/manageentries.html")

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

class StockViewSet(viewsets.ModelViewSet, MultipleSerializerViewSet):
    serializer_class = serializers.StockSerializer
    queryset = models.Stock.objects.all()

    serializer_classes = {
        'list': serializers.StockDetailSerializer
    }

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()

        # delete the equipments one by one to trigger the delete method of each instance
        for equipment in instance.equipments.all():
            equipment.delete()

        return super().destroy(request, *args, **kwargs)

class DischargeViewSet(viewsets.ModelViewSet, MultipleSerializerViewSet):
    serializer_class = serializers.DischargeSerializer
    queryset = models.Discharge.objects.all()
    serializer_classes = {
        'list': serializers.DischargeListSerializer
    }

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()

        for equipment in instance.equipments.all():
            equipment.delete()

        return super().destroy(request, *args, **kwargs)

class SupplierViewSet(viewsets.ModelViewSet, MultipleSerializerViewSet):
    serializer_classes = {
        'create': serializers.AddSuppliersSerializer
    }
    serializer_class = serializers.SupplierSerializer
    queryset = models.Supplier.objects.all()

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, *args, **kwargs)
        serializer.is_valid(raise_exception=True)

        suppliers = serializer.create(serializer.validated_data)

        return Response(data=self.serializer_class(suppliers, many=True).data, status=status.HTTP_201_CREATED)