"""
Vercel Serverless Function entry point for InsightLoop FastAPI backend.
"""
import sys
from pathlib import Path

# Add root repository directory to Python path
ROOT_DIR = Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from backend.app import app
