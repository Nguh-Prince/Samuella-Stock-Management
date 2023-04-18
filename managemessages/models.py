from django.contrib.auth.models import User
from django.db import models
from django.utils import timezone

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
    
class MessageRecipient(models.Model):
    messageRecipientId = models.AutoField(primary_key=True)
    messageId = models.ForeignKey(Message, on_delete=models.CASCADE)
    receiverId = models.ForeignKey(ChatParticipant, on_delete=models.CASCADE)
    messageSeen = models.BooleanField(default=False)
    messageRead = models.BooleanField(default=False)
    messageTimeSeen = models.DateTimeField(null=True)
    messageTimeRead = models.DateTimeField(null=True)

    def save(self, *args, **kwargs) -> None:
        now = timezone.now()

        if self.messageSeen and not self.messageTimeSeen:
            self.messageTimeSeen = now

        if self.messageRead and not self.messageTimeRead:
            self.messageTimeRead = now

        super().save(*args, **kwargs)