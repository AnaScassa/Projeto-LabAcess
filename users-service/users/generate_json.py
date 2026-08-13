import json
import factory
from django.core import serializers

from users.factories import (
    UserFactory,
    UserProfileFactory,
    DegreeAreaFactory,
    PositionFactory,
    SafetyTrainingFactory,
    SafetyTrainingGroupFactory
)

users = UserFactory.create_batch(5)

profiles = UserProfileFactory.create_batch(
    5,
    user=factory.Iterator(users)
)

areas = DegreeAreaFactory.create_batch(3)
positions = PositionFactory.create_batch(3)

trainings = SafetyTrainingFactory.create_batch(5)
groups = SafetyTrainingGroupFactory.create_batch(2)

all_objects = []
all_objects += users
all_objects += profiles
all_objects += areas
all_objects += positions
all_objects += trainings
all_objects += groups

data = serializers.serialize("json", all_objects, indent=2)

with open("fixtures.json", "w", encoding="utf-8") as f:
    f.write(data)

print("JSON gerado com sucesso!")

# COMANDOS PARA GERAR O JSON
# docker exec -it smartcard_backend bash
# python manage.py shell
# exec(open("users/generate_json.py").read())
# docker cp smartcard_backend:/smartcard/fixtures.json .