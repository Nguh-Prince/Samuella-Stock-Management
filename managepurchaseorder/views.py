from django.shortcuts import render

from rest_framework import viewsets

from . import models, serializers

# Create your views here.
def home(request):
    return render(request, "base.html")

class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = serializers.OrderSerializer
    queryset = models.Order.objects.all()
    
class PurchaseOrderViewSet(viewsets.ModelViewSet):
    serializer_class = serializers.PurchaseOrderSerializer
    queryset = models.PurchaseOrder.objects.all()