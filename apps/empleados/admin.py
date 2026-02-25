from django.contrib import admin
from .models import Departamento, Puesto, Empleado, Documento

# Aquí le decimos a Django que muestre estas tablas en el panel
admin.site.register(Departamento)
admin.site.register(Puesto)
admin.site.register(Empleado)
admin.site.register(Documento)