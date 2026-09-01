from smartcard.models import Acesso, Usuario, Processamento
from rest_framework import serializers
from django.contrib.auth.models import Group
from django.utils.timezone import localtime


class ProcessamentoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Processamento
        fields = '__all__'

class UsuarioSerializer(serializers.HyperlinkedModelSerializer):
    acessos = serializers.SerializerMethodField()
    user_auth_id = serializers.SerializerMethodField() 

    class Meta:
        model = Usuario 
        fields = [
            'url',
            'id',
            'user_auth_id',
            'matricula',
            'nome_usuario',
            'categoriaUsuario',
            'acessos',
        ]

    def get_acessos(self, obj):
        acessos = obj.acessos.all()

        return [
            {
                "id": acesso.id,
                "data_acesso": localtime(acesso.data_acesso),
                "desc_area": acesso.desc_area,
                "ent_sai": acesso.ent_sai,
                "apontamento": acesso.apontamento,
            }
            for acesso in acessos
        ]

    def get_user_auth_id(self, obj):
        return obj.user_auth if obj.user_auth is not None else None



class AcessoSerializer(serializers.HyperlinkedModelSerializer):
    usuario = serializers.SlugRelatedField(slug_field='matricula', queryset=Usuario.objects.all())
    username_auth = serializers.SerializerMethodField()
    email_auth = serializers.SerializerMethodField()
    _perfil_cache = {}

    class Meta:
        model = Acesso
        fields = [
            'url',
            'id',
            'usuario',
            'data_acesso',
            'desc_evento',
            'desc_area',
            'desc_leitor',
            'ent_sai',
            'username_auth',
            'categoriaUsuario',
            'email_auth',
        ]

    def get_username_auth(self, obj):
        perfil = self._get_perfil(obj.usuario.matricula)
        return perfil.user.username if perfil else None

    def get_email_auth(self, obj):
        perfil = self._get_perfil(obj.usuario.matricula)
        return perfil.user.email if perfil else None

class UploadAcessoSerializer(serializers.Serializer):
    arquivo = serializers.FileField()

class GroupSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Group
        fields = ["url", "name"]

class TaskSerializer(serializers.Serializer):
    active = serializers.DictField()
    scheduled = serializers.DictField()
    reserved = serializers.DictField()
    
class ApontamentoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Acesso
        fields = [
            'id',
            'data_acesso',
            'desc_evento',
            'ent_sai',
            'usuario_id',
            'apontamento'
        ]
