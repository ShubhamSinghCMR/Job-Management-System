from fastapi import APIRouter

from app.auth.router import router as auth_router
from app.users.router import router as users_router
from app.jobs.router import router as jobs_router
from app.seed.router import router as seed_router
from app.applications.router import router as applications_router
from app.admin.router import router as admin_router

api_router = APIRouter()

api_router.include_router(auth_router)
api_router.include_router(users_router)
api_router.include_router(jobs_router)
api_router.include_router(seed_router)
api_router.include_router(applications_router)
api_router.include_router(admin_router)