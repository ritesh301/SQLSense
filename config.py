import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Config:
    """Configuration class for SQLSense application"""
    
    # Database configuration
    SQLALCHEMY_DATABASE_URI = os.environ.get("DATABASE_URL", "sqlite:///sqlsense.db")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {
        "pool_recycle": 300,
        "pool_pre_ping": True,
    }
    
    # Security
    SECRET_KEY = os.environ.get("SESSION_SECRET", "dev-secret-key-change-in-production")
    
    # OpenRouter API configuration
    OPENROUTER_API_KEY = os.environ.get("OPENROUTER_API_KEY", "")
    
    # Application settings
    DEBUG = os.environ.get("FLASK_ENV") == "development"
    
    # Pagination settings
    QUERIES_PER_PAGE = 10
    SCHEMAS_PER_PAGE = 10
    
    # Model settings
    DEFAULT_MODEL = "moonshotai/kimi-k2:free"
    API_TIMEOUT = 30
    
    # Supported database types
    SUPPORTED_DATABASES = ["postgresql", "mysql", "sqlite"]
