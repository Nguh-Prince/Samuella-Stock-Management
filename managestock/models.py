from django.db import models

class Equipment(models.Model):
    equipmentId=models.IntegerField(primary_key=True)
    equipmentName=models.CharField(max_length=10)
    quantity=models.IntegerField()
    def __str__(self):
        return str(self.equipmentId)


class Stock(models.Model):
    stockId=models.IntegerField(primary_key=True)
    stockEquipmentId=models.ForeignKey(Equipment, on_delete=models.CASCADE)
    stockDate=models.DateField(max_length=20)
    def __str__(self):
        return str(self.stockId)




