"""
Pytest fixtures: in-memory SQLite, test client, and auth tokens.
Set DATABASE_URL before any app import so tests use in-memory DB.
Use the app's engine so tables and sessions share the same DB.
"""
import os
import sys

# Use a single test DB file so all connections share the same DB (sqlite :memory: is per-connection)
_backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.environ["DATABASE_URL"] = f"sqlite:///{os.path.join(_backend_dir, 'test_jobportal.db').replace(chr(92), '/')}"

# Ensure backend app is on path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import pytest
from fastapi.testclient import TestClient

from app.core.database import Base, engine, SessionLocal, get_db
from app.core.rate_limiter import _attempts as _rate_limit_attempts
from app.core.security import hash_password
from app.main import app
from app.users.model import User


@pytest.fixture(autouse=True)
def clear_rate_limiter():
    """Clear rate limiter state so auth endpoints don't return 429 across tests."""
    _rate_limit_attempts.clear()
    yield
    _rate_limit_attempts.clear()


@pytest.fixture
def db():
    """Fresh DB and tables per test using app's engine; session closed and tables dropped after."""
    Base.metadata.create_all(engine)
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(engine)


@pytest.fixture
def client(db):
    """Test client with get_db overridden to use the fixture session."""
    def override_get_db():
        try:
            yield db
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


def _login(client, email: str, password: str) -> str:
    r = client.post(
        "/api/v1/auth/login",
        data={"username": email, "password": password},
    )
    assert r.status_code == 200, r.json()
    return r.json()["access_token"]


@pytest.fixture
def admin_token(client, db):
    """Create default admin user and return JWT."""
    u = User(
        name="Admin",
        email="admin@test.com",
        password_hash=hash_password("password123"),
        role="admin",
        is_active=True,
    )
    db.add(u)
    db.commit()
    return _login(client, "admin@test.com", "password123")


@pytest.fixture
def employer_token(client, db):
    """Create employer user and return JWT."""
    u = User(
        name="Employer One",
        email="employer@test.com",
        password_hash=hash_password("pass123"),
        role="employer",
        is_active=True,
    )
    db.add(u)
    db.commit()
    return _login(client, "employer@test.com", "pass123")


@pytest.fixture
def jobseeker_token(client, db):
    """Create jobseeker user and return JWT."""
    u = User(
        name="Jobseeker One",
        email="jobseeker@test.com",
        password_hash=hash_password("pass123"),
        role="jobseeker",
        is_active=True,
    )
    db.add(u)
    db.commit()
    return _login(client, "jobseeker@test.com", "pass123")
