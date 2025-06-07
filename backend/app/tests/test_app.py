import pytest
from app import create_app

# === FIXTURES ====================================================================================

@pytest.fixture()
def app():
    """Create and configure a new Flask application instance for testing."""
    app = create_app()
    app.config.update({
        "TESTING": True,
    })
    yield app


@pytest.fixture()
def client(app):
    """Create a test client using the Flask application instance."""
    return app.test_client()


# === TESTS =======================================================================================

def test_homepage(client):
    """Test if the homepage responds with a 200 (OK) status code."""
    response = client.get("/")
    assert response.status_code == 200


def test_not_found(client):
    """Test if a request to a non-existing endpoint returns a 404 (Not Found) status code."""
    response = client.get("/non-existing-endpoint")
    assert response.status_code == 404


def test_post_method(client):
    """Test if a POST request to the homepage returns either 200 (OK) or 405 (Method Not Allowed)."""
    response = client.post("/")
    assert response.status_code in (200, 405)
