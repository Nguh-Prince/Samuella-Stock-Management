from django.contrib.auth.models import User
from django.db import models

class Chat(models.Model):
    chatId = models.AutoField(primary_key=True)
    chatParticipants = models.ManyToManyField(User)
    chatTimeCreated = models.DateTimeField(auto_now_add=True)
    chatEncryptionKey = models.TextField()

class Message(models.Model):
    chat = models.ForeignKey(Chat, on_delete=models.CASCADE)
    time_sent = models.DateTimeField(auto_now_add=True)
    messageContent = models.TextField()