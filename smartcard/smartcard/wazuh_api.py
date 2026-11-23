import hashlib
import os
from pathlib import Path
from typing import Any

import requests
from django.core.cache import cache


class WazuhApiError(Exception):
    pass


class WazuhApiConfigurationError(WazuhApiError):
    pass


class WazuhAgentNotFound(WazuhApiError):
    pass


class WazuhUnauthorizedError(WazuhApiError):
    pass


_TOKEN_CACHE_SECONDS = 840
_REQUEST_TIMEOUT = (3, 10)


def _read_json(response: requests.Response, operation: str) -> dict[str, Any]:
    try:
        payload = response.json()
    except ValueError as error:
        raise WazuhApiError(f"Wazuh returned invalid JSON while {operation}.") from error

    if not isinstance(payload, dict):
        raise WazuhApiError(f"Wazuh returned an invalid response while {operation}.")

    return payload


def _request_json(method: str, url: str, *, verify: str, operation: str, **kwargs: Any) -> dict[str, Any]:
    try:
        response = requests.request(method,url,timeout=_REQUEST_TIMEOUT,verify=verify,**kwargs)
    except requests.RequestException as error:
        raise WazuhApiError(f"Could not connect to Wazuh while {operation}.") from error

    if response.status_code == 401:
        raise WazuhUnauthorizedError("Wazuh rejected the API credentials or token.")

    try:
        response.raise_for_status()
    except requests.RequestException as error:
        raise WazuhApiError(f"Wazuh returned HTTP {response.status_code} while {operation}.") from error

    return _read_json(response, operation)


def _get_api_configuration() -> tuple[str, str, str, str, str]:
    api_url = os.getenv("WAZUH_API_URL", "https://wazuh.manager:55000").rstrip("/")
    username = os.getenv("WAZUH_API_USERNAME", "").strip()
    password = os.getenv("WAZUH_API_PASSWORD", "")
    agent_id = os.getenv("WAZUH_WINDOWS_AGENT_ID", "001").strip()
    ca_bundle = os.getenv("WAZUH_API_CA_BUNDLE", "")

    if not api_url.startswith("https://"):
        raise WazuhApiConfigurationError("WAZUH_API_URL must use HTTPS.")
    if not username or not password or not agent_id:
        raise WazuhApiConfigurationError("Wazuh API credentials and agent ID must be configured.")
    if not ca_bundle or not Path(ca_bundle).is_file():
        raise WazuhApiConfigurationError("The Wazuh API CA certificate is missing.")

    return api_url, username, password, agent_id, ca_bundle


def _get_token_cache_key(api_url: str, username: str) -> str:
    cache_id = hashlib.sha256(f"{api_url}:{username}".encode()).hexdigest()
    return f"wazuh-api-token:{cache_id}"


def _get_token(api_url: str,username: str,password: str,ca_bundle: str,*,force_refresh: bool = False) -> tuple[str, str]:
    cache_key = _get_token_cache_key(api_url, username)
    if not force_refresh:
        cached_token = cache.get(cache_key)
        if isinstance(cached_token, str) and cached_token:
            return cached_token, cache_key

    payload = _request_json("POST",f"{api_url}/security/user/authenticate",auth=(username, password),verify=ca_bundle,operation="authenticating")
    data = payload.get("data")
    token = data.get("token") if isinstance(data, dict) else None
    if not isinstance(token, str) or not token:
        raise WazuhApiError("Wazuh did not return an authentication token.")

    cache.set(cache_key, token, timeout=_TOKEN_CACHE_SECONDS)
    return token, cache_key


def buscar_status_agente_windows() -> dict[str, str | None]:
    api_url, username, password, agent_id, ca_bundle = _get_api_configuration()
    token, cache_key = _get_token(api_url, username, password, ca_bundle)

    def buscar_agente(token_atual: str) -> dict[str, Any]:
        return _request_json("GET",f"{api_url}/agents",headers={"Authorization": f"Bearer {token_atual}"},params={"agents_list": agent_id},verify=ca_bundle,operation="fetching the Windows agent")

    try:
        payload = buscar_agente(token)
    except WazuhUnauthorizedError:
        cache.delete(cache_key)
        token, _ = _get_token(api_url, username, password, ca_bundle, force_refresh=True)
        payload = buscar_agente(token)

    data = payload.get("data")
    agents = data.get("affected_items") if isinstance(data, dict) else None
    if not isinstance(agents, list):
        raise WazuhApiError("Wazuh returned an invalid agent list.")

    agent = next(
        (
            item for item in agents
            if isinstance(item, dict) and str(item.get("id")) == agent_id
        ), None,
    )
    if agent is None:
        raise WazuhAgentNotFound(f"Wazuh agent {agent_id} was not found.")

    agent_status = agent.get("status")
    if not isinstance(agent_status, str) or not agent_status:
        raise WazuhApiError("Wazuh returned an agent without a status.")

    os_info = agent.get("os")
    os_name = os_info.get("name") if isinstance(os_info, dict) else None
    os_version = os_info.get("version") if isinstance(os_info, dict) else None
    os_label = " ".join(value.strip()
        for value in (os_name, os_version)
        if isinstance(value, str) and value.strip()
    ) or None

    name = agent.get("name")
    last_keepalive = agent.get("lastKeepAlive", agent.get("last_keepalive"))

    return {
        "agent_id": agent_id,
        "name": name if isinstance(name, str) else "",
        "status": agent_status.lower(),
        "os": os_label,
        "last_keepalive": last_keepalive if isinstance(last_keepalive, str) else None,
    }
