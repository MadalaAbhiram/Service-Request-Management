# SRM API Gateway

This FastAPI gateway forwards frontend API traffic to the Spring Boot backend.

## Setup

1. Create a Python virtual environment:

   ```bash
   cd gateway
   python -m venv .venv
   .venv\Scripts\activate
   ```

2. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

3. Start the gateway:

   ```powershell
   $env:BACKEND_URL = "http://localhost:8007"
   # If you run the Node backend for Mongo endpoints, set:
   $env:NODE_BACKEND_URL = "http://localhost:9000"
   python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

> If your frontend runs on Vite port `5174`, the gateway now also allows CORS from `http://localhost:5174`.

## Swagger

After starting the gateway, open:

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`
- OpenAPI JSON: `http://localhost:8000/openapi.json`

## Tests

```powershell
python -m pytest
```

## Gateway behavior

- Frontend requests go to `http://localhost:8000/api/...`
- The gateway forwards Spring Boot requests to `http://localhost:8007/api/...`
- Authorization headers are preserved for secured endpoints
- CORS is enabled for local frontend development
