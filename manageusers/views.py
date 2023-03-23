from django.shortcuts import render

from rest_framework import viewsets

from . import models, serializers

# Create your views here.
def home(request):
    return render(request, "manageusers.html")

class StructureViewSet(viewsets.ModelViewSet):
    serializer_class = serializers.StructureSerializer
    queryset = models.Structure.objects.all()