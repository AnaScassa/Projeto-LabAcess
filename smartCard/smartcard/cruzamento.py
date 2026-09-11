from celery import shared_task
from .models import Usuario, Acesso, MrbsEntry, CruzamentoApi

@shared_task(bind=True, name="smartcard.tasks.cruzamento_api")
def cruzamento_api(self, user_id, username):
    usuario = Usuario.objects.filter(user_auth=user_id, username_mrbs=username).first()

    if not usuario:
        return {"status": "erro", "mensagem": "Usuário não encontrado no SmartCard."}

    if not usuario.username_mrbs:
        return {"status": "erro", "mensagem": "Usuário não possui username cadastrado no MRBS."}

    acessos = Acesso.objects.filter(usuario=usuario, desc_area="CCS_LAB", ent_sai="1").exclude(data_acesso=None)
    resultados = []

    for acesso in acessos:
        acesso_timestamp = int(acesso.data_acesso.timestamp())
        reserva = MrbsEntry.objects.using("mariadb").filter(created_by=usuario.username_mrbs, start_time__lte=acesso_timestamp, end_time__gte=acesso_timestamp).values(
            "id", "created_by", "start_time", "end_time"
        ).first()

        if reserva:
            resultados.append({"status": "sucesso", "mensagem": "Usuário entrou no CCS_LAB e possuía reserva.", "usuario": usuario.nome_usuario, "matricula": usuario.matricula, "data_acesso": acesso.data_acesso})
        
        else:
            CruzamentoApi.objects.get_or_create(acesso=acesso, defaults={"usuario": usuario, "data_acesso": acesso.data_acesso, "porta": acesso.desc_leitor, "motivo": "Usuário entrou no CCS_LAB sem reserva no MRBS."})
            resultados.append({"status": "erro", "mensagem": "Usuário entrou no CCS_LAB sem reserva no MRBS.", "usuario": usuario.nome_usuario, "matricula": usuario.matricula, "data_acesso": acesso.data_acesso})

    resultado = {"status": "finalizado", "usuario": usuario.nome_usuario, "matricula": usuario.matricula, "resultados": resultados}
    
    return resultado