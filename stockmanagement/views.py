from django.contrib.auth import login, logout
from django.contrib.auth.hashers import check_password
from django.contrib.auth.models import User
from django.shortcuts import redirect, render

def dashboard(request):
    return render(request, "dashboard.html")

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

            login(request, user)

            return redirect("dashboard")

        except User.DoesNotExist as e:
            context = {
                "errors": [
                    incorrectCredentialsError
                ]
            }

            return render(request, "login.html", context=context)
        
    return render(request, "login.html")