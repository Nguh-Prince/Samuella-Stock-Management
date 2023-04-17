import logging
from django.contrib.auth.models import User
from django.db import transaction

from rest_framework import serializers

from . import models

class ChatSerializer(serializers.ModelSerializer):
    class ChatParticipantSerializer(serializers.ModelSerializer):
        username = serializers.CharField(source="participantId.username")

        class Meta:
            model = models.ChatParticipant
            fields = ("chatParticipantId", "username")
    
    participants = ChatParticipantSerializer(many=True)

    class Meta:
        model = models.Chat
        fields = ("chatId", "chatTimeCreated", "chatEncryptionKey", "participants")
        extra_kwargs = {
            "chatEncryptionKey": {"read_only": True}
        }

    def create(self, validated_data):
        participants = validated_data.pop("participants")

        with transaction.atomic():
            chat = self.Meta.model.objects.create(**validated_data)
            for participant in participants:
                models.ChatParticipant.objects.create(participantId=participant, chatId=chat)

            breakpoint()
            return chat

class CreateChatSerializer(serializers.ModelSerializer):
    participants = serializers.ListField(child=serializers.CharField())

    def validate_participants(self, data):
        if len(data) < 2:
            raise serializers.ValidationError( "Une discussion doit avoir au moins 2 participants" )
        
        participants = []
        errors = []

        user_found = False

        for index, item in enumerate(data):
            try:
                user = User.objects.get(username=item)
                participants.append(user)

                if user == self.context['request'].user:
                    user_found = True

            except User.DoesNotExist as e:
                logging.error(f"Error getting user with username {item}")
                errors.append( serializers.ValidationError( f"Erreur sur l'index {index}, aucun utilisateur n'existe avec le nom d'utilisateur: {item}" ) )

        if not user_found:
            errors.append(serializers.ValidationError("Vous devez participer aux discussions que vous créez"))

        if errors:
            raise serializers.ValidationError(errors)

        return participants

    class Meta:
        model = models.Chat
        fields = ("chatId", "chatTimeCreated", "chatEncryptionKey", "participants")
        extra_kwargs = {
            "chatEncryptionKey": {"read_only": True}
        }

    def create(self, validated_data):
        participants = validated_data.pop("participants")

        with transaction.atomic():
            chat = self.Meta.model.objects.create(**validated_data)
            for participant in participants:
                models.ChatParticipant.objects.create(participantId=participant, chatId=chat)

            return chat

class MessageSerializer(serializers.ModelSerializer):
    sender = serializers.CharField(source="sender.participantId.username", read_only=True)

    class Meta:
        model = models.Message
        fields = ("sender", "time_sent", "messageContent")