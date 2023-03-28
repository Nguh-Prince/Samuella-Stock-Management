import logging

from django.contrib.auth.models import User
from django.db import models
from django.db.models.signals import post_save

from managepurchaseorder.models import PurchaseOrder
from manageusers.models import Employee

class Notification(models.Model):
    notificationId = models.AutoField(primary_key=True)
    notificationTimeCreated = models.DateTimeField(auto_now_add=True)
    notificationMessage = models.TextField()
    notificationModel = models.CharField(max_length=50, null=True, blank=True) # the model that generated the notification
    notificationModelId = models.IntegerField(null=True) # the particular record of the model that generated the notification

class NotificationRecipient(models.Model):
    notificationRecipientId = models.AutoField(primary_key=True)
    notificationId = models.ForeignKey(Notification, on_delete=models.CASCADE, related_name="recipients")
    recipientId = models.ForeignKey(User, on_delete=models.CASCADE, related_name="notifications")
    notificationSeen = models.BooleanField(default=False)
    notificationRead = models.BooleanField(default=False)
    notificationTimeSeen = models.DateTimeField(null=True)
    notificationTimeRead = models.DateTimeField(null=True)

    class Meta:
        unique_together = [
            ["notificationId", "recipientId"] # a user cannot receive the same notification twice
        ]

def notify_stock_managers_of_new_purchase_orders(sender, instance: PurchaseOrder, *args, **kwargs):
    logging.info("Notifying stock managers of newly created purchase order")

    notification = Notification.objects.create(notificationMessage=f"New purchase order: {instance.__str__()}")

    for employee in Employee.objects.filter(user__isnull=False, isStockManager=True):
        NotificationRecipient.objects.create(notificationId=notification, recipientId=employee.user)

post_save.connect(notify_stock_managers_of_new_purchase_orders, PurchaseOrder)