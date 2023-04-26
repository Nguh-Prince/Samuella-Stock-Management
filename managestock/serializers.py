from django.utils.translation import gettext as _
from django.utils import timezone

from rest_framework import serializers

from manageusers.serializers import StructureSerializer

from . import models

class EquipmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Equipment
        fields = ("equipmentId", "equipmentName", "quantity", "stockSecurite", "stockAlerte")
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

class AddSuppliersSerializer(serializers.Serializer):
    data = serializers.ListField(child=SupplierSerializer())

    def create(self, validated_data):
        serializer = SupplierSerializer(data=validated_data['data'], many=True)

        serializer.is_valid(raise_exception=True)

        suppliers = serializer.create(serializer.validated_data)

        return suppliers

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
        fields = ("stockId", "supplierId", "stockDate", "equipments")
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

    def update(self, instance, validated_data):
        equipments = validated_data.pop("equipments")

        # delete one by one so that the delete method of each instance should be called
        for equipment in instance.equipments.all():
            equipment.delete()

        instance_modified = False

        if 'supplierId' in validated_data:
            instance.supplierId = validated_data['supplierId']
            instance_modified = True

        if 'stockDate' in validated_data and validated_data['stockDate']:
            instance.stockDate = validated_data['stockDate']
            instance_modified = True

        if instance_modified:
            instance.save()

        for equipment in equipments:
            models.StockEquipment.objects.create(stockId=instance, **equipment)

        return instance

class StockDetailSerializer(StockSerializer):
    supplierId = SupplierSerializer()

    class Meta:
        model = models.Stock
        fields = ("stockId", "supplierId", "stockDate", "equipments")

class DischargeSerializer(serializers.ModelSerializer):
    class DischargeEquipmentSerializer(StockSerializer.StockEquipmentSerializer):
        equipmentId = StockEquipmentEquipmentSerializer()

        class Meta:
            model = models.EquipmentDischarged
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
                raise serializers.ValidationError(f"No equipment exists with the name {name}")

            return query.first()

        def validate(self, attrs):
            # the discharged quantity cannot be greater than the equipment's quantity in the DB
            if attrs['quantity'] > attrs['equipmentId'].quantity:
                raise serializers.ValidationError(_("Il ne reste que %(quantity)d unités en stock" % { 'quantity': attrs['equipmentId'].quantity } ))

            return attrs

    equipments = DischargeEquipmentSerializer(many=True)

    class Meta:
        model = models.Discharge
        fields = ("dischargeId", "structureId", "dateCreated", "equipments")
        extra_kwargs = {
            'dischargeId': {'read_only': True}
        }

    def create(self, validated_data):
        equipments = validated_data.pop("equipments")

        discharge = self.Meta.model.objects.create(**validated_data)

        for equipment in equipments:
            self.DischargeEquipmentSerializer.Meta.model.objects.create(dischargeId=discharge, **equipment)

        return discharge

    def update(self, instance, validated_data):
        equipments = validated_data.pop("equipments")

        for equipment in instance.equipments.all():
            equipment.delete()

        instance_modified = False

        if 'structureId' in validated_data:
            instance.structureId = validated_data['structureId']
            instance_modified = True
        
        if 'dateCreated' in validated_data and validated_data['dateCreated']:
            instance.dateCreated = validated_data['dateCreated']
            instance_modified = True

        if instance_modified:
            instance.save()

        for equipment in equipments:
            self.DischargeEquipmentSerializer.Meta.model.objects.create(dischargeId=instance, **equipment)

        return instance

class DischargeListSerializer(DischargeSerializer):
    structureId = StructureSerializer()
    
    class Meta:
        model = models.Discharge
        fields = ("dischargeId", "structureId", "dateCreated", "equipments")
        extra_kwargs = {
            'dischargeId': {'read_only': True}
        }