from django.urls import path
from . import views

urlpatterns = [
    # ----------------------------------------------------
    # RUTAS DE LA INTERFAZ Y LOGIN
    # ----------------------------------------------------
    path('', views.login_view, name='login'),
    path('app/', views.app_view, name='app'),
    path('api/login/', views.api_login, name='api_login'),

    # ----------------------------------------------------
    # NUEVAS RUTAS API (Para que el JavaScript funcione)
    # ----------------------------------------------------
    path('api/empleados/listar/', views.listar_empleados, name='listar_empleados'),
    path('api/departamentos/listar/', views.listar_departamentos, name='listar_departamentos'),
    path('api/empresas/listar/', views.listar_empresas, name='listar_empresas'),
    path('api/sedes/listar/', views.listar_sedes, name='listar_sedes'),
    path('api/puestos/listar/', views.listar_puestos, name='listar_puestos'),
    
    path('api/empleados/crear/', views.api_crear_empleado, name='crear_empleado'),
    path('api/empleados/editar/<int:id>/', views.api_editar_empleado, name='editar_empleado'),
    
    path('api/documentos/subir/', views.api_subir_documento, name='subir_documento'),
    path('api/documentos/firmar/', views.api_firmar_documento, name='firmar_documento'),

    path('api/boletas/emitir/', views.emitir_boletas, name='emitir_boletas'),
    
]