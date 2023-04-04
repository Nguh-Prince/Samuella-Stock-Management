import logging

from django.contrib.auth.models import User
from django.db import models
from django.db.models import Q
from django.db.models.signals import post_save

from managepurchaseorder.models import PurchaseOrder
from manageusers.models import Employee

class Notification(models.Model):
    notificationId = models.AutoField(primary_key=True)
    notificationTimeCreated = models.DateTimeField(auto_now_add=True)
    notificationMessage = models.TextField()
    notificationModel = models.CharField(max_length=50, null=True, blank=True) # the model that generated the notification e.g managestock.Equipment
    notificationModelId = models.IntegerField(null=True) # the particular record of the model that generated the notification

    def __str__(self) -> str:
        return f"{self.notificationTimeCreated}: {self.notificationMessage[:30]}"

    @property
    def model(self) -> str:
        if self.notificationModel.lower() == "managepurchaseorder.purchaseorder":
            return "Commande d'une structure"

class NotificationRecipient(models.Model):
    notificationRecipientId = models.AutoField(primary_key=True)
    notificationId: Notification = models.ForeignKey(Notification, on_delete=models.CASCADE, related_name="recipients")
    recipientId = models.ForeignKey(User, on_delete=models.CASCADE, related_name="notifications")
    notificationSeen = models.BooleanField(default=False)
    notificationRead = models.BooleanField(default=False)
    notificationTimeSeen = models.DateTimeField(null=True)
    notificationTimeRead = models.DateTimeField(null=True)

    class Meta:
        unique_together = [
            ["notificationId", "recipientId"] # a user cannot receive the same notification twice
        ]

    def __str__(self) -> str:
        return f"{self.notificationId.__str__()} -> {self.recipientId.__str__()}"
    
    @property
    def notificationTimeCreated(self):
        return self.notificationId.notificationTimeCreated

    @property
    def notificationMessage(self):
        return self.notificationId.notificationMessage

    @property
    def model(self):
        return self.notificationId.model

    @property
    def instance(self):
        return self.notificationId.notificationModelId

def notify_stock_managers_of_new_purchase_orders(sender, instance: PurchaseOrder, *args, **kwargs):
    logging.info("Notifying stock managers of newly created purchase order")

    notification = Notification.objects.create(notificationMessage=f"Nouvelle commande d'un structure: {instance.__str__()}", notificationModel="managepurchaseorder.PurchaseOrder", notificationModelId=instance.purchaseorderId)

    for user in User.objects.filter(Q(employee__isStockManager=True) | Q(is_superuser=True)):
        NotificationRecipient.objects.create(notificationId=notification, recipientId=user)

post_save.connect(notify_stock_managers_of_new_purchase_orders, PurchaseOrder)