from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    PROJECT_NAME: str = "Job Management System"
    API_V1_STR: str = "/api/v1"

    SECRET_KEY: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30  # Short-lived; refresh out of scope for now

    DATABASE_URL: str = "sqlite:///./jobportal.db"

    # Comma-separated origins, e.g. http://localhost:5500,https://yourdomain.com
    CORS_ORIGINS: str = "http://localhost:5500,http://127.0.0.1:5500,http://[::1]:5500"

    LOG_LEVEL: str = "INFO"

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]

    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache()
def get_settings():
    return Settings()


settings = get_settings()