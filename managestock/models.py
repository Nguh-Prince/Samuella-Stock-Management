from django.db import models
from django.utils.translation import gettext as _

class Equipment(models.Model):
    equipmentId = models.IntegerField(primary_key=True)
    equipmentName = models.CharField(max_length=100, unique=True)
    quantity = models.IntegerField(default=0)
    def __str__(self):
        return str(self.equipmentId)


class Stock(models.Model):
    stockId = models.IntegerField(primary_key=True)
    # stockEquipmentId = models.ForeignKey(Equipment, on_delete=models.CASCADE)
    stockDate = models.DateField(max_length=20)
    def __str__(self):
        return str(self.stockId)

class StockEquipment(models.Model):
    stockEquipmentId = models.IntegerField(primary_key=True)
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