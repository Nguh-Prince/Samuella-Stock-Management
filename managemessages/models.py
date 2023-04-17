from django.contrib.auth.models import User
from django.db import models

class Chat(models.Model):
    chatId = models.AutoField(primary_key=True)
    # chatParticipants = models.ManyToManyField(User)
    chatTimeCreated = models.DateTimeField(auto_now_add=True)
    chatEncryptionKey = models.TextField()

class ChatParticipant(models.Model):
    chatParticipantId = models.AutoField(primary_key=True)
    chatId = models.ForeignKey(Chat, on_delete=models.CASCADE, related_name="participants")
    participantId = models.ForeignKey(User, on_delete=models.CASCADE)

    class Meta:
        unique_together = [ ["participantId", "chatId"] ]

class Message(models.Model):
    messageId = models.AutoField(primary_key=True)
    chat = models.ForeignKey(Chat, on_delete=models.CASCADE)
    sender = models.ForeignKey(ChatParticipant, on_delete=models.CASCADE)
    time_sent = models.DateTimeField(auto_now_add=True)
    messageContent = models.TextField()
    