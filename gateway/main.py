import os
from contextlib import asynccontextmanager

from fastapi import FastAPI, Body, Request, Response, Security
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel, Field
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import httpx

BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8007").rstrip("/")
NODE_BACKEND_URL = os.getenv("NODE_BACKEND_URL", "http://localhost:9000").rstrip("/")
bearer_scheme = HTTPBearer(auto_error=False)

openapi_tags = [
    {"name": "Health", "description": "Gateway health and backend target information."},
    {"name": "Auth", "description": "Login and register user accounts."},
    {"name": "Requests", "description": "Create, search, update, and delete service requests."},
    {"name": "Users", "description": "Current-user profile, account management, and password changes."},
    {"name": "Gateway Proxy", "description": "Fallback proxy for backend API routes not listed above."},
]


class LoginRequest(BaseModel):
    email: str = Field(..., examples=["user@example.com"])
    password: str = Field(..., examples=["password123"])


class RegisterRequest(BaseModel):
    name: str = Field(..., examples=["Asha Kumar"])
    email: str = Field(..., examples=["asha@example.com"])
    password: str = Field(..., examples=["password123"])
    role: str | None = Field(default="USER", examples=["USER"])


class CreateServiceRequest(BaseModel):
    title: str = Field(..., examples=["Wifi not working"])
    description: str = Field(..., examples=["The office wifi is disconnecting frequently."])
    category: str = Field(..., examples=["maintenance"])
    priority: str | None = Field(default="LOW", examples=["HIGH"])


class ChangePasswordRequest(BaseModel):
    oldPassword: str = Field(..., examples=["old-password"])
    newPassword: str = Field(..., examples=["new-password"])


class GatewayMessage(BaseModel):
    message: str
    backend: str


@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.http_client = httpx.AsyncClient(
        timeout=15.0,
        limits=httpx.Limits(max_connections=50, max_keepalive_connections=20),
    )
    yield
    await app.state.http_client.aclose()


app = FastAPI(
    title="SRM API Gateway",
    description="FastAPI gateway forwarding frontend API calls to backend services.",
    version="1.0.0",
    openapi_tags=openapi_tags,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    swagger_ui_parameters={"defaultModelsExpandDepth": -1},
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def build_backend_url(path: str) -> str:
    # Route paths that start with "mongo/" to the Node backend
    if path.startswith("mongo/"):
        # strip the leading 'mongo/' and forward to node backend
        subpath = path[len("mongo/"):]
        return f"{NODE_BACKEND_URL}/api/mongo/{subpath}"
    return f"{BACKEND_URL}/api/{path}"


def filtered_headers(request_headers):
    headers = {}
    for key, value in request_headers.items():
        lower_key = key.lower()
        if lower_key in {
            "host",
            "content-length",
            "accept-encoding",
            "connection",
            "keep-alive",
            "proxy-authenticate",
            "proxy-authorization",
            "te",
            "trailer",
            "transfer-encoding",
            "upgrade",
        }:
            continue
        headers[key] = value
    return headers


@app.get("/", response_model=GatewayMessage, tags=["Health"], summary="Gateway health check")
async def root():
    return {"message": "SRM API Gateway is running", "backend": BACKEND_URL}


@app.post("/api/auth/login", tags=["Auth"], summary="Login")
async def login(request: Request, payload: LoginRequest = Body(...)):
    return await proxy("auth/login", request)


@app.post("/api/auth/register", tags=["Auth"], summary="Register a user")
async def register(request: Request, payload: RegisterRequest = Body(...)):
    return await proxy("auth/register", request)


@app.post("/api/requests", tags=["Requests"], summary="Create a service request")
async def create_request(
    request: Request,
    payload: CreateServiceRequest = Body(...),
    _credentials: HTTPAuthorizationCredentials | None = Security(bearer_scheme),
):
    return await proxy("requests", request)


@app.get("/api/requests/my", tags=["Requests"], summary="List requests for the current user")
async def list_my_requests(
    request: Request,
    _credentials: HTTPAuthorizationCredentials | None = Security(bearer_scheme),
):
    return await proxy("requests/my", request)


@app.get("/api/requests", tags=["Requests"], summary="List all service requests")
async def list_requests(
    request: Request,
    _credentials: HTTPAuthorizationCredentials | None = Security(bearer_scheme),
):
    return await proxy("requests", request)


@app.get("/api/requests/search", tags=["Requests"], summary="Search service requests")
async def search_requests(
    request: Request,
    query: str,
    _credentials: HTTPAuthorizationCredentials | None = Security(bearer_scheme),
):
    return await proxy("requests/search", request)


@app.patch("/api/requests/{request_id}/status", tags=["Requests"], summary="Update request status")
async def update_request_status(
    request_id: int,
    request: Request,
    status: str,
    _credentials: HTTPAuthorizationCredentials | None = Security(bearer_scheme),
):
    return await proxy(f"requests/{request_id}/status", request)


@app.patch("/api/requests/{request_id}/priority", tags=["Requests"], summary="Update request priority")
async def update_request_priority(
    request_id: int,
    request: Request,
    priority: str,
    _credentials: HTTPAuthorizationCredentials | None = Security(bearer_scheme),
):
    return await proxy(f"requests/{request_id}/priority", request)


@app.delete("/api/requests/{request_id}", tags=["Requests"], summary="Delete a service request")
async def delete_request(
    request_id: int,
    request: Request,
    _credentials: HTTPAuthorizationCredentials | None = Security(bearer_scheme),
):
    return await proxy(f"requests/{request_id}", request)


@app.get("/api/users", tags=["Users"], summary="List users")
async def list_users(
    request: Request,
    _credentials: HTTPAuthorizationCredentials | None = Security(bearer_scheme),
):
    return await proxy("users", request)


@app.get("/api/users/me", tags=["Users"], summary="Get current user")
async def get_current_user(
    request: Request,
    _credentials: HTTPAuthorizationCredentials | None = Security(bearer_scheme),
):
    return await proxy("users/me", request)


@app.delete("/api/users/{user_id}", tags=["Users"], summary="Delete a user")
async def delete_user(
    user_id: int,
    request: Request,
    _credentials: HTTPAuthorizationCredentials | None = Security(bearer_scheme),
):
    return await proxy(f"users/{user_id}", request)


@app.post("/api/users/change-password", tags=["Users"], summary="Change current user's password")
async def change_password(
    request: Request,
    payload: ChangePasswordRequest = Body(...),
    _credentials: HTTPAuthorizationCredentials | None = Security(bearer_scheme),
):
    return await proxy("users/change-password", request)


@app.api_route(
    "/api/{path:path}",
    methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    tags=["Gateway Proxy"],
    include_in_schema=False,
)
async def proxy(path: str, request: Request):
    if request.method == "OPTIONS":
        return Response(status_code=200)

    headers = filtered_headers(request.headers)
    body = await request.body()

    try:
        backend_response = await request.app.state.http_client.request(
            request.method,
            build_backend_url(path),
            headers=headers,
            params=request.query_params.multi_items(),
            content=body,
        )
    except httpx.TimeoutException:
        return JSONResponse(
            status_code=504,
            content={"detail": "The backend service timed out."},
        )
    except httpx.RequestError:
        return JSONResponse(
            status_code=502,
            content={"detail": "The backend service is unavailable."},
        )

    response_headers = {
        key: value
        for key, value in backend_response.headers.items()
        if key.lower() not in {"content-length", "transfer-encoding", "connection", "content-encoding"}
    }

    return Response(
        content=backend_response.content,
        status_code=backend_response.status_code,
        headers=response_headers,
        media_type=backend_response.headers.get("content-type"),
    )
