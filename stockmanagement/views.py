from django.contrib.auth import login, logout
from django.contrib.auth.decorators import login_required
from django.contrib.auth.hashers import check_password
from django.contrib.auth.models import User
from django.shortcuts import redirect, render

from rest_framework.decorators import api_view, renderer_classes
from rest_framework.renderers import JSONRenderer, TemplateHTMLRenderer
from rest_framework.response import Response

from managestock.models import Discharge, Equipment
from managestock.serializers import DischargeListSerializer, DischargeSerializer

from manageusers.models import Structure

from managepurchaseorder.models import PurchaseOrder
from managepurchaseorder.serializers import PurchaseOrderListSerializer, PurchaseOrderSerializer
from common.serializers import StructureDetailSerializer

@login_required
def dashboard(request):
    context = {
        'equipments': Equipment.objects.all()
    }
    return render(request, "dashboard.html", context=context)

def login_view(request):
    if request.method == "POST":
        incorrectCredentialsError = { "message": "Nom d'utilisateur ou mot de passe incorrect" }
        username = request.POST['username']
        password = request.POST['password']

        try:
            user = User.objects.get(username=username)

            if not check_password(password, user.password):
                return render(request, "login.html", context={"errors": [incorrectCredentialsError]})

            if not user.is_active:
                return render(
                    request, "login.html", 
                    context={"errors": [{"message": "Votre compte n'est pas active. Contactez un admin pour l'activer"}]}
                )

            # the site is only available to super users, stock managers or department heads
            if not user.is_superuser and not (user.employee and (user.employee.isStockManager or user.employee.is_structure_head())):
                return render(
                    request, "login.html",
                    context={"errors": [{"message": "Vous n'êtes pas autorisé à accéder"}]}
                )


            login(request, user)

            # if 'next' in request.GET:
            #     return redirect(request.GET['next'])

            if user.is_superuser or (user.employee and user.employee.isStockManager):
                return redirect("dashboard")
            else:
                return redirect("managepurchaseorder:managepurchaseorder_home")

        except User.DoesNotExist as e:
            context = {
                "errors": [
                    incorrectCredentialsError
                ]
            }

            return render(request, "login.html", context=context)
        
    return render(request, "login.html")

@login_required
def logout_view(request):
    logout(request)
    return redirect("login")

@login_required
@api_view(('GET',))
@renderer_classes((JSONRenderer,))
def statistics(request):
    equipments = Equipment.objects.all()
    departments = Structure.objects.all()
    purchase_orders = PurchaseOrder.objects.all()[:10]
    discharges = Discharge.objects.all()[:10]

    stats_dictionary = {
        "number_of_equipments": equipments.count(),
        "number_of_departments": departments.count(),
        "number_of_purchase_orders": purchase_orders.count(),
        "number_of_discharges": discharges.count(),
        "recent_discharges": DischargeListSerializer(discharges.order_by("-dateCreated", "-dischargeId")[:5], many=True).data,
        "recent_purchase_orders": PurchaseOrderListSerializer(purchase_orders.order_by("-dateCreated", 'purchaseorderId'), many=True).data,
        "departments": {}
    }

    for department in departments:
        stats_dictionary["departments"][department.structureId] = StructureDetailSerializer(department).data
    
    return Response(data=stats_dictionary)