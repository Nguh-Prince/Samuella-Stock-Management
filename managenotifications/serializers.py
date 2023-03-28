import logging
from django.forms import ValidationError

from rest_framework import serializers

from . import models

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Notification
        fields = ("notificationId", "notificationTimeCreated", "notificationMessage")

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
            raise serializers.ValidationError(ValidationError)

        return notifications