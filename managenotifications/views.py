from django.utils import timezone

from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from common.viewsets import MultipleSerializerViewSet

from . import models, serializers
from .permissions import IsAuthenticatedAndReadOnly

class NotificationViewSet(viewsets.ModelViewSet, MultipleSerializerViewSet):
    serializer_class = serializers.NotificationRecipientSerializer
    permission_classes = [IsAuthenticatedAndReadOnly, ]
    queryset = models.NotificationRecipient.objects.all().order_by('-notificationId__notificationTimeCreated')
    serializer_classes = {
        "mark_as_read": serializers.ListOfNotificationRecipientIdsSerializer,
        "mark_as_received": serializers.ListOfNotificationIdsSerializer
    }

    def get_queryset(self):
        queryset = self.queryset

        user = self.request.user

        if not user.is_authenticated:
            return None

        if not user.is_superuser:
            queryset = queryset.filter(recipientId=user)

            if 'unread' in self.request.GET:
                queryset = queryset.filter(notificationRead=False)
        return queryset
                

    @action(
        methods=["POST", ],
        detail=False
    )
    def mark_as_read(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        for notification in serializer.validated_data['notifications']:
            now = timezone.now()
            notification.notificationRead = True
            notification.notificationTimeRead = now
            
            if not notification.notificationSeen:
                notification.notificationSeen = True
                notification.notificationTimeSeen = now

            notification.save()
        
        data = self.serializer_class(serializer.validated_data['notifications'], many=True).data

        return Response({"message": "Notifications successfully marked as read", "data": data})

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
