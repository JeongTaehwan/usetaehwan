# ask-server — FastAPI + LangGraph. 인제스트는 컨테이너 밖에서 돌고, 이 이미지는 서빙만 한다.
FROM python:3.12-slim

COPY --from=ghcr.io/astral-sh/uv:0.12.22 /uv /bin/uv
ENV UV_COMPILE_BYTECODE=1 UV_LINK_MODE=copy UV_PYTHON_DOWNLOADS=never PYTHONUNBUFFERED=1

WORKDIR /app
# 의존성 레이어를 먼저 — 코드만 바뀌면 이 레이어는 캐시를 탄다
COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-dev --no-install-project

COPY ask ./ask
COPY migrations ./migrations

RUN useradd --create-home app
USER app
ENV PATH="/app/.venv/bin:$PATH"

EXPOSE 8000
# Railway가 PORT를 준다
CMD ["sh", "-c", "uvicorn ask.api:app_factory --factory --host 0.0.0.0 --port ${PORT:-8000} --proxy-headers"]
