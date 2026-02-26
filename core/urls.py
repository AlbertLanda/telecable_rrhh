from django.contrib import admin
from django.urls import path
from apps.empleados.views import login_view, app_view, api_login, api_crear_empleado, api_subir_documento, api_firmar_documento
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', login_view, name='login'),
    path('app/', app_view, name='app'),
    path('api/login/', api_login, name='api_login'),
    path('api/empleados/crear/', api_crear_empleado, name='api_crear_empleado'),
    path('api/documentos/subir/', api_subir_documento, name='api_subir_documento'),
    path('api/documentos/firmar/', api_firmar_documento, name='api_firmar_documento'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)