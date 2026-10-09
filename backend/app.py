"""
InsightLoop FastAPI Application
LLM-Powered Customer Feedback Aggregation and Sentiment Intelligence Platform for MSMEs.
"""
import os
import logging
from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse

from backend.database import ensure_demo_data
from backend.routes.auth import router as auth_router
from backend.routes.analytics import router as analytics_router
from backend.routes.feedback import router as feedback_router
from backend.routes.issues import router as issues_router
from backend.routes.recommendations import router as recommendations_router
from backend.routes.alerts import router as alerts_router
from backend.routes.sources import router as sources_router
from backend.routes.import_routes import router as import_router
from backend.routes.reports import router as reports_router
from backend.routes.settings import router as settings_router
from backend.routes.ask import router as ask_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("InsightLoopApp")

app = FastAPI(
    title="InsightLoop API",
    description="Customer Feedback Aggregation and Sentiment Intelligence Platform for MSMEs",
    version="2.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize and seed database on launch
@app.on_event("startup")
def on_startup():
    try:
        ensure_demo_data()
        logger.info("InsightLoop database initialized and validated successfully.")
    except Exception as e:
        logger.error(f"Error during startup database initialization: {e}")

# Register all core API routers
app.include_router(auth_router)
app.include_router(analytics_router)
app.include_router(feedback_router)
app.include_router(issues_router)
app.include_router(recommendations_router)
app.include_router(alerts_router)
app.include_router(sources_router)
app.include_router(import_router)
app.include_router(reports_router)
app.include_router(settings_router)
app.include_router(ask_router)


@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "app": "InsightLoop",
        "version": "2.0.0",
        "database": "sqlite",
        "demo_mode": True
    }


# Static and Single-Page Application (SPA) file serving
FRONTEND_DIST = Path(__file__).resolve().parent.parent / "frontend" / "dist"
STATIC_FALLBACK = Path(__file__).resolve().parent.parent / "static"

if FRONTEND_DIST.exists():
    app.mount("/assets", StaticFiles(directory=str(FRONTEND_DIST / "assets")), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        file_path = FRONTEND_DIST / full_path
        if file_path.is_file():
            return FileResponse(file_path)
        return FileResponse(FRONTEND_DIST / "index.html")
elif STATIC_FALLBACK.exists():
    app.mount("/static", StaticFiles(directory=str(STATIC_FALLBACK)), name="static")

    @app.get("/")
    def serve_index():
        return FileResponse(STATIC_FALLBACK / "index.html")


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    host = os.environ.get("HOST", "0.0.0.0")
    uvicorn.run("backend.app:app", host=host, port=port)
