from django.contrib import admin
from .models import Acesso, Usuario, Processamento

admin.site.register(Acesso)
admin.site.register(Usuario)
admin.site.register(Processamento)