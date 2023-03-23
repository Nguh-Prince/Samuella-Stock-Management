from rest_framework import serializers

from managepurchaseorder.serializers import PurchaseOrderSerializer
from managestock.serializers import DischargeSerializer

from manageusers import models

class StructureDetailSerializer(serializers.ModelSerializer):
    purchase_orders = PurchaseOrderSerializer(many=True)
    discharges = DischargeSerializer(many=True)

    class Meta:
        model = models.Structure
        fields = ("structureId", "structureName", "structureAddress", 
        "structureNature", "purchase_orders", "discharges")