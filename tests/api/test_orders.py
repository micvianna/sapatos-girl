import pytest

from conftest import REQUEST_TIMEOUT


VALID_ORDER = {
    "endereco": "Rua das Flores, 100",
    "cidade": "São Paulo",
    "estado": "SP",
    "cep": "01000-000",
    "telefone": "11999999999",
    "metodo_pagamento": "pix",
}


def test_rejects_order_without_token(api_client, base_url):
    response = api_client.post(
        f"{base_url}/api/orders/criar",
        json=VALID_ORDER,
        timeout=REQUEST_TIMEOUT,
    )

    assert response.status_code == 401


def test_rejects_order_with_empty_cart(api_client, base_url, auth_headers):
    response = api_client.post(
        f"{base_url}/api/orders/criar",
        headers=auth_headers,
        json=VALID_ORDER,
        timeout=REQUEST_TIMEOUT,
    )

    assert response.status_code == 400
    assert response.json()["error"] == "Carrinho vazio"


@pytest.mark.parametrize(
    "missing_field", ["endereco", "cidade", "estado", "cep", "metodo_pagamento"]
)
def test_rejects_order_without_required_field(
    api_client, base_url, auth_headers, missing_field
):
    order = dict(VALID_ORDER)
    order.pop(missing_field)

    response = api_client.post(
        f"{base_url}/api/orders/criar",
        headers=auth_headers,
        json=order,
        timeout=REQUEST_TIMEOUT,
    )

    assert response.status_code == 400


def test_creates_order_from_cart(api_client, base_url, auth_headers, cart_item):
    response = api_client.post(
        f"{base_url}/api/orders/criar",
        headers=auth_headers,
        json=VALID_ORDER,
        timeout=REQUEST_TIMEOUT,
    )

    assert response.status_code == 200
    assert response.json()["pedidoId"]
    assert float(response.json()["total"]) > 0


def test_lists_authenticated_users_orders(
    api_client, base_url, auth_headers, cart_item
):
    create_response = api_client.post(
        f"{base_url}/api/orders/criar",
        headers=auth_headers,
        json=VALID_ORDER,
        timeout=REQUEST_TIMEOUT,
    )
    assert create_response.status_code == 200, create_response.text

    response = api_client.get(
        f"{base_url}/api/orders",
        headers=auth_headers,
        timeout=REQUEST_TIMEOUT,
    )

    assert response.status_code == 200
    assert isinstance(response.json(), list)
    assert response.json()[0]["id"] == create_response.json()["pedidoId"]
    assert response.json()[0]["status"] == "pendente"


def test_rejects_order_listing_without_token(api_client, base_url):
    response = api_client.get(f"{base_url}/api/orders", timeout=REQUEST_TIMEOUT)

    assert response.status_code == 401
