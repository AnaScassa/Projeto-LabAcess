from django.db import models

class Usuario(models.Model):
    matricula = models.CharField(max_length=20, unique=True)
    nome_usuario = models.CharField(max_length=100)
    categoriaUsuario = models.CharField(max_length=50, blank=True, null=True)
    user_auth = models.BigIntegerField(null=True, blank=True)
    username_mrbs = models.CharField(max_length=100, blank=True, null=True)

    def __str__(self):
        return f"{self.nome_usuario} ({self.matricula})"

class Acesso(models.Model):
    usuario = models.ForeignKey(Usuario, to_field = 'matricula', related_name ='acessos', on_delete=models.CASCADE) 
    data_acesso = models.DateTimeField(null=True, blank=True)
    desc_evento = models.CharField(max_length=100) 
    desc_area = models.CharField(max_length=100) 
    desc_leitor = models.CharField(max_length=100) 
    ent_sai = models.CharField(max_length=10) 
    apontamento = models.IntegerField(default=0)    
    
    class Meta: 
        unique_together = ('usuario', 'data_acesso', 'desc_evento', 'desc_area', 'ent_sai') 

    def __str__(self): 
        return f"Acesso de {self.usuario.nome_usuario} em {self.data_acesso}" 


class Processamento(models.Model):
    STATUS_CHOICES = [
        ("PENDING", "Pendente"),
        ("PROCESSANDO", "Processando"),
        ("SUCCESS", "Sucesso"),
        ("ERRO", "Erro"),
    ]

    task_id = models.CharField(max_length=255, unique=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="PENDING")
    criado_em = models.DateTimeField(auto_now_add=True)
    atualizado_em = models.DateTimeField(auto_now=True)
    user = models.CharField(max_length=100,  null=True, unique=False)
    task_id_parent = models.CharField(max_length=255, null=True, unique=False)
    task_name = models.CharField(max_length=255, null=True, unique=False)

    class Meta:
        unique_together = ('id', 'task_id', 'status')

    def __str__(self):
        return f"{self.task_id} - {self.status}"

class Emails(models.Model):
    email = models.EmailField(unique=False)
    criado_em = models.DateTimeField(auto_now_add=True)
    esta_ativo = models.BooleanField(default=True)
    ativado = models.BooleanField(default=True)
    
class CruzamentoApi(models.Model):
    usuario = models.ForeignKey(Usuario, to_field="matricula", on_delete=models.CASCADE, related_name="cruzamentos")
    acesso = models.OneToOneField(Acesso, on_delete=models.CASCADE, related_name="cruzamento")
    data_acesso = models.DateTimeField()
    porta = models.CharField(max_length=100)
    motivo = models.CharField(max_length=255)
    criado_em = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "cruzamento_api"
    
class MrbsEntry(models.Model):
    id = models.IntegerField(primary_key=True)
    start_time = models.IntegerField()
    end_time = models.IntegerField()
    repeat_id = models.IntegerField(null=True, blank=True)
    timestamp = models.IntegerField()
    created_by = models.CharField(max_length=80, db_column="create_by")
    modified_by = models.CharField(max_length=80)
    name = models.CharField(max_length=80)
    type = models.IntegerField()
    description = models.TextField()
    status = models.IntegerField()
    reminded = models.IntegerField()
    info_time = models.IntegerField()
    info_user = models.CharField(max_length=80)
    info_text = models.TextField()

    class Meta:
        managed = False
        db_table = "mrbs_entry"