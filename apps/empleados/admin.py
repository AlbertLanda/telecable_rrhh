from django.contrib import admin
from .models import Departamento, Puesto, Empleado, Documento, Sede, PerfilUsuario

# Aquí le decimos a Django que muestre estas tablas en el panel
admin.site.register(Sede)
admin.site.register(Departamento)
admin.site.register(Puesto)
admin.site.register(Empleado)
admin.site.register(Documento)
admin.site.register(PerfilUsuario)