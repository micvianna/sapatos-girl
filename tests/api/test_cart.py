import uuid

import pytest

from conftest import REQUEST_TIMEOUT, make_test_user


@pytest.mark.parametrize(
    "authorization",
    [None, "Bearer token-invalido", "conteudo-malformado"],
)
def test_rejects_cart_access_without_valid_jwt(api_client, base_url, authorization):
    headers = {}
    if authorization:
        headers["Authorization"] = authorization

    response = api_client.get(
        f"{base_url}/api/cart",
        headers=headers,
        timeout=REQUEST_TIMEOUT,
    )

    assert response.status_code == 401
    assert "error" in response.json()


def test_adds_product_to_cart(api_client, base_url, auth_headers, created_product):
    response = api_client.post(
        f"{base_url}/api/cart/adicionar",
        headers=auth_headers,
        json={"produtoId": created_product["id"], "quantidade": 2},
        timeout=REQUEST_TIMEOUT,
    )

    assert response.status_code == 200
    assert response.json()["message"] == "Produto adicionado ao carrinho"


def test_rejects_missing_product(api_client, base_url, auth_headers):
    response = api_client.post(
        f"{base_url}/api/cart/adicionar",
        headers=auth_headers,
        json={"quantidade": 1},
        timeout=REQUEST_TIMEOUT,
    )

    assert response.status_code == 400


def test_rejects_negative_quantity_when_adding(
    api_client, base_url, auth_headers, created_product
):
    response = api_client.post(
        f"{base_url}/api/cart/adicionar",
        headers=auth_headers,
        json={"produtoId": created_product["id"], "quantidade": -1},
        timeout=REQUEST_TIMEOUT,
    )

    assert response.status_code == 400


def test_rejects_unknown_product(api_client, base_url, auth_headers):
    response = api_client.post(
        f"{base_url}/api/cart/adicionar",
        headers=auth_headers,
        json={"produtoId": str(uuid.uuid4()), "quantidade": 1},
        timeout=REQUEST_TIMEOUT,
    )

    assert response.status_code == 400


def test_reads_cart(api_client, base_url, auth_headers, cart_item):
    response = api_client.get(
        f"{base_url}/api/cart",
        headers=auth_headers,
        timeout=REQUEST_TIMEOUT,
    )

    assert response.status_code == 200
    assert isinstance(response.json()["itens"], list)
    assert response.json()["quantidade"] >= 1
    assert float(response.json()["total"]) >= 0
    assert response.json()["itens"][0]["id"] == cart_item["id"]


def test_updates_item_quantity(api_client, base_url, auth_headers, cart_item):
    response = api_client.put(
        f"{base_url}/api/cart/{cart_item['id']}",
        headers=auth_headers,
        json={"quantidade": 3},
        timeout=REQUEST_TIMEOUT,
    )

    assert response.status_code == 200
    cart_response = api_client.get(
        f"{base_url}/api/cart",
        headers=auth_headers,
        timeout=REQUEST_TIMEOUT,
    )
    assert cart_response.json()["itens"][0]["quantidade"] == 3


@pytest.mark.parametrize("invalid_quantity", [0, -1])
def test_rejects_invalid_quantity_update(
    api_client, base_url, auth_headers, cart_item, invalid_quantity
):
    response = api_client.put(
        f"{base_url}/api/cart/{cart_item['id']}",
        headers=auth_headers,
        json={"quantidade": invalid_quantity},
        timeout=REQUEST_TIMEOUT,
    )

    assert response.status_code == 400


def test_removes_item(api_client, base_url, auth_headers, cart_item):
    response = api_client.delete(
        f"{base_url}/api/cart/{cart_item['id']}",
        headers=auth_headers,
        timeout=REQUEST_TIMEOUT,
    )

    assert response.status_code == 200
    cart_response = api_client.get(
        f"{base_url}/api/cart",
        headers=auth_headers,
        timeout=REQUEST_TIMEOUT,
    )
    remaining_ids = [item["id"] for item in cart_response.json()["itens"]]
    assert cart_item["id"] not in remaining_ids


def test_does_not_update_another_users_cart_item(
    api_client, base_url, cart_item
):
    another_user = make_test_user()
    register_response = api_client.post(
        f"{base_url}/api/auth/register",
        json=another_user,
        timeout=REQUEST_TIMEOUT,
    )
    assert register_response.status_code == 201, register_response.text
    another_users_token = register_response.json()["token"]

    response = api_client.put(
        f"{base_url}/api/cart/{cart_item['id']}",
        headers={"Authorization": f"Bearer {another_users_token}"},
        json={"quantidade": 5},
        timeout=REQUEST_TIMEOUT,
    )

    assert response.status_code == 404


@pytest.mark.parametrize("endpoint", ["produto-invalido", "item-invalido"])
def test_carrinho_rejeita_identificador_malformado(
    api_client, base_url, auth_headers, endpoint
):
    if endpoint == "produto-invalido":
        response = api_client.post(
            f"{base_url}/api/cart/adicionar",
            headers=auth_headers,
            json={"produtoId": endpoint, "quantidade": 1},
            timeout=REQUEST_TIMEOUT,
        )
    else:
        response = api_client.delete(
            f"{base_url}/api/cart/{endpoint}",
            headers=auth_headers,
            timeout=REQUEST_TIMEOUT,
        )

    assert response.status_code == 400


def test_limpa_itens_do_carrinho_do_usuario_autenticado(
    api_client, base_url, auth_headers, cart_item
):
    response = api_client.delete(
        f"{base_url}/api/cart/limpar",
        headers=auth_headers,
        timeout=REQUEST_TIMEOUT,
    )

    assert response.status_code == 200
    assert response.json()["message"] == "Carrinho esvaziado com sucesso"

    cart_response = api_client.get(
        f"{base_url}/api/cart", headers=auth_headers, timeout=REQUEST_TIMEOUT
    )
    assert cart_response.status_code == 200
    assert cart_response.json()["itens"] == []
    assert cart_response.json()["quantidade"] == 0
    assert cart_item["id"] not in [item["id"] for item in cart_response.json()["itens"]]


def test_nao_remove_item_do_carrinho_de_outro_usuario(
    api_client, base_url, created_product, test_user
):
    owner_headers = {"Authorization": f"Bearer {test_user['token']}"}
    add_response = api_client.post(
        f"{base_url}/api/cart/adicionar",
        headers=owner_headers,
        json={"produtoId": created_product["id"], "quantidade": 1},
        timeout=REQUEST_TIMEOUT,
    )
    assert add_response.status_code == 200, add_response.text

    owner_cart = api_client.get(
        f"{base_url}/api/cart", headers=owner_headers, timeout=REQUEST_TIMEOUT
    )
    item_id = owner_cart.json()["itens"][0]["id"]

    another_user = make_test_user()
    register_response = api_client.post(
        f"{base_url}/api/auth/register",
        json=another_user,
        timeout=REQUEST_TIMEOUT,
    )
    assert register_response.status_code == 201, register_response.text

    response = api_client.delete(
        f"{base_url}/api/cart/{item_id}",
        headers={"Authorization": f"Bearer {register_response.json()['token']}"},
        timeout=REQUEST_TIMEOUT,
    )

    assert response.status_code == 404

    owner_cart_after_attempt = api_client.get(
        f"{base_url}/api/cart", headers=owner_headers, timeout=REQUEST_TIMEOUT
    )
    assert [item["id"] for item in owner_cart_after_attempt.json()["itens"]] == [item_id]
