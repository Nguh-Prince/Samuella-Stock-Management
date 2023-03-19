from django.utils.translation import gettext as _
from django.utils import timezone

from rest_framework import serializers

from . import models

class EquipmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Equipment
        fields = ("equipmentId", "equipmentName", "quantity")
        extra_kwargs = {
            "equipmentId": {"read_only": True}
        }

class AddEquipmentsSerializer(serializers.Serializer):
    data = serializers.ListField(child=EquipmentSerializer())

    def create(self, validated_data):
        serializer = EquipmentSerializer(data=validated_data['data'], many=True)
        
        serializer.is_valid(raise_exception=True)

        equipments = serializer.create(serializer.validated_data)

        return equipments

class StockSerializer(serializers.ModelSerializer):
    class StockEquipmentSerializer(serializers.ModelSerializer):
        equipment = EquipmentSerializer(source="equipmentId")

        class Meta:
            model = models.StockEquipment
            fields = ("equipment", "quantity")

        def validate_quantity(self, data):
            # quantity > 0
            if data <= 0:
                raise serializers.ValidationError(_("La quantité doit être supérieure à 0"))

        def validate_equipment(self, data):
            # create a new equipment if an equipment with this name 
            # doesn't exist
            name = data['equipmentName']

            query = models.Equipment.objects.filter(equipmentName=name)
            
            if not query.exists():
                return models.Equipment.objects.create(equipmentName=name)

            return query.first()

    equipments = StockEquipmentSerializer(many=True)

    def validate(self, attrs):
        if "stockDate" not in attrs:
            attrs["stockDate"] = timezone.now()
        return super().validate(attrs)

    class Meta:
        models = models.Stock
        fields = ("stockDate", "equipments")
        extra_kwargs = {
            'stockDate': { 'required': False }
        }

    def create(self, validated_data):
        return super().create(validated_data)