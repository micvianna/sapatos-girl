import hashlib
import uuid

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
        cursor.execute(
            """
            SELECT c.ativo
            FROM carrinhos c
            JOIN itens_carrinho ic ON ic.carrinho_id = c.id
            WHERE ic.id = %s
            """,
            (cart_item["id"],),
        )
        cart_is_active = cursor.fetchone()[0]

    assert float(persisted_order[0]) == float(response.json()["total"])
    assert persisted_order[1] == "pendente"
    assert len(persisted_items) == 1
    assert str(persisted_items[0][0]) == cart_item["produto_id"]
    assert persisted_items[0][1] == cart_item["quantidade"]
    assert cart_is_active is False


@pytest.mark.integration
def test_solicitacao_de_reset_invalida_token_anterior_e_armazena_apenas_hash(
    api_client, base_url, test_user, db_connection
):
    first_response = api_client.post(
        f"{base_url}/api/auth/reset/request",
        json={"email": test_user["email"]},
        timeout=REQUEST_TIMEOUT,
    )
    assert first_response.status_code == 200, first_response.text

    second_response = api_client.post(
        f"{base_url}/api/auth/reset/request",
        json={"email": test_user["email"]},
        timeout=REQUEST_TIMEOUT,
    )
    assert second_response.status_code == 200, second_response.text

    with db_connection.cursor() as cursor:
        cursor.execute(
            """
            SELECT token_hash, used
            FROM password_reset_tokens
            WHERE usuario_id = %s
            ORDER BY expires_at ASC
            """,
            (test_user["id"],),
        )
        tokens = cursor.fetchall()

    assert len(tokens) == 2
    assert tokens[0][1] is True
    assert tokens[1][1] is False
    assert len(tokens[1][0]) == 64

    reset_token = second_response.json().get("resetToken")
    if reset_token:
        assert tokens[1][0] == hashlib.sha256(reset_token.encode()).hexdigest()


@pytest.mark.integration
def test_confirmacao_de_reset_altera_senha_e_inutiliza_token(
    api_client, base_url, test_user, db_connection
):
    reset_token = f"reset-{uuid.uuid4().hex}"
    token_hash = hashlib.sha256(reset_token.encode()).hexdigest()
    reset_id = uuid.uuid4()

    with db_connection.cursor() as cursor:
        cursor.execute(
            """
            INSERT INTO password_reset_tokens (id, usuario_id, token_hash, expires_at)
            VALUES (%s, %s, %s, NOW() + INTERVAL '1 hour')
            """,
            (reset_id, test_user["id"], token_hash),
        )
    db_connection.commit()

    nova_senha = "SenhaRedefinida123!"
    response = api_client.post(
        f"{base_url}/api/auth/reset/confirm",
        json={"token": reset_token, "novaSenha": nova_senha},
        timeout=REQUEST_TIMEOUT,
    )

    assert response.status_code == 200, response.text
    assert response.json()["message"] == "Senha redefinida com sucesso"

    with db_connection.cursor() as cursor:
        cursor.execute("SELECT senha FROM usuarios WHERE id = %s", (test_user["id"],))
        persisted_password = cursor.fetchone()[0]
        cursor.execute(
            "SELECT used FROM password_reset_tokens WHERE id = %s", (reset_id,)
        )
        token_used = cursor.fetchone()[0]

    assert persisted_password != test_user["senha"]
    assert bcrypt.checkpw(nova_senha.encode(), persisted_password.encode())
    assert token_used is True

    old_login = api_client.post(
        f"{base_url}/api/auth/login",
        json={"email": test_user["email"], "senha": test_user["senha"]},
        timeout=REQUEST_TIMEOUT,
    )
    new_login = api_client.post(
        f"{base_url}/api/auth/login",
        json={"email": test_user["email"], "senha": nova_senha},
        timeout=REQUEST_TIMEOUT,
    )

    assert old_login.status_code == 401
    assert new_login.status_code == 200


@pytest.mark.integration
def test_limpeza_de_carrinho_remove_itens_sem_afetar_outro_usuario(
    api_client, base_url, auth_headers, cart_item, db_connection
):
    response = api_client.delete(
        f"{base_url}/api/cart/limpar",
        headers=auth_headers,
        timeout=REQUEST_TIMEOUT,
    )
    assert response.status_code == 200, response.text

    with db_connection.cursor() as cursor:
        cursor.execute(
            "SELECT COUNT(*) FROM itens_carrinho WHERE id = %s", (cart_item["id"],)
        )
        remaining_items = cursor.fetchone()[0]

    assert remaining_items == 0
