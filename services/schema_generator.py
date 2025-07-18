import os
import httpx
import asyncio
import json
import logging
from typing import Dict, Any, List

class SchemaGenerator:
    def __init__(self):
        self.api_key = os.environ.get("OPENROUTER_API_KEY", "")
        self.base_url = "https://openrouter.ai/api/v1/chat/completions"
        self.model = "moonshotai/kimi-k2:free"
        
    def _get_headers(self) -> Dict[str, str]:
        """Get headers for OpenRouter API"""
        return {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://sqlsense.ai",
            "X-Title": "SQLSense"
        }
    
    def _create_system_prompt(self, database_type: str) -> str:
        """Create system prompt for schema generation"""
        return f"""You are a database design expert. Generate a complete database schema in {database_type.upper()} DDL format based on the user's description.

Rules:
1. Create appropriate tables with proper relationships
2. Include primary keys, foreign keys, and indexes
3. Use appropriate data types for {database_type.upper()}
4. Add constraints and validations
5. Include comments for clarity
6. Consider normalization and best practices
7. Handle common database patterns

Format your response as JSON with these fields:
- schema: The complete DDL statements
- explanation: Brief explanation of the schema design
- tables: Array of objects with table info (name, columns, relationships)
- recommendations: Any additional recommendations for optimization
"""
    
    def _create_user_prompt(self, description: str) -> str:
        """Create user prompt for schema generation"""
        return f"Generate a database schema for: {description}"
    
    async def _make_api_call(self, messages: list) -> Dict[str, Any]:
        """Make async API call to OpenRouter"""
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    self.base_url,
                    headers=self._get_headers(),
                    json={
                        "model": self.model,
                        "messages": messages,
                        "temperature": 0.1,
                        "max_tokens": 2000,
                        "top_p": 0.9
                    }
                )
                
                if response.status_code != 200:
                    logging.error(f"API call failed: {response.status_code} - {response.text}")
                    return {"error": f"API call failed with status {response.status_code}"}
                
                data = response.json()
                
                if "choices" not in data or not data["choices"]:
                    return {"error": "No response from AI model"}
                
                content = data["choices"][0]["message"]["content"]
                
                # Try to parse JSON response
                try:
                    parsed_response = json.loads(content)
                    return parsed_response
                except json.JSONDecodeError:
                    # If not JSON, treat as plain DDL
                    return {
                        "schema": content.strip(),
                        "explanation": "Database schema generated from description",
                        "tables": self._extract_tables_from_ddl(content),
                        "recommendations": []
                    }
                
        except Exception as e:
            logging.error(f"Error making API call: {str(e)}")
            return {"error": f"Failed to generate schema: {str(e)}"}
    
    def _extract_tables_from_ddl(self, ddl: str) -> List[Dict[str, Any]]:
        """Extract table information from DDL"""
        tables = []
        lines = ddl.split('\n')
        current_table = None
        current_columns = []
        
        for line in lines:
            line = line.strip()
            if line.upper().startswith('CREATE TABLE'):
                if current_table:
                    tables.append({
                        "name": current_table,
                        "columns": current_columns
                    })
                    current_columns = []
                
                # Extract table name
                parts = line.split()
                if len(parts) >= 3:
                    current_table = parts[2].replace('(', '').replace('`', '').replace('"', '')
            
            elif current_table and line and not line.startswith('--') and not line.startswith('/*'):
                # Extract column information
                if '(' in line and ')' in line and not line.upper().startswith('CREATE'):
                    col_info = line.split()[0].replace(',', '').replace('`', '').replace('"', '')
                    if col_info and col_info.upper() not in ['PRIMARY', 'FOREIGN', 'KEY', 'CONSTRAINT']:
                        current_columns.append(col_info)
        
        if current_table:
            tables.append({
                "name": current_table,
                "columns": current_columns
            })
        
        return tables
    
    def generate_schema(self, description: str, database_type: str = "postgresql") -> Dict[str, Any]:
        """Generate database schema from natural language description"""
        try:
            messages = [
                {"role": "system", "content": self._create_system_prompt(database_type)},
                {"role": "user", "content": self._create_user_prompt(description)}
            ]
            
            # Run async function in sync context
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            result = loop.run_until_complete(self._make_api_call(messages))
            loop.close()
            
            if "error" in result:
                return result
            
            # Add metadata
            result["database_type"] = database_type
            result["model_used"] = self.model
            
            return result
            
        except Exception as e:
            logging.error(f"Error in generate_schema: {str(e)}")
            return {"error": f"Failed to generate schema: {str(e)}"}
