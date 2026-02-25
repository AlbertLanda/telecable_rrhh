from .base import *
import os

DEBUG = False
ALLOWED_HOSTS = ["*"] # En el futuro aquí pondremos el dominio de Azure

# Seguridad extra para producción
CSRF_COOKIE_SECURE = True
SESSION_COOKIE_SECURE = True