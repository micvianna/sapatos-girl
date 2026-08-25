import pytest

from conftest import REQUEST_TIMEOUT


def test_rejects_profile_without_token(api_client, base_url):
    response = api_client.get(f"{base_url}/api/users/perfil", timeout=REQUEST_TIMEOUT)

    assert response.status_code == 401


def test_returns_profile_without_password(api_client, base_url, auth_headers, test_user):
    response = api_client.get(
        f"{base_url}/api/users/perfil",
        headers=auth_headers,
        timeout=REQUEST_TIMEOUT,
    )

    assert response.status_code == 200
    assert response.json()["id"] == test_user["id"]
    assert response.json()["email"] == test_user["email"]
    assert "senha" not in response.json()


def test_updates_profile(api_client, base_url, auth_headers):
    response = api_client.put(
        f"{base_url}/api/users/perfil",
        headers=auth_headers,
        json={"nome": "Nome Atualizado", "telefone": "11888888888"},
        timeout=REQUEST_TIMEOUT,
    )

    assert response.status_code == 200
    profile_response = api_client.get(
        f"{base_url}/api/users/perfil",
        headers=auth_headers,
        timeout=REQUEST_TIMEOUT,
    )
    assert profile_response.json()["nome"] == "Nome Atualizado"
    assert profile_response.json()["telefone"] == "11888888888"


@pytest.mark.parametrize("authorization", ["Bearer inválido", "Token sem-bearer"])
def test_rejects_invalid_token_for_profile(api_client, base_url, authorization):
    response = api_client.get(
        f"{base_url}/api/users/perfil",
        headers={"Authorization": authorization},
        timeout=REQUEST_TIMEOUT,
    )

    assert response.status_code == 401


def test_json_and_cors_headers_are_present(api_client, base_url, frontend_origin):
    response = api_client.get(
        f"{base_url}/api/health",
        headers={"Origin": frontend_origin},
        timeout=REQUEST_TIMEOUT,
    )

    assert response.headers["Content-Type"].startswith("application/json")
    assert response.headers["Access-Control-Allow-Origin"] == frontend_origin
