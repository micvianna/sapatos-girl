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


def test_pedido_rejeita_metodo_de_pagamento_invalido(
    api_client, base_url, auth_headers, cart_item
):
    order = {**VALID_ORDER, "metodo_pagamento": "dinheiro"}
    response = api_client.post(
        f"{base_url}/api/orders/criar",
        headers=auth_headers,
        json=order,
        timeout=REQUEST_TIMEOUT,
    )

    assert response.status_code == 400
    assert response.json()["error"] == "Método de pagamento inválido"
    assert cart_item["id"]


def test_primeira_compra_no_cartao_entra_em_analise(
    api_client, base_url, auth_headers, cart_item
):
    order = {**VALID_ORDER, "metodo_pagamento": "cartao_credito"}
    response = api_client.post(
        f"{base_url}/api/orders/criar",
        headers=auth_headers,
        json=order,
        timeout=REQUEST_TIMEOUT,
    )

    assert response.status_code == 200
    assert response.json()["status"] == "em_analise"
    assert response.json()["emAnalise"] is True
    assert cart_item["id"]


def test_pagamento_pix_retorna_desconto_e_prazo_de_entrega(
    api_client, base_url, auth_headers, cart_item
):
    response = api_client.post(
        f"{base_url}/api/orders/criar",
        headers=auth_headers,
        json=VALID_ORDER,
        timeout=REQUEST_TIMEOUT,
    )

    assert response.status_code == 200
    assert float(response.json()["descontoPix"]) > 0
    assert response.json()["prazoEntrega"] in {
        "Same-Day (até 21h00)",
        "Padrão (3-7 dias úteis)",
    }
    assert cart_item["id"]
