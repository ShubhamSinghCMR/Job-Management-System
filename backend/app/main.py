from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response
import time

from app.core.config import settings
from app.core.logging_config import setup_logging, get_logger
from app.api.router import api_router

# Setup logging as early as possible (before routes)
setup_logging()
logger = get_logger(__name__)


# ----- Request logging -----
class RequestLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start = time.perf_counter()
        response: Response = await call_next(request)
        duration_ms = (time.perf_counter() - start) * 1000
        client = request.client.host if request.client else "unknown"
        logger.info(
            "%s %s %s %.2fms client=%s",
            request.method,
            request.url.path,
            response.status_code,
            duration_ms,
            client,
        )
        return response


# ----- Secure response headers (Phase 1) -----
class SecureHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response: Response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        return response


# Order: SecureHeaders first (runs last on response), then CORS, then request logging (outer = runs first on request)
app = FastAPI(title=settings.PROJECT_NAME)
app.add_middleware(RequestLoggingMiddleware)
app.add_middleware(SecureHeadersMiddleware)

# CORS: restrict to configured origins (no * in production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)


# ----- Generic exception handler: no stack traces or DB errors to client -----
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    from fastapi import HTTPException
    from fastapi.responses import JSONResponse

    if isinstance(exc, HTTPException):
        return JSONResponse(
            status_code=exc.status_code,
            content={"detail": exc.detail},
        )
    logger.exception("Unhandled exception: %s", exc)
    return JSONResponse(
        status_code=500,
        content={"detail": "An unexpected error occurred. Please try again later."},
    )


app.include_router(api_router)


@app.on_event("startup")
def startup():
    logger.info("Application starting: %s", settings.PROJECT_NAME)


@app.on_event("shutdown")
def shutdown():
    logger.info("Application shutting down")


@app.get("/")
def root():
    return {"message": "Job Management System is live"}