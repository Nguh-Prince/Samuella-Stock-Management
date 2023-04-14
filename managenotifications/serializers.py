import logging
from django.forms import ValidationError

from rest_framework import serializers

from managepurchaseorder.models import PurchaseOrder
from managepurchaseorder.serializers import PurchaseOrderListSerializer
from . import models

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Notification
        fields = ("notificationId", "notificationTimeCreated", "notificationMessage")

class DetailedNotificationSerializer(serializers.ModelSerializer):
    class NotificationRecipients(serializers.ModelSerializer):
        recipientId = serializers.CharField(source="recipientId.username")

        class Meta:
            models.NotificationRecipient
            fields = ("recipientId", "notificationSeen", "notificationTimeSeen", "notificationRead", "notificationTimeRead")

    recipients = NotificationRecipients(many=True, read_only=True)
    
    class Meta:
        model = models.Notification
        fields = ("notificationId", "notificationTimeCreated", "notificationMessage", "recipients")

class ListOfNotificationIdsSerializer(serializers.Serializer):
    notifications = serializers.ListField(child=serializers.IntegerField())

    class Meta:
        fields = ("notifications")

    def validate_notifications(self, data):
        notifications = []
        validation_errors = []

        for index, notificationId in enumerate(data):
            try:
                notification = models.Notification.objects.get(notificationId=notificationId)
                notifications.append( notification )

                if not notification.recipients.filter(notificationRecipientId=self.context['request'].user.id):
                    logging.error(f"Error on index {index} of the notifications list. The user is not a recipient of the message")
                    validation_errors.append( ValidationError(f"Erreur sur l'indexe {index} de la liste. Vous n'etes pas un recipient du notification") )
            except models.Notification.DoesNotExist as e:
                logging.error(f"Error on index {index} of the notifications list. Error getting a notification with id {notificationId}")
                validation_errors.append( ValidationError(f"Aucune notification n'existe avec notificationId 1") )
            
        if validation_errors:
            raise serializers.ValidationError(validation_errors)

        return notifications

class ListOfNotificationRecipientIdsSerializer(serializers.Serializer):
    notifications = serializers.ListField(child=serializers.IntegerField())

    class Meta:
        fields = ("notifications")

    def validate_notifications(self, data):
        notifications = []
        validation_errors = []

        for index, notificationRecipientId in enumerate(data):
            try:
                notificationRecipient = models.NotificationRecipient.objects.get(notificationRecipientId=notificationRecipientId)
                notifications.append(notificationRecipient)
                
                if not notificationRecipient.recipientId == self.context['request'].user:
                    logging.error(f"Error on {index} of the notifications list. The user is not the recipient")
                    validation_errors.append( ValidationError(f"Erreur sur l'indexe {index} de la liste. Vous n'etes pas un recipient du notification") )
            except models.NotificationRecipient.DoesNotExist as e:
                logging.error(f"Error on index {index} of the notifications list. Error getting a notification with id {notificationRecipientId}")
                validation_errors.append( ValidationError(f"Aucune notification n'existe avec notificationId 1") )
        
        if validation_errors:
            raise serializers.ValidationError(validation_errors)

        return notifications

class NotificationRecipientSerializer(serializers.ModelSerializer):
    notificationTimeCreated = serializers.DateTimeField(source="notificationId.notificationTimeCreated")
    instance = serializers.SerializerMethodField(source="instance")

    def get_instance(self, data):
        try:
            return PurchaseOrderListSerializer(PurchaseOrder.objects.get(purchaseorderId=data.instance)).data
        except PurchaseOrder.DoesNotExist:
            return None

    class Meta:
        model = models.NotificationRecipient
        fields = (
            "notificationId", "notificationRecipientId", "notificationTimeCreated", "notificationMessage", 
            "notificationSeen", "notificationTimeSeen", "notificationRead", 
            "notificationTimeRead", "model", "instance"
        )