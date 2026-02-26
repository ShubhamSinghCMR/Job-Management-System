from time import time

from fastapi import HTTPException, Request, status


# Simple in-memory rate limiter (per process, per IP, per scope).
# Good enough for this assignment; in production you would use Redis
# or another shared store so limits apply across instances.
_attempts: dict[str, list[float]] = {}


def rate_limit(scope: str, limit: int, window_seconds: int):
    """
    Factory that returns a FastAPI dependency enforcing:
    at most `limit` requests per `window_seconds` for a given scope + client IP.
    """

    async def dependency(request: Request) -> None:
        client_ip = request.client.host if request.client else "unknown"
        key = f"{scope}:{client_ip}"
        now = time()
        window_start = now - window_seconds

        timestamps = _attempts.get(key, [])
        # keep only attempts within the window
        timestamps = [t for t in timestamps if t >= window_start]

        if len(timestamps) >= limit:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many attempts, please try again later.",
            )

        timestamps.append(now)
        _attempts[key] = timestamps

    return dependency

