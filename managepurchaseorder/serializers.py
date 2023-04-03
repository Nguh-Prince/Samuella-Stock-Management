import logging
from django.utils import timezone

from rest_framework import serializers

from managestock.models import Equipment
from managestock.serializers import EquipmentSerializer
from manageusers.serializers import StructureSerializer

from . import models

class NewEquipmentSerializer(EquipmentSerializer):
    class Meta:
        model = models.Equipment
        fields = ("equipmentId", "equipmentName", "quantity")
        extra_kwargs = {
            "equipmentName": { "validators": [] },
            "equipmentId": { "read_only": True }
        }

    def validate_equipmentName(self, data):
        check_query = self.Meta.model.objects.filter(equipmentName=data)
        if check_query.exists() and not isinstance(self.parent, PurchaseOrderSerializer.PurchaseOrderEquipmentSerializer):
            print("The equipmentName is not valid")
            raise serializers.ValidationError("Un objet equipment avec ce champ equipmentName existe déjà.")

        return data

class PurchaseOrderSerializer(serializers.ModelSerializer):
    class PurchaseOrderEquipmentSerializer(serializers.ModelSerializer):
        equipmentId = NewEquipmentSerializer()

        class Meta:
            model = models.PurchaseOrderEquipment
            fields = ("purchaseOrderEquipmentId" ,"equipmentId", "quantity")
            extra_kwargs = {
                "purchaseOrderEquipmentId": { "read_only": True }
            }
        
        def validate_equipmentId(self, data):
            """
            Create a new equipment with this equipment's name if one does not already exist
            """
            query = Equipment.objects.filter(equipmentName=data['equipmentName'])

            if not query.exists():
                return Equipment.objects.create(equipmentName=data['equipmentName'])
            else:
                return query.first()

        def create(self, validated_data, purchaseOrder):
            equipment = validated_data['equipmentId']

            self.Meta.model.objects.create(
                equipmentId=equipment, purchaseOrderId=purchaseOrder, 
                **validated_data
            )

    equipments = PurchaseOrderEquipmentSerializer(many=True)

    class Meta:
        model = models.PurchaseOrder
        fields = ("purchaseorderId", "equipments", "dateCreated", "structureId")
        extra_kwargs = {
            "dateCreated": { "allow_null": True, "required": False }
        }

    def validate(self, attrs):
        if 'dateCreated' not in attrs or not attrs['dateCreated']:
            attrs['dateCreated'] = timezone.now().date()

        return attrs

    def create(self, validated_data):
        equipments = validated_data.pop("equipments")
        
        purchaseOrder = self.Meta.model(**validated_data)
        purchaseOrder.save()

        for equipment in equipments:
            models.PurchaseOrderEquipment.objects.create(**equipment, purchaseOrderId=purchaseOrder)
            
        return purchaseOrder

    def update(self, instance, validated_data):
        equipments = validated_data.pop("equipments")
        
        instance_modified = False

        if 'dateCreated' in validated_data and validated_data['dateCreated']:
            instance.dateCreated = validated_data['dateCreated']
            instance_modified = True

        if 'supplierId' in validated_data:
            instance.supplierId = validated_data['supplierId']
            instance_modified = True

        if instance_modified:
            instance.save()

        instance.equipments.all().delete()

        for equipment in equipments:
            models.PurchaseOrderEquipment.objects.create(**equipment, purchaseOrderId=instance)

        return instance

class PurchaseOrderListSerializer(PurchaseOrderSerializer):
    structureId = StructureSerializer()

    class Meta:
        model = models.PurchaseOrder
        fields = ("purchaseorderId", "equipments", "dateCreated", "structureId")
        extra_kwargs = {
            "dateCreated": { "allow_null": True, "required": False }
        }

class ListOfPurchaseOrderIdsSerializer(serializers.Serializer):
    data = serializers.ListField(child=serializers.IntegerField())

    def validate_data(self, data):
        user = self.context['request'].user

        purchaseOrdersList = []

        validationErrors = []

        for index, item in data:
            try:
                purchaseOrder = models.PurchaseOrder.objects.get(purchaseorderId=item)
                
                if user.is_superuser or (user.employee and user.employee.is_structure_head() and user.employee.structureId == purchaseOrder.structureId):
                    purchaseOrdersList.append(purchaseOrder)
                else:
                    validationErrors.append(serializers.ValidationError(f"Erreur dans le position {index+1} de la liste. Vous n'etes pas autorises a supprimer cette commande"))
            except models.PurchaseOrder.DoesNotExist as e:
                logging.error(f"Error getting purchase order with purchaseorderId {item}. No purchase order exists with purchaseorderId: {item}.")
        
        if validationErrors:
            raise serializers.ValidationError(validationErrors)

        return purchaseOrdersList
