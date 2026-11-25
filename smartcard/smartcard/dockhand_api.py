import requests
from django.conf import settings


_REQUEST_TIMEOUT = (3, 120)


class DockhandApiError(Exception):
    pass


class DockhandApiConfigurationError(DockhandApiError):
    pass


def reiniciar_stack_rpa() -> None:
    token = settings.DOCKHAND_API_TOKEN
    if not isinstance(token, str) or not token.strip():
        raise DockhandApiConfigurationError("Dockhand API token is not configured.")

    api_url = settings.DOCKHAND_API_URL
    if not isinstance(api_url, str) or not api_url.strip():
        raise DockhandApiConfigurationError("Dockhand API URL is not configured.")
    api_url = api_url.strip()
    if not api_url.startswith("https://"):
        raise DockhandApiConfigurationError("Dockhand API URL must use HTTPS.")

    try:
        response = requests.post(
            api_url,
            headers={
                "Authorization": f"Bearer {token.strip()}",
                "Accept": "application/json",
            },
            timeout=_REQUEST_TIMEOUT,
        )
    except requests.RequestException as error:
        raise DockhandApiError("Could not connect to Dockhand while restarting the RPA stack.") from error

    if not response.ok:
        raise DockhandApiError(f"Dockhand returned HTTP {response.status_code} while restarting the RPA stack.")
