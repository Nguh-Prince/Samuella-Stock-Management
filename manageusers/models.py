from django.db import models

class Structure(models.Model):
    structureId=models.IntegerField(primary_key=True, blank=True)
    structureName=models.CharField(max_length=8)
    structureAddress=models.IntegerField()
    structureNature=models.CharField(max_length=20)
    
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




