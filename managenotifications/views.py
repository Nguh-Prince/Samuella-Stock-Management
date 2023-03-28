from django.utils import timezone

from rest_framework import viewsets
from rest_framework.decorators import (action, api_view, permission_classes,
                                       renderer_classes)
from rest_framework.response import Response

from common.viewsets import MultipleSerializerViewSet

from . import models, serializers
from .permissions import IsAuthenticatedAndReadOnly

class NotificationViewSet(viewsets.ModelViewSet, MultipleSerializerViewSet):
    serializer_class = serializers.NotificationSerializer
    permission_classes = [IsAuthenticatedAndReadOnly, ]
    queryset = models.Notification.objects.all()
    serializer_classes = {
        "mark_as_read": serializers.ListOfNotificationIdsSerializer,
        "mark_as_received": serializers.ListOfNotificationIdsSerializer
    }

    def get_queryset(self):
        user = self.request.user

        if not user.is_authenticated:
            return None

        if not user.is_superuser:
            return models.Notification.objects.filter(notificationrecipient__recipientId=user)

    @action(
        methods=["POST", ],
        detail=False
    )
    def mark_as_read(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        for notification in serializer.validated_data:
            now = timezone.now()
            un_read_notifications = notification.recipients.filter(notificationRecipientId=request.user.id, notificationRead=False)
            un_read_and_un_seen_notifications = un_read_notifications.filter(notificationSeen=False)
            
            un_read_notifications.update(notificationRead=True, notificationTimeRead=now)
            un_read_and_un_seen_notifications.update(notificationSeen=True, notificationTimeSeen=now)

        return Response({"message": "Notifications successfully marked as read"})

    @action(
        methods=["POST"],
        detail=False
    )
    def mark_as_seen(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        for notification in serializer.validated_data:
            now = timezone.now()
            unseen_notifications = notification.recipients.filter(notificationRecipientId=request.user.id, notificationSeen=False)
            unseen_notifications.update(notificationSeen=True, notificationTimeSeen=now)

        return Response({"message": "Notifications successfully marked as seen"})