"""Auth API: register and login."""
import pytest


def test_register_employer_success(client):
    r = client.post(
        "/api/v1/auth/register",
        json={
            "name": "New Employer",
            "email": "newemp@test.com",
            "password": "pass123",
            "role": "employer",
        },
    )
    assert r.status_code == 201
    data = r.json()
    assert data["email"] == "newemp@test.com"
    assert data["role"] == "employer"
    assert "password" not in data


def test_register_jobseeker_success(client):
    r = client.post(
        "/api/v1/auth/register",
        json={
            "name": "New Jobseeker",
            "email": "newjob@test.com",
            "password": "pass123",
            "role": "jobseeker",
        },
    )
    assert r.status_code == 201
    assert r.json()["role"] == "jobseeker"


def test_register_email_already_exists(client, employer_token):
    r = client.post(
        "/api/v1/auth/register",
        json={
            "name": "Other",
            "email": "employer@test.com",
            "password": "other123",
            "role": "jobseeker",
        },
    )
    assert r.status_code == 400
    assert "already registered" in r.json().get("detail", "").lower()


def test_register_weak_password_no_digit(client):
    r = client.post(
        "/api/v1/auth/register",
        json={
            "name": "User",
            "email": "weak@test.com",
            "password": "lettersonly",
            "role": "jobseeker",
        },
    )
    assert r.status_code == 400
    assert "letter" in r.json().get("detail", "").lower() or "number" in r.json().get("detail", "").lower()


def test_register_weak_password_no_letter(client):
    r = client.post(
        "/api/v1/auth/register",
        json={
            "name": "User",
            "email": "weak2@test.com",
            "password": "12345678",
            "role": "jobseeker",
        },
    )
    assert r.status_code == 400


def test_login_success(client, employer_token):
    r = client.post(
        "/api/v1/auth/login",
        data={"username": "employer@test.com", "password": "pass123"},
    )
    assert r.status_code == 200
    assert "access_token" in r.json()
    assert r.json()["token_type"] == "bearer"


def test_login_invalid_credentials(client):
    r = client.post(
        "/api/v1/auth/login",
        data={"username": "nonexistent@test.com", "password": "wrong"},
    )
    assert r.status_code == 401
