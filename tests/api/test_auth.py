import uuid

import jwt
import pytest

from conftest import REQUEST_TIMEOUT, make_test_user


def test_registers_valid_user(api_client, base_url, user_data):
    response = api_client.post(
        f"{base_url}/api/auth/register",
        json=user_data,
        timeout=REQUEST_TIMEOUT,
    )

    assert response.status_code == 201
    body = response.json()
    assert body["token"]
    assert body["user"]["email"] == user_data["email"]
    assert "senha" not in body["user"]


@pytest.mark.parametrize("missing_field", ["nome", "email", "senha"])
def test_rejects_registration_without_required_field(
    api_client, base_url, user_data, missing_field
):
    user_data.pop(missing_field)

    response = api_client.post(
        f"{base_url}/api/auth/register",
        json=user_data,
        timeout=REQUEST_TIMEOUT,
    )

    assert response.status_code == 400
    assert "error" in response.json()


def test_rejects_invalid_email(api_client, base_url, user_data):
    user_data["email"] = "email-invalido"

    response = api_client.post(
        f"{base_url}/api/auth/register",
        json=user_data,
        timeout=REQUEST_TIMEOUT,
    )

    assert response.status_code == 400


def test_rejects_duplicate_user(api_client, base_url, user_data):
    first_response = api_client.post(
        f"{base_url}/api/auth/register",
        json=user_data,
        timeout=REQUEST_TIMEOUT,
    )
    duplicate_response = api_client.post(
        f"{base_url}/api/auth/register",
        json=user_data,
        timeout=REQUEST_TIMEOUT,
    )

    assert first_response.status_code == 201
    assert duplicate_response.status_code == 400
    assert duplicate_response.json()["error"] == "Usuário já existe"


def test_logs_in_valid_user(api_client, base_url, test_user):
    response = api_client.post(
        f"{base_url}/api/auth/login",
        json={"email": test_user["email"], "senha": test_user["senha"]},
        timeout=REQUEST_TIMEOUT,
    )

    assert response.status_code == 200
    assert response.json()["token"]
    assert response.json()["user"]["id"] == test_user["id"]
    assert "senha" not in response.json()["user"]


def test_rejects_wrong_password(api_client, base_url, test_user):
    response = api_client.post(
        f"{base_url}/api/auth/login",
        json={"email": test_user["email"], "senha": "senha-incorreta"},
        timeout=REQUEST_TIMEOUT,
    )

    assert response.status_code == 401
    assert response.json()["error"] == "Credenciais inválidas"


def test_rejects_unknown_user(api_client, base_url):
    response = api_client.post(
        f"{base_url}/api/auth/login",
        json={"email": f"unknown-{uuid.uuid4().hex}@example.com", "senha": "qualquer"},
        timeout=REQUEST_TIMEOUT,
    )

    assert response.status_code == 401
    assert response.json()["error"] == "Credenciais inválidas"


def test_returned_jwt_identifies_user(test_user, decoded_auth_token):
    assert decoded_auth_token["userId"] == test_user["id"]
    assert decoded_auth_token["email"] == test_user["email"]
    assert decoded_auth_token["exp"] > decoded_auth_token["iat"]


def test_returned_jwt_rejects_wrong_secret(auth_token):
    with pytest.raises(jwt.InvalidSignatureError):
        jwt.decode(auth_token, "segredo-incorreto", algorithms=["HS256"])
