import os
import uuid

import jwt
import psycopg
import pytest
import requests


REQUEST_TIMEOUT = 10


@pytest.fixture(scope="session")
def base_url():
    return os.getenv("API_BASE_URL", "http://localhost:5000").rstrip("/")


@pytest.fixture(scope="session")
def api_client(base_url):
    client = requests.Session()
    client.headers.update({"Accept": "application/json"})

    try:
        response = client.get(f"{base_url}/api/health", timeout=REQUEST_TIMEOUT)
        response.raise_for_status()
    except requests.RequestException as error:
        pytest.exit(f"A API não está disponível em {base_url}: {error}")

    yield client
    client.close()


def make_test_user():
    unique_id = uuid.uuid4().hex
    return {
        "nome": "Usuária de Teste",
        "email": f"qa-{unique_id}@example.com",
        "senha": "SenhaSegura123!",
        "telefone": "11999999999",
    }


@pytest.fixture
def user_data():
    return make_test_user()


@pytest.fixture
def test_user(api_client, base_url, user_data):
    response = api_client.post(
        f"{base_url}/api/auth/register",
        json=user_data,
        timeout=REQUEST_TIMEOUT,
    )
    assert response.status_code == 201, response.text

    created_user = dict(user_data)
    created_user["id"] = response.json()["user"]["id"]
    created_user["token"] = response.json()["token"]
    return created_user


@pytest.fixture
def auth_token(test_user):
    return test_user["token"]


@pytest.fixture
def auth_headers(auth_token):
    return {"Authorization": f"Bearer {auth_token}"}


@pytest.fixture
def created_product(api_client, base_url):
    response = api_client.get(
        f"{base_url}/api/products",
        timeout=REQUEST_TIMEOUT,
    )
    assert response.status_code == 200, response.text
    products = response.json()
    assert products, "O schema inicial deveria fornecer produtos ativos"
    return products[0]


@pytest.fixture
def cart_item(api_client, base_url, auth_headers, created_product):
    add_response = api_client.post(
        f"{base_url}/api/cart/adicionar",
        headers=auth_headers,
        json={
            "produtoId": created_product["id"],
            "quantidade": 1,
            "tamanho": "35",
            "cor": "Rosa",
        },
        timeout=REQUEST_TIMEOUT,
    )
    assert add_response.status_code == 200, add_response.text

    cart_response = api_client.get(
        f"{base_url}/api/cart",
        headers=auth_headers,
        timeout=REQUEST_TIMEOUT,
    )
    assert cart_response.status_code == 200, cart_response.text
    return cart_response.json()["itens"][0]


@pytest.fixture
def decoded_auth_token(auth_token):
    secret = os.getenv("JWT_SECRET")
    if not secret:
        pytest.fail("JWT_SECRET deve ser definida para validar o token")
    return jwt.decode(auth_token, secret, algorithms=["HS256"])


@pytest.fixture
def db_connection():
    connection_parameters = {
        "host": os.getenv("DB_HOST", "localhost"),
        "port": os.getenv("DB_PORT", "5432"),
        "dbname": os.getenv("DB_NAME", "sapatos_ecommerce"),
        "user": os.getenv("DB_USER", "postgres"),
        "password": os.getenv("DB_PASSWORD"),
    }

    if not connection_parameters["password"]:
        pytest.skip("DB_PASSWORD não foi definida para o teste de integração")

    try:
        connection = psycopg.connect(**connection_parameters)
    except psycopg.OperationalError as error:
        pytest.skip(f"PostgreSQL indisponível para o teste de integração: {error}")

    yield connection
    connection.close()
