from django.contrib import admin
from .models import Acesso, Usuario, Processamento, Emails, LoggerErro

admin.site.register(Acesso)
admin.site.register(Usuario)
admin.site.register(Processamento)
admin.site.register(Emails)
admin.site.register(LoggerErro)