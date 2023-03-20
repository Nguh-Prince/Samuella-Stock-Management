from django.db import models
from django.utils.translation import gettext as _

class Equipment(models.Model):
    equipmentId = models.AutoField(primary_key=True)
    equipmentName = models.CharField(max_length=100, unique=True)
    quantity = models.IntegerField(default=0)
    def __str__(self):
        return str(self.equipmentId)

class Supplier(models.Model):
    supplierId = models.AutoField(primary_key=True)
    supplierName = models.CharField(max_length=50)
    supplierLocation = models.CharField(max_length=100)
    supplierDescription = models.TextField(null=True, blank=True)

    def __str__(self) -> str:
        return self.supplierName

class Stock(models.Model):
    stockId = models.AutoField(primary_key=True)
    supplierId = models.ForeignKey(Supplier, on_delete=models.CASCADE, null=True)
    # stockEquipmentId = models.ForeignKey(Equipment, on_delete=models.CASCADE)
    stockDate = models.DateField(max_length=20)
    def __str__(self):
        return str(self.stockId)

class StockEquipment(models.Model):
    stockEquipmentId = models.AutoField(primary_key=True)
    equipmentId = models.ForeignKey(Equipment, on_delete=models.CASCADE)
    quantity = models.IntegerField()
    stockId = models.ForeignKey(Stock, on_delete=models.CASCADE, related_name="equipments")

    class Meta:
        verbose_name = _("Stock equipment")
        verbose_name_plural = _("Stock equipments")
        unique_together = [ ["stockId", "equipmentId"] ]

    def save(self, *args, **kwargs):
        if "force_insert" in kwargs:
            # add the quantity of the equipment in stock by the quantity delivered
            self.equipmentId.quantity += self.quantity
            self.equipmentId.save()