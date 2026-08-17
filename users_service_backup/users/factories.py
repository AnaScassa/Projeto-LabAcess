import random
import factory
from faker import Faker
from django.utils import timezone
from datetime import timedelta

from .models import (
    User,
    UserProfile,
    DegreeArea,
    Position,
    SafetyTraining,
    SafetyTrainingGroup
)

fake = Faker("pt_BR")


class UserFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = User

    username = factory.Sequence(lambda n: f"user_{n}")    
    email = factory.LazyAttribute(lambda _: fake.email())
    first_name = factory.LazyAttribute(lambda _: fake.first_name())
    last_name = factory.LazyAttribute(lambda _: fake.last_name())
    password = factory.PostGenerationMethodCall('set_password', '123456')


class DegreeAreaFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = DegreeArea

    area = factory.LazyAttribute(lambda _: fake.job())


class PositionFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Position

    position = factory.Iterator([
        "Professor",
        "Researcher",
        "Post-Doc",
        "Graduate Student (Doctorate)",
        "Graduate Student (Masters)",
        "Undergraduate",
        "Company",
        "Other"
    ])


class UserProfileFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = UserProfile
        django_get_or_create = ("user",)  

    user = factory.SubFactory(UserFactory)

    academic_id = factory.LazyAttribute(lambda _: str(fake.random_number(digits=8)))
    emergency_contact = factory.LazyAttribute(lambda _: fake.name())

    phone = factory.LazyFunction(lambda: str(random.randint(10000000000, 99999999999)))
    emergency_phone = factory.LazyFunction(lambda: str(random.randint(10000000000, 99999999999)))

    @factory.post_generation
    def degree_area(self, create, extracted, **kwargs):
        if not create:
            return

        if extracted:
            for area in extracted:
                self.degree_area.add(area)
        else:
            areas = DegreeAreaFactory.create_batch(random.randint(1, 3))
            for area in areas:
                self.degree_area.add(area)


class SafetyTrainingFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = SafetyTraining
        django_get_or_create = ("user",) 

    user = factory.SubFactory(UserFactory)

    completion_date = factory.LazyFunction(
        lambda: timezone.now() - timedelta(days=random.randint(1, 100))
    )

    expiration_date = factory.LazyFunction(
        lambda: timezone.now() + timedelta(days=random.randint(-50, 100))
    )

    notes = factory.LazyAttribute(lambda _: fake.text(max_nb_chars=100))


class SafetyTrainingGroupFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = SafetyTrainingGroup

    training_date = factory.LazyFunction(
        lambda: timezone.now() + timedelta(days=random.randint(-10, 10))
    )

    completed = factory.LazyAttribute(lambda _: random.choice([True, False]))

    @factory.post_generation
    def users(self, create, extracted, **kwargs):
        if not create:
            return

        if extracted:
            for user in extracted:
                self.users.add(user)
        else:
            users = UserFactory.create_batch(random.randint(1, 5))
            for user in users:
                self.users.add(user)