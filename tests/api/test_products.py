import uuid

from conftest import REQUEST_TIMEOUT


REQUIRED_PRODUCT_FIELDS = {
    "id",
    "nome",
    "preco",
    "estoque",
    "ativo",
}


def test_lists_products_with_expected_contract(api_client, base_url):
    response = api_client.get(f"{base_url}/api/products", timeout=REQUEST_TIMEOUT)

    assert response.status_code == 200
    products = response.json()
    assert isinstance(products, list)
    assert products, "O schema inicial deveria fornecer produtos ativos"
    assert REQUIRED_PRODUCT_FIELDS.issubset(products[0])
    assert isinstance(products[0]["nome"], str)
    assert float(products[0]["preco"]) >= 0
    assert isinstance(products[0]["estoque"], int)


def test_returns_existing_product(api_client, base_url, created_product):
    response = api_client.get(
        f"{base_url}/api/products/{created_product['id']}",
        timeout=REQUEST_TIMEOUT,
    )

    assert response.status_code == 200
    assert response.json()["id"] == created_product["id"]
    assert REQUIRED_PRODUCT_FIELDS.issubset(response.json())


def test_returns_404_for_unknown_product(api_client, base_url):
    response = api_client.get(
        f"{base_url}/api/products/{uuid.uuid4()}",
        timeout=REQUEST_TIMEOUT,
    )

    assert response.status_code == 404
    assert response.json()["error"] == "Produto não encontrado"


def test_rejects_malformed_product_id(api_client, base_url):
    response = api_client.get(
        f"{base_url}/api/products/id-invalido",
        timeout=REQUEST_TIMEOUT,
    )

    assert response.status_code == 400


def test_filters_products_by_price(api_client, base_url):
    response = api_client.get(
        f"{base_url}/api/products",
        params={"preco_min": "100", "preco_max": "150"},
        timeout=REQUEST_TIMEOUT,
    )

    assert response.status_code == 200
    assert response.json()
    for product in response.json():
        assert 100 <= float(product["preco"]) <= 150


def test_search_parameter_is_treated_as_data(api_client, base_url):
    response = api_client.get(
        f"{base_url}/api/products",
        params={"busca": "%' OR true --"},
        timeout=REQUEST_TIMEOUT,
    )

    assert response.status_code == 200
    assert response.json() == []
