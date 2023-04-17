from django.contrib.auth.models import User

from rest_framework import serializers

from . import models

class SendMessageSerializer(serializers.Serializer):
    message = serializers.CharField()
    recipients = serializers.ListField(child=serializers.IntegerField())

    def validate_recipients(self, data):
        items = []
        errors = []

        for index, item in enumerate(data):
            try:
                items.append(User.objects.get(id=item))
            except User.DoesNotExist as e:
                errors.append(serializers.ValidationError(f"Erreur sur l'index {index+1}, aucun utilisateur n'existe avec l'identifiant {item}"))

        if errors:
            raise serializers.ValidationError(errors)

        return items

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
        
        chat = self.Meta.model.objects.create(**validated_data)

        for participant in participants:
            user = User.objects.filter(username=participant['username'])

            models.ChatParticipant.objects.create(participantId=user, chatId=chat)

        return chat
    
class MessageSerializer(serializers.ModelSerializer):
    sender = serializers.CharField(source="sender.participantId.username")
    class Meta:
        model = models.Message
        fields = ("sender", "time_sent", "messageContent")