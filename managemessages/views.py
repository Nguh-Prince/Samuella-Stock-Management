from django.shortcuts import render

from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import viewsets

from . import models, serializers

class MessageViewSet(viewsets.ModelViewSet):
    serializer_class = serializers.MessageSerializer
    permission_classes = [IsAuthenticated]
    queryset = models.Message.objects.all()

    

    @action(methods=["POST"], detail=False)
    def send(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # check if a chat with the intended recipients exists, if not 
        # create one

class ChatViewSet(viewsets.ModelViewSet):
    serializer_class = serializers.ChatSerializer
    permission_classes = [IsAuthenticated]
    queryset = models.Chat.objects.all()
    
    def get_queryset(self):
        user = self.request.user
        
        subquery = models.ChatParticipant.objects.filter(participantId=user)

        return models.Chat.objects.filter(chatId__in=subquery.values("chatId__chatId"))