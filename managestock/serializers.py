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


class StockEquipmentEquipmentSerializer(EquipmentSerializer):
    def validate_equipmentName(self, data):
        check_query = self.Meta.model.objects.filter(equipmentName=data)
        if check_query.exists() and not isinstance(self.parent, StockSerializer.StockEquipmentSerializer):
            print("The equipmentName is not valid")
            raise serializers.ValidationError("Un objet equipment avec ce champ equipmentName existe déjà.")

        return data
    
    class Meta:
        model = models.Equipment
        fields = ("equipmentId", "equipmentName", "quantity")
        extra_kwargs = {
            "equipmentId": {"read_only": True},
            "equipmentName": {"validators": []}
        }

class AddEquipmentsSerializer(serializers.Serializer):
    data = serializers.ListField(child=EquipmentSerializer())

    def create(self, validated_data):
        serializer = EquipmentSerializer(data=validated_data['data'], many=True)
        
        serializer.is_valid(raise_exception=True)

        equipments = serializer.create(serializer.validated_data)

        return equipments

class SupplierSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Supplier
        fields = "__all__"

class StockSerializer(serializers.ModelSerializer):
    class StockEquipmentSerializer(serializers.ModelSerializer):
        equipmentId = StockEquipmentEquipmentSerializer()

        class Meta:
            model = models.StockEquipment
            fields = ("equipmentId", "quantity")

        def validate_quantity(self, data):
            # quantity > 0
            if data <= 0:
                raise serializers.ValidationError(_("La quantité doit être supérieure à 0"))

            return data

        def validate_equipmentId(self, data):
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
        model = models.Stock
        fields = ("supplierId", "stockDate", "equipments")
        extra_kwargs = {
            'stockDate': { 'required': False },
            'supplierId': {  }
        }

    def create(self, validated_data):
        equipments = validated_data.pop("equipments")
        
        stock = self.Meta.model.objects.create(**validated_data)

        for equipment in equipments:
            models.StockEquipment.objects.create(stockId=stock, **equipment)

        return stock