from django.db import models

# from simple_history.models import HistoricalRecords

from managestock.models import Equipment
from manageusers.models import Structure

class PurchaseOrder(models.Model):
    purchaseorderId = models.AutoField(primary_key=True)
    structureId: Structure = models.ForeignKey(Structure, on_delete=models.CASCADE, related_name="purchase_orders")
    dateCreated = models.DateField(max_length=10)
    # history = HistoricalRecords()

    def __str__(self):
        return f"{self.structureId.structureName}: {str(self.dateCreated)}"

class PurchaseOrderEquipment(models.Model):
    purchaseOrderEquipmentId = models.AutoField(primary_key=True)
    purchaseOrderId = models.ForeignKey(PurchaseOrder, related_name="equipments", on_delete=models.CASCADE)
    equipmentId = models.ForeignKey(Equipment, on_delete=models.CASCADE)
    quantity = models.IntegerField()
    # history = HistoricalRecords()