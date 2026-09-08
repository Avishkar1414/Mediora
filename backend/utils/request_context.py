"""Per-request context: request id, timing, and structured logging helpers."""

from __future__ import annotations

import logging
import os
import time
import uuid
from contextlib import contextmanager
from dataclasses import dataclass, field
from typing import Iterator

LOGGER = logging.getLogger("mediora.api")


@dataclass
class RequestContext:
    """Carries per-request state (id, timing) and emits a structured access log."""

    request_id: str
    scan_type: str | None = None
    started_at: float = field(default_factory=time.perf_counter)
    extras: dict[str, object] = field(default_factory=dict)

    def elapsed_ms(self) -> float:
        return round((time.perf_counter() - self.started_at) * 1000, 1)

    def log(self, message: str, **fields: object) -> None:
        """Emit a single structured log line including the request id and timing."""
        payload = {
            "request_id": self.request_id,
            "elapsed_ms": self.elapsed_ms(),
            "scan_type": self.scan_type,
            **self.extras,
            **fields,
        }
        LOGGER.info("%s %s", message, payload)


def new_request_id() -> str:
    """Return a short, unique request id suitable for client correlation."""
    return uuid.uuid4().hex[:12]


@contextmanager
def request_scope(scan_type: str | None = None) -> Iterator[RequestContext]:
    """Yield a RequestContext and log a single summary line on exit."""
    ctx = RequestContext(request_id=new_request_id(), scan_type=scan_type)
    ctx.log("request.start")
    try:
        yield ctx
    except Exception as error:  # noqa: BLE001 - intentional broad catch for logging
        ctx.log("request.error", error_type=type(error).__name__, error=str(error))
        raise
    else:
        ctx.log("request.ok")


def configure_logging() -> None:
    """Configure root logging once with timestamped lines that survive uvicorn."""
    level_name = os.getenv("LOG_LEVEL", "INFO").upper()
    level = getattr(logging, level_name, logging.INFO)

    root = logging.getLogger()
    if root.handlers:
        # uvicorn already installed handlers; just make sure the level is honoured.
        root.setLevel(level)
        return

    logging.basicConfig(
        level=level,
        format="%(asctime)s %(levelname)s %(name)s :: %(message)s",
        datefmt="%Y-%m-%dT%H:%M:%S%z",
    )
