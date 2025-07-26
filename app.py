import os
import logging
from flask import Flask, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from sqlalchemy.orm import DeclarativeBase
from werkzeug.middleware.proxy_fix import ProxyFix

# Configure logging
logging.basicConfig(level=logging.DEBUG)

class Base(DeclarativeBase):
    pass

db = SQLAlchemy(model_class=Base)

def create_app():
    app = Flask(__name__)
    
    # Configure CORS to allow requests from your frontend
    # This is crucial for the frontend to be able to communicate with the backend
    CORS(app, resources={r"/api/*": {"origins": ["http://localhost:3000", "https://*.vercel.app"]}})
    
    # Configure app
    app.secret_key = os.environ.get("SESSION_SECRET", "dev-secret-key-change-in-production")
    app.wsgi_app = ProxyFix(app.wsgi_app, x_proto=1, x_host=1)
    
    # Database configuration
    database_url = os.environ.get("DATABASE_URL", "sqlite:///sqlsense.db")
    app.config["SQLALCHEMY_DATABASE_URI"] = database_url
    app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {
        "pool_recycle": 300,
        "pool_pre_ping": True,
    }
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    
    # Initialize extensions
    db.init_app(app)
    
    # Register blueprints
    from routes import api_bp
    app.register_blueprint(api_bp)
    
    # Root endpoint for API documentation
    @app.route('/')
    def root():
        return jsonify({
            'message': 'SQLSense Backend API',
            'version': '1.0.0',
            'description': 'Natural Language to SQL Generator API',
            'endpoints': {
                'health': '/api/health',
                'generate_sql': '/api/generate-sql',
                'generate_schema': '/api/generate-schema',
                'history': '/api/history',
                'schema_versions': '/api/schema-versions',
                'save': '/api/save',
                'chat': '/api/chat',
                'chat_history': '/api/chat/history'
            },
            'documentation': 'See README.md for detailed API documentation'
        })
    
    # Create tables
    with app.app_context():
        import models
        db.create_all()
    
    return app

# Create the app instance
app = create_app()
