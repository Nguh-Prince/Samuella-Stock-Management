from django.shortcuts import render

from rest_framework import viewsets

from manageusers.models import Structure

from . import models, serializers

# Create your views here.
def home(request):
    return render(request, "managepurchaseorder/managepurchaseorder.html", context={'structures': Structure.objects.all()})

class PurchaseOrderViewSet(viewsets.ModelViewSet):
    serializer_class = serializers.PurchaseOrderSerializer
    queryset = models.PurchaseOrder.objects.all()