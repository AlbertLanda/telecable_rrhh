from django.shortcuts import render

def login_view(request):
    # Esta vista mostrará el index.html (Login)
    return render(request, 'index.html')

def app_view(request):
    # Esta vista mostrará el app.html (El sistema)
    return render(request, 'app.html')