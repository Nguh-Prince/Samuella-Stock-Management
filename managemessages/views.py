from django.shortcuts import render

from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework import viewsets

from common.viewsets import MultipleSerializerViewSet

from . import models, serializers

class HasChatLookupOrNotAllowed(IsAuthenticated):
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False

        if not "parent_lookup_chat" in view.kwargs:
            return False

        return super().has_permission(request, view)

    def has_object_permission(self, request, view, obj):
        return models.ChatParticipant.objects.filter(participantId=request.user, chatId=obj.chat).exists()

class IsChatParticipant(IsAuthenticated):
    def has_object_permission(self, request, view, obj):
        return models.ChatParticipant.objects.filter(particpantId=request.user, chatId=obj)

class MessageViewSet(viewsets.ModelViewSet):
    serializer_class = serializers.MessageSerializer
    permission_classes = [HasChatLookupOrNotAllowed]
    queryset = models.Message.objects.all()

    CHAT_LOOKUP_KWARG = "parent_lookup_chat"

    def get_queryset(self):
        if not self.CHAT_LOOKUP_KWARG in self.kwargs:
            return None
        else:
            return self.queryset.filter( chat__chatId=self.kwargs[self.CHAT_LOOKUP_KWARG] )

    @property
    def chat(self):
        try:
            return models.Chat.objects.get(chatId=self.kwargs[self.CHAT_LOOKUP_KWARG])
        except models.Chat.DoesNotExist as e:
            return None

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        chat = self.chat

        sender = models.ChatParticipant.objects.get(chatId=chat, participantId=request.user)

        message = models.Message.objects.create(
            chat=chat, sender=sender, 
            **serializer.validated_data
        )

        return Response(serializers.MessageSerializer(message).data, status=status.HTTP_201_CREATED)

class ChatViewSet(viewsets.ModelViewSet, MultipleSerializerViewSet):
    serializer_class = serializers.ChatSerializer
    serializer_classes = {
        'create': serializers.CreateChatSerializer
    }
    permission_classes = [IsChatParticipant, ]
    queryset = models.Chat.objects.all()
    
    def get_queryset(self):
        user = self.request.user
        
        subquery = models.ChatParticipant.objects.filter(participantId=user)

        return models.Chat.objects.filter(chatId__in=subquery.values("chatId__chatId"))

    def create(self, request, *args, **kwargs):
        serializer: serializers.CreateChatSerializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        instance = serializer.create(serializer.validated_data)

        data = self.serializer_class(instance).data

        return Response( data=data, status=status.HTTP_201_CREATED )