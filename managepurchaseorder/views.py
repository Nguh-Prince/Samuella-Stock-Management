from django.shortcuts import render
from django.contrib.auth.decorators import login_required

from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from common.permissions import IsHeadOfDepartmentOrIsStockManagerOrNotAllowed
from managestock.models import Equipment

from manageusers.models import Structure

from common.viewsets import DepartmentSpecificViewSet, MultipleSerializerViewSet

from . import models, serializers

@login_required
def home(request):
    context = {'structures': Structure.objects.all(), 'equipments': Equipment.objects.all()}
    return render(request, "managepurchaseorder/managepurchaseorder.html", context=context)

class PurchaseOrderViewSet(viewsets.ModelViewSet, MultipleSerializerViewSet, DepartmentSpecificViewSet):
    serializer_class = serializers.PurchaseOrderSerializer
    queryset = models.PurchaseOrder.objects.all()
    permission_classes = [IsHeadOfDepartmentOrIsStockManagerOrNotAllowed,]

    serializer_classes = {
        'list': serializers.PurchaseOrderListSerializer,
        'delete_many': serializers.ListOfPurchaseOrderIdsSerializer
    }

    STRUCTURE_LOOKUP_KWARG = "parent_lookup_structure"

    def get_queryset(self):
        queryset = self.queryset#.order_by('-dateCreated')

        if not self.request.user.is_superuser and not self.request.user.employee.isStockManager and self.request.user.employee.is_structure_head():
            queryset = queryset.filter(structureId=self.request.user.employee.structureId)

        return queryset

    def create(self, request, *args, **kwargs):
        serializer: serializers.PurchaseOrderSerializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        purchase_order = serializer.create(serializer.validated_data)

        return Response( serializers.PurchaseOrderListSerializer(purchase_order).data, status=status.HTTP_201_CREATED )

    @action(
        methods=['DELETE'],
        detail=False
    )
    def delete_many(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        dataToReturn = self.serializer_class(serializer.validated_data['data'], many=True).data

        for purchaseOrder in serializer.validated_data['data']:
            purchaseOrder.delete()

        return Response(dataToReturn)