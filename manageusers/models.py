from django.contrib.auth.models import User
from django.db import models
from django.db.models import Q

class Employee(models.Model):
    structureId = models.ForeignKey("manageusers.Structure", on_delete=models.PROTECT, related_name="employees", null=True)
    employeeFirstName = models.CharField(max_length=50)
    employeeLastName = models.CharField(max_length=50)
    matricleNumber = models.CharField(max_length=100, unique=True)
    isStockManager = models.BooleanField(default=False)
    structure_head = models.BooleanField(default=False, verbose_name="Chef de structure?")
    structure_subhead = models.BooleanField(default=False, verbose_name="Sous-chef de structure?")
    user = models.OneToOneField(User, on_delete=models.SET_NULL, null=True)
    supervisor = models.ForeignKey("self", on_delete=models.SET_NULL, null=True, related_name="subordinates")

    def is_structure_head(self) -> bool:
        return self.structure_head or self.structure_subhead

    def is_stock_manager(self) -> bool:
        return self.isStockManager or self.subordinates.filter(isStockManager=True).exists()

    def __str__(self) -> str:
        return f"{self.employeeFirstName} {self.employeeLastName}"

    def save(self, *args, **kwargs) -> None:
        super().save(*args, **kwargs)
        
        if self.structure_head:
            self.structureId.employees.filter( Q(structure_head=True) & ~Q(id=self.id) ).update(structure_head=False)
            
            self.structureId.head = self
            self.structureId.save()

        if self.structure_subhead:
            query = StructureSubHead.objects.filter(structureId=self.structureId, employeeId=self)

            if not query.exists():
                # create a new subhead for the structure
                StructureSubHead.objects.create(structureId=self.structureId, employeeId=self)

        elif not self.structure_subhead:
            # delete the StructureSubHead records in the DB
            StructureSubHead.objects.filter(structureId=self.structureId, employeeId=self).delete()

class Structure(models.Model):
    structureId=models.IntegerField(primary_key=True, blank=True)
    structureName=models.CharField(max_length=8)
    structureAddress=models.IntegerField()
    structureNature=models.CharField(max_length=20)
    head = models.ForeignKey("manageusers.Employee", on_delete=models.SET_NULL, null=True)
    # sub_heads = models.ManyToManyField(Employee)
    
    def __str__(self):
        return str(f"{self.structureName} -> {self.structureAddress}")

class StructureSubHead(models.Model):
    structureId = models.ForeignKey(Structure, on_delete=models.CASCADE, related_name="subheads")
    employeeId = models.ForeignKey(Employee, on_delete=models.CASCADE)

    class Meta:
        unique_together = [
            ["structureId", "employeeId"]
        ]


class Users(models.Model):
    userId=models.IntegerField(primary_key=True)
    userName=models.CharField(max_length=200)
    userEmail=models.CharField(max_length=100)
    userPassword=models.FloatField(max_length=100)
    userStructureId=models.ForeignKey(Structure, on_delete=models.CASCADE)
    #userRole=models.CharField(max_length=200)
    def __str__(self):
        return str(self.userId)

'''
class Role(models.Model):
    roleId=models.IntegerField(primary_key=True)
    roleDescription=models.CharField(max_length=50)
    '''




