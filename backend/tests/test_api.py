def test_register(client):
    response = client.post("/api/auth/register", json={
        "name": "Alice",
        "email": "alice@example.com",
        "password": "secret123",
    })
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "alice@example.com"
    assert data["name"] == "Alice"
    assert "id" in data


def test_register_duplicate_email(client, registered_user):
    response = client.post("/api/auth/register", json={
        "name": "Another",
        "email": "test@example.com",
        "password": "password123",
    })
    assert response.status_code == 400


def test_login(client, registered_user):
    response = client.post("/api/auth/token", data={
        "username": "test@example.com",
        "password": "password123",
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_login_wrong_password(client, registered_user):
    response = client.post("/api/auth/token", data={
        "username": "test@example.com",
        "password": "wrongpassword",
    })
    assert response.status_code == 401


def test_get_me(client, auth_headers):
    response = client.get("/api/auth/me", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "test@example.com"


def test_get_categories(client, auth_headers):
    response = client.get("/api/categories/", headers=auth_headers)
    assert response.status_code == 200
    categories = response.json()
    assert len(categories) > 0


def test_create_category(client, auth_headers):
    response = client.post("/api/categories/", headers=auth_headers, json={
        "name": "Gaming",
        "icon": "🎯",
        "color": "#123456",
        "type": "expense",
    })
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Gaming"


def test_create_transaction(client, auth_headers):
    categories = client.get("/api/categories/", headers=auth_headers).json()
    expense_cats = [c for c in categories if c["type"] == "expense"]
    cat_id = expense_cats[0]["id"]

    response = client.post("/api/transactions/", headers=auth_headers, json={
        "amount": 50.0,
        "description": "Lunch",
        "type": "expense",
        "date": "2025-01-15T12:00:00",
        "category_id": cat_id,
    })
    assert response.status_code == 201
    data = response.json()
    assert data["amount"] == 50.0
    assert data["description"] == "Lunch"


def test_list_transactions(client, auth_headers):
    client.post("/api/transactions/", headers=auth_headers, json={
        "amount": 100.0,
        "description": "Salary",
        "type": "income",
        "date": "2025-01-01T08:00:00",
    })
    response = client.get("/api/transactions/", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 1
    assert len(data["items"]) >= 1


def test_delete_transaction(client, auth_headers):
    create_resp = client.post("/api/transactions/", headers=auth_headers, json={
        "amount": 20.0,
        "description": "Coffee",
        "type": "expense",
        "date": "2025-01-10T09:00:00",
    })
    tx_id = create_resp.json()["id"]
    del_resp = client.delete(f"/api/transactions/{tx_id}", headers=auth_headers)
    assert del_resp.status_code == 204


def test_monthly_report(client, auth_headers):
    client.post("/api/transactions/", headers=auth_headers, json={
        "amount": 200.0,
        "description": "Income",
        "type": "income",
        "date": "2025-06-01T08:00:00",
    })
    client.post("/api/transactions/", headers=auth_headers, json={
        "amount": 50.0,
        "description": "Food",
        "type": "expense",
        "date": "2025-06-05T12:00:00",
    })
    response = client.get("/api/reports/monthly?month=6&year=2025", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["monthly_summary"]["total_income"] == 200.0
    assert data["monthly_summary"]["total_expenses"] == 50.0
    assert data["monthly_summary"]["balance"] == 150.0
