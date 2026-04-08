import random
import factory
from faker import Faker
from django.utils import timezone

from users.factories import UserFactory
from smartcard.models import Usuario, Acesso

from datetime import timedelta

fake = Faker("pt_BR")


class SmartcardUsuarioFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Usuario

    categoriaUsuario = factory.Iterator(["Aluno", "Professor", "Pesquisador", "Visitante"])

    @factory.lazy_attribute
    def matricula(self):
        categoria_map = {
            "Aluno": "101",
            "Professor": "102",
            "Pesquisador": "103",
            "Visitante": "104"
        }
        prefix = categoria_map[self.categoriaUsuario]
        suffix = "".join([str(random.randint(0, 9)) for _ in range(6)])
        return f"{prefix}{suffix}"

    nome_usuario = factory.LazyAttribute(lambda _: fake.name())
    user_auth = factory.LazyFunction(lambda: UserFactory().id)


class AcessoFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Acesso

    usuario = factory.SubFactory(SmartcardUsuarioFactory)
    data_acesso = factory.LazyFunction(
        lambda: timezone.now() - timedelta(
            days=random.randint(0, 30),
            hours=random.randint(0, 23),
            minutes=random.randint(0, 59)
        )
    ) 
    desc_evento = factory.LazyFunction(
        lambda: random.choices(
            [
                "Apontamento Normal",
                "Erro na Gravação do Cartão",
                "Apresentação de Cartão Cancelado",
                "Área não Permitida"
            ],
            weights=[80, 5, 10, 5],  
            k=1
        )[0]
    )
    desc_area = factory.Iterator(["CCS_LAB", "CCS"])
    desc_leitor = factory.Iterator(["CCS_PB_PRINCIPAL", "CCS_PBLABORATORIO"])
    ent_sai = factory.Iterator([1, 0])
    apontamento = factory.Sequence(lambda n: n + 1)

#A tabela processamento serve apenas para controle de tarefas assíncronas, 
# não é necessário criar uma factory para ela
