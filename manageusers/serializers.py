from rest_framework import serializers

from . import models

class EmployeeSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Employee
        fields = "__all__"

class StructureSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Structure
        fields = "__all__"