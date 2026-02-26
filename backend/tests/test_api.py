"""Protected routes, RBAC, jobs, applications, admin."""
import pytest


def test_users_me_unauthorized(client):
    r = client.get("/api/v1/users/me")
    assert r.status_code == 401


def test_users_me_success(client, employer_token):
    r = client.get(
        "/api/v1/users/me",
        headers={"Authorization": f"Bearer {employer_token}"},
    )
    assert r.status_code == 200
    assert r.json()["email"] == "employer@test.com"


def test_admin_overview_forbidden_as_employer(client, employer_token):
    r = client.get(
        "/api/v1/admin/stats/overview",
        headers={"Authorization": f"Bearer {employer_token}"},
    )
    assert r.status_code == 403


def test_admin_overview_success(client, admin_token):
    r = client.get(
        "/api/v1/admin/stats/overview",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert r.status_code == 200
    data = r.json()
    assert "total_users" in data
    assert "total_jobs" in data


def test_create_job_as_employer(client, employer_token):
    r = client.post(
        "/api/v1/jobs/",
        headers={"Authorization": f"Bearer {employer_token}"},
        json={
            "title": "Test Job",
            "description": "Description here with enough length",
            "location": "City",
        },
    )
    assert r.status_code == 201
    assert r.json()["title"] == "Test Job"


def test_create_job_forbidden_as_jobseeker(client, jobseeker_token):
    r = client.post(
        "/api/v1/jobs/",
        headers={"Authorization": f"Bearer {jobseeker_token}"},
        json={
            "title": "Test Job",
            "description": "Description here with enough length",
            "location": "City",
        },
    )
    assert r.status_code == 403


def test_list_jobs_public(client):
    r = client.get("/api/v1/jobs/")
    assert r.status_code == 200
    assert isinstance(r.json(), list)


def test_apply_to_job_as_jobseeker(client, employer_token, jobseeker_token):
    # Create a job as employer
    j = client.post(
        "/api/v1/jobs/",
        headers={"Authorization": f"Bearer {employer_token}"},
        json={
            "title": "Dev Job",
            "description": "Developer role with enough text",
            "location": "Remote",
        },
    )
    assert j.status_code == 201
    job_id = j.json()["id"]

    r = client.post(
        f"/api/v1/applications/{job_id}",
        headers={"Authorization": f"Bearer {jobseeker_token}"},
    )
    assert r.status_code == 201


def test_my_applications_as_jobseeker(client, jobseeker_token):
    r = client.get(
        "/api/v1/applications/my",
        headers={"Authorization": f"Bearer {jobseeker_token}"},
    )
    assert r.status_code == 200
    assert isinstance(r.json(), list)


def test_admin_list_users(client, admin_token):
    r = client.get(
        "/api/v1/admin/users",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert r.status_code == 200
    assert isinstance(r.json(), list)
