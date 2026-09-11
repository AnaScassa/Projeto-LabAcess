from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from celery import shared_task, shared_task


@shared_task(bind=True, name="smartcard.tasks.cruzamento_api")
def cruzamento_api(self, user_id, username):

    # usuario_id: ID do Usuario no SmartCard.
    # user_auth_id: ID do usuario recebido do users_service.
    #depois eu vou precisar 1- comparar o "name" do mrbs_users e do "username" do users_users, se tiverem iguais, eu vou pegar o "id" 
    #do users_users e comparar com os dados do smartcard_usuarios, comparar com o user_auth
    #se encontrar um "id" correspondente eu preciso verificar no usuario do  mrbs agendou no sistema
    #se nao agentou retornar mensagem de erro, se agendou retornar mensagem de sucesso 
    
    print(f"Executando cruzamento_api para user_id: {user_id}, username: {username}")

    return {
        "status": "recebido",
        "user_id": user_id,
        "username": username,
    }