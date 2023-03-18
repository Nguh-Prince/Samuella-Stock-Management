from django.db import models

from managestock.models import Equipment
from manageusers.models import Structure

class Order(models.Model):
    orderId=models.IntegerField(primary_key=True)
    orderEquipmentId=models.ForeignKey(Equipment, on_delete=models.CASCADE)
    orderUnitPrice=models.IntegerField(max_length=10)
    def __str__(self):
        return str(self.orderId)
    
class PurchaseOrder(models.Model):
    purchaseorderId=models.IntegerField(primary_key=True)
    purchaseorderOrderId=models.ForeignKey(Order, on_delete=models.CASCADE)
    structureId=models.ForeignKey(Structure, on_delete=models.CASCADE)
    dateCreated=models.DateField(max_length=10)
    def __str__(self):
        return str(self.purchaseorderId)

