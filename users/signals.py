from django.db.models.signals import post_save
from django.db.models.signals import post_delete

from django.dispatch import receiver

from django.core.cache import cache

from django.contrib.auth import get_user_model

from users.models import UserProfile

User = get_user_model()


@receiver(post_save, sender=User)
@receiver(post_delete, sender=User)
def limpar_cache_users(
    sender,
    instance,
    **kwargs
):

    print("LIMPANDO CACHE USERS")

    cache.delete(
        "users_profiles_cache"
    )


@receiver(post_save, sender=UserProfile)
@receiver(post_delete, sender=UserProfile)
def limpar_cache_profiles(
    sender,
    instance,
    **kwargs
):

    print("LIMPANDO CACHE PROFILES")

    cache.delete(
        "users_profiles_cache"
    )