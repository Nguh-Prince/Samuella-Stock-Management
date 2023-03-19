from django.shortcuts import render

from rest_framework import viewsets
from managestock.models import Equipment

from manageusers.models import Structure

from . import models, serializers

# Create your views here.
def home(request):
    context = {'structures': Structure.objects.all(), 'equipments': Equipment.objects.all()}
    return render(request, "managepurchaseorder/managepurchaseorder.html", context=context)

class PurchaseOrderViewSet(viewsets.ModelViewSet):
    serializer_class = serializers.PurchaseOrderSerializer
    queryset = models.PurchaseOrder.objects.all()