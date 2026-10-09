# Production Dockerfile for InsightLoop
FROM python:3.13-slim

WORKDIR /app

# Install system utilities
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install python requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend, data, and pre-built frontend distribution
COPY backend ./backend
COPY frontend/dist ./frontend/dist
COPY static ./static

# Configure environment
ENV PORT=8000
ENV HOST=0.0.0.0
ENV PYTHONUNBUFFERED=1

EXPOSE 8000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8000/api/health || exit 1

# Start Uvicorn production server
CMD ["python", "backend/app.py"]
