from django.db import models
from django.contrib.auth.models import User


class Sede(models.Model):
    nombre = models.CharField(max_length=100)
    direccion = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return self.nombre
    
class Departamento(models.Model):
    # Django crea el 'id' automáticamente, no hay que ponerlo
    nombre = models.CharField(max_length=100)
    descripcion = models.TextField(blank=True, null=True)
    color = models.CharField(max_length=20, blank=True, null=True)
    jefe_nombre = models.CharField(max_length=150, blank=True, null=True)

    def __str__(self):
        return self.nombre

class Puesto(models.Model):
    nombre = models.CharField(max_length=100)
    # Así se hace la Llave Foránea en Django
    departamento = models.ForeignKey(Departamento, on_delete=models.SET_NULL, null=True, related_name='puestos')

    def __str__(self):
        return self.nombre

class Empleado(models.Model):
    # Opciones predefinidas (como los ENUM o validaciones)
    ESTADO_CHOICES = [
        ('Activo', 'Activo'),
        ('Inactivo', 'Inactivo'),
        ('Suspendido', 'Suspendido'),
    ]
    GENERO_CHOICES = [('M', 'Masculino'), ('F', 'Femenino'), ('O', 'Otro')]

    codigo = models.CharField(max_length=20, unique=True)
    nombres = models.CharField(max_length=100)
    apellidos = models.CharField(max_length=100)
    dni = models.CharField(max_length=15, unique=True)
    email = models.EmailField(unique=True)
    telefono = models.CharField(max_length=20, blank=True, null=True)
    fecha_nacimiento = models.DateField(blank=True, null=True)
    fecha_ingreso = models.DateField(blank=True, null=True)
    sede = models.ForeignKey(Sede, on_delete=models.SET_NULL, null=True, related_name='empleados')
    
    # Relaciones con las tablas de arriba
    departamento = models.ForeignKey(Departamento, on_delete=models.SET_NULL, null=True)
    puesto = models.ForeignKey(Puesto, on_delete=models.SET_NULL, null=True)
    
    tipo_contrato = models.CharField(max_length=50, blank=True, null=True)
    sueldo_base = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    afp_onp = models.CharField(max_length=50, blank=True, null=True)
    estado = models.CharField(max_length=20, choices=ESTADO_CHOICES, default='Activo')
    avatar_color = models.CharField(max_length=20, blank=True, null=True)
    genero = models.CharField(max_length=1, choices=GENERO_CHOICES, blank=True, null=True)

    def __str__(self):
        return f"{self.nombres} {self.apellidos} ({self.codigo})"

class Documento(models.Model):
    empleado = models.ForeignKey(Empleado, on_delete=models.CASCADE, related_name='documentos')
    nombre_archivo = models.CharField(max_length=255)
    tipo_documento = models.CharField(max_length=50, blank=True, null=True)
    fecha_subida = models.DateTimeField(auto_now_add=True)
    tamaño_kb = models.IntegerField(blank=True, null=True)

    def __str__(self):
        return f"{self.nombre_archivo} - {self.empleado.nombres}"

class PerfilUsuario(models.Model):
    ROLES = [
        ('Admin', 'Administrador del Sistema'),
        ('RRHH', 'Recursos Humanos'),
        ('Empleado', 'Empleado Base'),
    ]
    
    # 1. Conectamos con el Usuario de Login de Django
    usuario = models.OneToOneField(User, on_delete=models.CASCADE, related_name='perfil')
    
    # 2. Le asignamos un Rol
    rol = models.CharField(max_length=20, choices=ROLES, default='Empleado')
    
    # 3. Lo enlazamos a su ficha real de Recursos Humanos (Opcional, por si es RRHH o Admin)
    empleado = models.OneToOneField(Empleado, on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return f"{self.usuario.username} - {self.rol}"