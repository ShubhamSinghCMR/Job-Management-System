from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings

engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()

# Import all models so that they are registered with SQLAlchemy's metadata
from app import models  # noqa: F401


# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()