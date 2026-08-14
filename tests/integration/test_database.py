import bcrypt
import pytest

from conftest import REQUEST_TIMEOUT
from api.test_orders import VALID_ORDER


@pytest.mark.integration
def test_registered_user_is_persisted_with_hashed_password(
    api_client, base_url, user_data, db_connection
):
    response = api_client.post(
        f"{base_url}/api/auth/register",
        json=user_data,
        timeout=REQUEST_TIMEOUT,
    )
    assert response.status_code == 201, response.text

    with db_connection.cursor() as cursor:
        cursor.execute(
            "SELECT id, email, senha FROM usuarios WHERE email = %s",
            (user_data["email"],),
        )
        persisted_user = cursor.fetchone()

    assert str(persisted_user[0]) == response.json()["user"]["id"]
    assert persisted_user[1] == user_data["email"]
    assert persisted_user[2] != user_data["senha"]
    assert bcrypt.checkpw(
        user_data["senha"].encode(), persisted_user[2].encode()
    )


@pytest.mark.integration
def test_created_order_and_items_are_persisted(
    api_client, base_url, auth_headers, cart_item, db_connection
):
    response = api_client.post(
        f"{base_url}/api/orders/criar",
        headers=auth_headers,
        json=VALID_ORDER,
        timeout=REQUEST_TIMEOUT,
    )
    assert response.status_code == 200, response.text
    order_id = response.json()["pedidoId"]

    with db_connection.cursor() as cursor:
        cursor.execute(
            "SELECT total, status FROM pedidos WHERE id = %s",
            (order_id,),
        )
        persisted_order = cursor.fetchone()
        cursor.execute(
            "SELECT produto_id, quantidade FROM itens_pedido WHERE pedido_id = %s",
            (order_id,),
        )
        persisted_items = cursor.fetchall()

    assert float(persisted_order[0]) == float(response.json()["total"])
    assert persisted_order[1] == "pendente"
    assert len(persisted_items) == 1
    assert str(persisted_items[0][0]) == cart_item["produto_id"]
    assert persisted_items[0][1] == cart_item["quantidade"]
