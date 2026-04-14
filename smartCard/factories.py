import random
import factory
from faker import Faker
from django.contrib.auth import get_user_model
from smartcard.models import Usuario, Acesso

fake = Faker("pt_BR")
User = get_user_model()


fake = Faker("pt_BR")
User = get_user_model()


class SmartcardUsuarioFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Usuario
        exclude = ("_user_match",)  

    categoriaUsuario = factory.Iterator([
        "Aluno", "Professor", "Pesquisador", "Visitante"
    ])

    @factory.sequence
    def matricula(n):
        prefixos = ["101", "102", "103", "104"]
        prefix = random.choice(prefixos)
        return f"{prefix}{n:06d}"

    @factory.lazy_attribute
    def _user_match(self):
        users = list(User.objects.all())

        if users and random.random() < 0.8:
            return random.choice(users)

        return None

    @factory.lazy_attribute
    def nome_usuario(self):
        if self._user_match:
            return f"{self._user_match.first_name} {self._user_match.last_name}"

        return fake.name()

    @factory.lazy_attribute
    def user_auth(self):
        if self._user_match:
            return self._user_match.id

        return None
    
class AcessoFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Acesso

    usuario = factory.LazyFunction(lambda: random.choice(list(Usuario.objects.all())))

    data_acesso = factory.LazyFunction(lambda: fake.date_time_this_year())

    ent_sai = factory.LazyFunction(lambda: random.choice([1, 0]))

    desc_evento = factory.LazyFunction(
        lambda: random.choices([
            "Apontamento Normal",
            "Erro na Gravação do Cartão",
            "Apresentação de Cartão Cancelado",
            "Área não Permitida"
        ], weights=[80, 5, 10, 5], k=1)[0]
    )

    desc_area = factory.Iterator(["CCS_LAB", "CCS"])
    desc_leitor = factory.Iterator(["CCS_PB_PRINCIPAL", "CCS_PBLABORATORIO"])

    @factory.lazy_attribute
    def apontamento(self):
        if self.desc_evento != "Apontamento Normal":
            return 1

        ultimo = (
            Acesso.objects
            .filter(usuario=self.usuario)
            .order_by("-data_acesso")
            .first()
        )

        if not ultimo:
            return 0  

        mesma_porta = self.desc_leitor == ultimo.desc_leitor

        mesmo_dia = self.data_acesso.date() == ultimo.data_acesso.date()

        if not mesma_porta or not mesmo_dia:
            return 2

        return 0


#ainda precisa fazer com q o factory daqui pegue o id do usuario e coloque no user_auth
#alémd de caso n tenha user_auth criar um nome fake para o nome_usuario

#mudar depois para último mes na parte de apontamento