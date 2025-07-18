import json
import logging
from flask import Blueprint, request, jsonify
from Backend.app import db
from models import QueryHistory, SchemaVersion, ChatMessage
from services.sql_generator import SQLGenerator
from services.schema_generator import SchemaGenerator

api_bp = Blueprint('api', __name__, url_prefix='/api')
sql_generator = SQLGenerator()
schema_generator = SchemaGenerator()

@api_bp.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'SQLSense Backend API',
        'version': '1.0.0'
    })

@api_bp.route('/generate-sql', methods=['POST'])
def generate_sql():
    """Generate SQL query from natural language"""
    try:
        data = request.get_json()
        
        if not data or 'prompt' not in data:
            return jsonify({'error': 'Prompt is required'}), 400
        
        prompt = data['prompt']
        context = data.get('context', '')
        database_type = data.get('database_type', 'postgresql')
        
        # Generate SQL using the service
        result = sql_generator.generate_sql(prompt, context, database_type)
        
        if 'error' in result:
            return jsonify(result), 500
        
        # Save to history
        history_entry = QueryHistory(
            natural_query=prompt,
            generated_sql=result['sql_query'],
            database_type=database_type,
            explanation=result.get('explanation', ''),
            model_used=result.get('model_used', ''),
            context=context
        )
        db.session.add(history_entry)
        db.session.commit()
        
        return jsonify(result)
        
    except Exception as e:
        logging.error(f"Error generating SQL: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@api_bp.route('/generate-schema', methods=['POST'])
def generate_schema():
    """Generate database schema from natural language description"""
    try:
        data = request.get_json()
        
        if not data or 'description' not in data:
            return jsonify({'error': 'Description is required'}), 400
        
        description = data['description']
        database_type = data.get('database_type', 'postgresql')
        schema_name = data.get('name', 'Generated Schema')
        
        # Generate schema using the service
        result = schema_generator.generate_schema(description, database_type)
        
        if 'error' in result:
            return jsonify(result), 500
        
        # Save to schema versions
        schema_version = SchemaVersion(
            name=schema_name,
            description=description,
            schema_ddl=result['schema'],
            database_type=database_type,
            explanation=result.get('explanation', ''),
            tables_info=json.dumps(result.get('tables', []))
        )
        db.session.add(schema_version)
        db.session.commit()
        
        return jsonify(result)
        
    except Exception as e:
        logging.error(f"Error generating schema: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@api_bp.route('/history')
def get_history():
    """Get query history"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        
        history = QueryHistory.query.order_by(QueryHistory.created_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        return jsonify({
            'queries': [item.to_dict() for item in history.items],
            'total': history.total,
            'pages': history.pages,
            'current_page': page
        })
        
    except Exception as e:
        logging.error(f"Error getting history: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@api_bp.route('/schema-versions')
def get_schema_versions():
    """Get schema versions"""
    try:
        schemas = SchemaVersion.query.order_by(SchemaVersion.created_at.desc()).all()
        return jsonify([schema.to_dict() for schema in schemas])
        
    except Exception as e:
        logging.error(f"Error getting schema versions: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@api_bp.route('/save', methods=['POST'])
def save_item():
    """Save a query or schema with metadata"""
    try:
        data = request.get_json()
        
        if not data or 'type' not in data:
            return jsonify({'error': 'Type is required'}), 400
        
        item_type = data['type']
        
        if item_type == 'query':
            query_id = data.get('query_id')
            if query_id:
                query = QueryHistory.query.get(query_id)
                if query:
                    query.is_favorite = data.get('is_favorite', False)
                    db.session.commit()
                    return jsonify({'success': True})
            return jsonify({'error': 'Query not found'}), 404
        
        elif item_type == 'schema':
            schema_id = data.get('schema_id')
            if schema_id:
                schema = SchemaVersion.query.get(schema_id)
                if schema:
                    schema.is_active = data.get('is_active', True)
                    db.session.commit()
                    return jsonify({'success': True})
            return jsonify({'error': 'Schema not found'}), 404
        
        return jsonify({'error': 'Invalid type'}), 400
        
    except Exception as e:
        logging.error(f"Error saving item: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@api_bp.route('/chat', methods=['POST'])
def chat():
    """Handle AI assistant chat"""
    try:
        data = request.get_json()
        
        if not data or 'message' not in data:
            return jsonify({'error': 'Message is required'}), 400
        
        message = data['message']
        message_type = data.get('type', 'general')
        
        # Generate response using SQL generator for now
        response = sql_generator.generate_chat_response(message, message_type)
        
        # Save chat message
        chat_message = ChatMessage(
            message=message,
            response=response,
            message_type=message_type
        )
        db.session.add(chat_message)
        db.session.commit()
        
        return jsonify({'response': response})
        
    except Exception as e:
        logging.error(f"Error handling chat: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@api_bp.route('/chat/history')
def get_chat_history():
    """Get chat history"""
    try:
        messages = ChatMessage.query.order_by(ChatMessage.created_at.desc()).limit(20).all()
        return jsonify([msg.to_dict() for msg in messages])
        
    except Exception as e:
        logging.error(f"Error getting chat history: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500
