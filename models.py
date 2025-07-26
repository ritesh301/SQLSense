from datetime import datetime
from app import db
from sqlalchemy import Text, DateTime, String, Integer, Boolean, ForeignKey
from sqlalchemy.orm import relationship

class QueryHistory(db.Model):
    __tablename__ = 'query_history'
    
    id = db.Column(Integer, primary_key=True)
    natural_query = db.Column(Text, nullable=False)
    generated_sql = db.Column(Text, nullable=False)
    database_type = db.Column(String(20), nullable=False)
    explanation = db.Column(Text)
    model_used = db.Column(String(100))
    context = db.Column(Text)
    created_at = db.Column(DateTime, default=datetime.utcnow)
    is_favorite = db.Column(Boolean, default=False)

    # Relationship to AnalyticsEvent
    events = relationship('AnalyticsEvent', back_populates='query_history', cascade="all, delete-orphan")
    
    def to_dict(self):
        return {
            'id': self.id,
            'natural_query': self.natural_query,
            'generated_sql': self.generated_sql,
            'database_type': self.database_type,
            'explanation': self.explanation,
            'model_used': self.model_used,
            'context': self.context,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'is_favorite': self.is_favorite
        }

class SchemaVersion(db.Model):
    __tablename__ = 'schema_versions'
    
    id = db.Column(Integer, primary_key=True)
    name = db.Column(String(200), nullable=False)
    description = db.Column(Text, nullable=False)
    schema_ddl = db.Column(Text, nullable=False)
    database_type = db.Column(String(20), nullable=False)
    explanation = db.Column(Text)
    tables_info = db.Column(Text)  # JSON string of table information
    version = db.Column(Integer, default=1)
    created_at = db.Column(DateTime, default=datetime.utcnow)
    is_active = db.Column(Boolean, default=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'schema_ddl': self.schema_ddl,
            'database_type': self.database_type,
            'explanation': self.explanation,
            'tables_info': self.tables_info,
            'version': self.version,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'is_active': self.is_active
        }

class ChatMessage(db.Model):
    __tablename__ = 'chat_messages'
    
    id = db.Column(Integer, primary_key=True)
    message = db.Column(Text, nullable=False)
    response = db.Column(Text, nullable=False)
    message_type = db.Column(String(50), default='general')  # 'general', 'schema', 'query'
    created_at = db.Column(DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'message': self.message,
            'response': self.response,
            'message_type': self.message_type,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

# --- NEW MODEL FOR ANALYTICS ---
class AnalyticsEvent(db.Model):
    __tablename__ = 'analytics_events'

    id = db.Column(Integer, primary_key=True)
    event_type = db.Column(String(100), nullable=False)  # e.g., 'generate_sql', 'generate_schema'
    created_at = db.Column(DateTime, default=datetime.utcnow)
    
    # Foreign Key to link to a specific query
    query_history_id = db.Column(Integer, ForeignKey('query_history.id'), nullable=True)
    
    # Relationship to QueryHistory
    query_history = relationship('QueryHistory', back_populates='events')

    def to_dict(self):
        return {
            'id': self.id,
            'event_type': self.event_type,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'query_history_id': self.query_history_id
        }


# --- NEW MODEL FOR VERSION CONTROL ---
# Add this class to your models.py file

class QueryVersion(db.Model):
    __tablename__ = 'query_versions'

    id = db.Column(Integer, primary_key=True)
    version_message = db.Column(String(255), nullable=True)
    generated_sql = db.Column(Text, nullable=False)
    created_at = db.Column(DateTime, default=datetime.utcnow)
    
    # Foreign Key to link to a specific query in the history
    query_history_id = db.Column(Integer, ForeignKey('query_history.id'), nullable=False)
    
    # Relationship to QueryHistory
    query_history = relationship('QueryHistory', backref='versions')

    def to_dict(self):
        return {
            'id': self.id,
            'version_message': self.version_message,
            'generated_sql': self.generated_sql,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'query_history_id': self.query_history_id
        }