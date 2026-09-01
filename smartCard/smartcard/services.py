from django.conf import settings

import os
import shortuuid


def vincular_por_matricula(usuario, profiles):
    matricula = str(usuario.matricula).strip()
    if len(matricula) <= 3:
        return False

    matricula_id = matricula[3:]

    for profile in profiles:
        if not isinstance(profile, dict):
            continue

        academic_id = profile.get("academic_id")
        academic_id_norm = ''.join(filter(str.isdigit, str(academic_id)))

        if academic_id_norm == matricula_id:
            user_id = profile.get("user_id")
            if user_id:
                usuario.user_auth = user_id
                usuario.save(update_fields=["user_auth"])
                return True

    return False

def salvar_arquivo_temporario(arquivo):
    os.makedirs(settings.MEDIA_ROOT, exist_ok=True)

    nome = f"{shortuuid.uuid()}_{arquivo.name}"
    caminho = os.path.join(settings.MEDIA_ROOT, nome)

    with open(caminho, "wb") as destino:
        for chunk in arquivo.chunks():
            destino.write(chunk)

    return caminho