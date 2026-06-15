from unittest.mock import AsyncMock

import httpx
from fastapi.testclient import TestClient

from main import app


def test_root_reports_backend():
    with TestClient(app) as client:
        response = client.get("/")

    assert response.status_code == 200
    assert response.json()["backend"] == "http://localhost:8007"


def test_proxy_preserves_repeated_query_parameters():
    with TestClient(app) as client:
        mock_response = httpx.Response(
            200,
            json={"ok": True},
            request=httpx.Request("GET", "http://localhost:8007/api/requests"),
        )
        client.app.state.http_client.request = AsyncMock(return_value=mock_response)

        response = client.get("/api/requests?status=open&status=pending")

        assert response.status_code == 200
        call = client.app.state.http_client.request.await_args
        assert list(call.kwargs["params"]) == [
            ("status", "open"),
            ("status", "pending"),
        ]


def test_proxy_returns_bad_gateway_when_backend_is_unavailable():
    with TestClient(app) as client:
        request = httpx.Request("GET", "http://localhost:8007/api/requests")
        client.app.state.http_client.request = AsyncMock(
            side_effect=httpx.ConnectError("connection refused", request=request)
        )

        response = client.get("/api/requests")

    assert response.status_code == 502
    assert response.json() == {"detail": "The backend service is unavailable."}


def test_proxy_returns_gateway_timeout_when_backend_times_out():
    with TestClient(app) as client:
        request = httpx.Request("GET", "http://localhost:8007/api/requests")
        client.app.state.http_client.request = AsyncMock(
            side_effect=httpx.ReadTimeout("timed out", request=request)
        )

        response = client.get("/api/requests")

    assert response.status_code == 504
    assert response.json() == {"detail": "The backend service timed out."}
