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
    user = models.OneToOneField(User, on_delete=models.SET_NULL, null=True)

    def is_structure_head(self) -> bool:
        return self.structureId.head == self

    def __str__(self) -> str:
        return f"{self.employeeFirstName} {self.employeeLastName}"

    def save(self, *args, **kwargs) -> None:
        super().save(*args, **kwargs)
        
        if self.structure_head:
            self.structureId.employees.filter( Q(structure_head=True) & ~Q(id=self.id) ).update(structure_head=False)
            
            self.structureId.head = self
            self.structureId.save()

class Structure(models.Model):
    structureId=models.IntegerField(primary_key=True, blank=True)
    structureName=models.CharField(max_length=8)
    structureAddress=models.IntegerField()
    structureNature=models.CharField(max_length=20)
    head = models.ForeignKey("manageusers.Employee", on_delete=models.SET_NULL, null=True)
    
    def __str__(self):
        return str(f"{self.structureName} -> {self.structureAddress}")


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




