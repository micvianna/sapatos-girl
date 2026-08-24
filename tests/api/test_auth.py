import uuid
import requests

def test_register_user_success(base_url):
    email = f"qa_{uuid.uuid4()}@teste.com"

    payload = {
        "nome": "QA Automation",
        "email": email,
        "senha": "Teste@123",
        "telefone": "11999999999"
   }

    response = requests.post(
        f"{base_url}/auth/register",
        json=payload,
        timeout=10
    )

    assert response.status_code == 201

    body = response.json()

    assert body["message"] == "Usuário criado com sucesso"
    assert "token" in body
    assert body["user"]["email"] == email

def test_register_user_failure_invalid_email(base_url):
    payload = {
        "nome": "QA Automation",
        "email": "email-invalido",
        "senha": "Teste@123"
    }

    response = requests.post(
        f"{base_url}/auth/register",
        json=payload,
        timeout=10
    )

    assert response.status_code == 400
    body = response.json()
    assert body["error"] == "Email inválido"
