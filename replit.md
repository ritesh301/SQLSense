# SQLSense - Natural Language to SQL Generator

## Overview

SQLSense is a web application that converts natural language queries into SQL statements and generates database schemas from descriptions. The application uses AI to understand user intent and generate accurate SQL queries for PostgreSQL, MySQL, and SQLite databases.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

SQLSense follows a REST API architecture with clear separation of concerns:

- **Backend**: Flask web framework with SQLAlchemy ORM serving JSON API endpoints
- **Database**: PostgreSQL for production with SQLite fallback for development
- **AI Integration**: OpenRouter API for natural language processing using Kimi-K2 free model
- **API Structure**: RESTful endpoints with proper HTTP methods and status codes

## Key Components

### Web Framework
- **Flask**: Chosen for its simplicity and rapid development capabilities
- **Blueprint-based routing**: Modular route organization in `routes.py`
- **CORS enabled**: Supports cross-origin requests for API endpoints
- **ProxyFix middleware**: Handles reverse proxy headers for deployment

### Database Layer
- **SQLAlchemy ORM**: Provides database abstraction with support for multiple database types
- **Models**: 
  - `QueryHistory`: Stores generated SQL queries with metadata
  - `SchemaVersion`: Manages database schema versions
  - `ChatMessage`: Handles chat interactions (referenced but not fully implemented)
- **Migration support**: Automatic table creation on app startup

### AI Services
- **SQLGenerator**: Converts natural language to SQL queries
- **SchemaGenerator**: Creates database schemas from descriptions
- **OpenRouter Integration**: Uses free Llama 3.1 model for AI processing
- **Async HTTP client**: httpx for non-blocking API calls

### API Design
- **RESTful endpoints**: Clean URL structure with proper HTTP methods
- **JSON responses**: Consistent JSON format for all API responses
- **Error handling**: Comprehensive error responses with proper HTTP status codes
- **CORS support**: Cross-origin resource sharing for frontend integration

## Data Flow

1. **Query Generation**:
   - User enters natural language query
   - Frontend sends POST request to `/api/generate-sql`
   - Backend processes request through SQLGenerator service
   - AI model generates SQL query with explanation
   - Response stored in QueryHistory and returned to user

2. **Schema Generation**:
   - User provides schema description
   - Request sent to `/api/generate-schema`
   - SchemaGenerator service creates DDL statements
   - Schema stored in SchemaVersion table
   - Generated schema returned with metadata

3. **History Management**:
   - All queries and schemas automatically saved
   - Users can view, filter, and manage historical data
   - Versioning support for schema evolution

## External Dependencies

### Core Dependencies
- **Flask**: Web framework
- **SQLAlchemy**: Database ORM
- **httpx**: Async HTTP client for API calls
- **python-dotenv**: Environment variable management

### AI Integration
- **OpenRouter API**: Provides access to Llama 3.1 model
- **Free tier model**: `meta-llama/llama-3.1-8b-instruct:free`
- **API key authentication**: Configured via environment variables

### API Integration
- **OpenRouter API**: Provides access to free AI models
- **Free tier model**: `moonshotai/kimi-k2:free`
- **API key authentication**: Configured via environment variables

## Deployment Strategy

### Environment Configuration
- **Environment variables**: Database URL, API keys, session secrets
- **Development**: SQLite database for local development
- **Production**: PostgreSQL-compatible configuration
- **Flexible database support**: Can switch between SQLite, PostgreSQL, MySQL

### Deployment Platforms
- **Render/Railway/Fly.io compatible**: Standard Flask WSGI application
- **Docker ready**: Can be containerized for deployment
- **Static assets**: Served efficiently through CDN links
- **Proxy support**: ProxyFix middleware for reverse proxy deployments

### Performance Considerations
- **Connection pooling**: SQLAlchemy engine configuration
- **Async AI calls**: Non-blocking API requests
- **Database optimization**: Indexes and query optimization
- **Error handling**: Comprehensive error management and logging

### Security Features
- **CORS protection**: Configurable cross-origin policies
- **Session management**: Secure session handling
- **API key security**: Environment-based configuration
- **Input validation**: Request data validation and sanitization

The application is designed to be lightweight, scalable, and easy to deploy while maintaining clean code organization and modern web development practices.