from django.db import models

from managestock.models import Equipment
from manageusers.models import Structure

class PurchaseOrder(models.Model):
    purchaseorderId = models.AutoField(primary_key=True)
    structureId = models.ForeignKey(Structure, on_delete=models.CASCADE, related_name="purchase_orders")
    dateCreated = models.DateField(max_length=10)
    def __str__(self):
        return str(self.purchaseorderId)

class PurchaseOrderEquipment(models.Model):
    purchaseOrderEquipmentId = models.AutoField(primary_key=True)
    purchaseOrderId = models.ForeignKey(PurchaseOrder, related_name="equipments", on_delete=models.CASCADE)
    equipmentId = models.ForeignKey(Equipment, on_delete=models.CASCADE)
    quantity = models.IntegerField()