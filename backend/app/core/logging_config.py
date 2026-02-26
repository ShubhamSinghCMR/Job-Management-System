"""
Central logging configuration for the application.
Logs to stdout with a consistent format; no sensitive data (passwords, tokens) in messages.
"""
import logging
import sys

from app.core.config import settings


def get_logger(name: str) -> logging.Logger:
    """Return a logger for the given module name (e.g. __name__)."""
    return logging.getLogger(name)


def setup_logging() -> None:
    """Configure root logger and app loggers. Call once at startup."""
    level = getattr(
        settings,
        "LOG_LEVEL",
        "INFO",
    )
    if isinstance(level, str):
        level = getattr(logging, level.upper(), logging.INFO)

    format_str = "%(asctime)s | %(levelname)-8s | %(name)s | %(message)s"
    date_fmt = "%Y-%m-%d %H:%M:%S"

    handler = logging.StreamHandler(sys.stdout)
    handler.setLevel(level)
    handler.setFormatter(logging.Formatter(format_str, datefmt=date_fmt))

    root = logging.getLogger()
    root.setLevel(level)
    if not root.handlers:
        root.addHandler(handler)

    # Reduce noise from third-party libs
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)
