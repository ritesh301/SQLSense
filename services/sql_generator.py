import os
import httpx
import asyncio
import logging
from typing import Dict, Any

class SQLGenerator:
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
        """Create system prompt for SQL generation"""
        return f"""You are a SQL expert. Generate a syntactically correct {database_type.upper()} SQL query based on the user prompt.

Rules:
1. Return only valid SQL syntax
2. Use proper {database_type.upper()} conventions
3. Include comments for complex queries
4. Optimize for readability and performance
5. Handle edge cases and potential errors
6. Use appropriate data types for {database_type.upper()}

Format your response as JSON with these fields:
- sql_query: The generated SQL query
- explanation: Brief explanation of what the query does
- tables_involved: List of tables referenced in the query
"""
    
    def _create_user_prompt(self, prompt: str, context: str = "") -> str:
        """Create user prompt for SQL generation"""
        base_prompt = f"Generate a SQL query for: {prompt}"
        if context:
            base_prompt += f"\n\nContext: {context}"
        return base_prompt
    
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
                        "max_tokens": 1000,
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
                    import json
                    parsed_response = json.loads(content)
                    return parsed_response
                except json.JSONDecodeError:
                    # If not JSON, treat as plain SQL
                    return {
                        "sql_query": content.strip(),
                        "explanation": "SQL query generated from natural language",
                        "tables_involved": []
                    }
                
        except Exception as e:
            logging.error(f"Error making API call: {str(e)}")
            return {"error": f"Failed to generate SQL: {str(e)}"}
    
    def generate_sql(self, prompt: str, context: str = "", database_type: str = "postgresql") -> Dict[str, Any]:
        """Generate SQL query from natural language"""
        try:
            messages = [
                {"role": "system", "content": self._create_system_prompt(database_type)},
                {"role": "user", "content": self._create_user_prompt(prompt, context)}
            ]
            
            # Run async function in sync context
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            result = loop.run_until_complete(self._make_api_call(messages))
            loop.close()
            
            if "error" in result:
                return result
            
            # Add metadata
            result["model_used"] = self.model
            result["database_type"] = database_type
            
            return result
            
        except Exception as e:
            logging.error(f"Error in generate_sql: {str(e)}")
            return {"error": f"Failed to generate SQL: {str(e)}"}
    
    def generate_chat_response(self, message: str, message_type: str = "general") -> str:
        """Generate response for AI assistant chat"""
        try:
            system_prompt = """You are an AI assistant for SQLSense, a tool that helps users generate SQL queries and database schemas from natural language.

You can help with:
- Explaining SQL concepts
- Suggesting query improvements
- Database design advice
- Schema modifications
- General SQL and database questions

Keep responses concise and helpful."""
            
            messages = [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": message}
            ]
            
            # Run async function in sync context
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            
            async def get_response():
                try:
                    async with httpx.AsyncClient(timeout=30.0) as client:
                        response = await client.post(
                            self.base_url,
                            headers=self._get_headers(),
                            json={
                                "model": self.model,
                                "messages": messages,
                                "temperature": 0.7,
                                "max_tokens": 500
                            }
                        )
                        
                        if response.status_code == 200:
                            data = response.json()
                            if "choices" in data and data["choices"]:
                                return data["choices"][0]["message"]["content"]
                        
                        return "I'm sorry, I'm having trouble responding right now. Please try again."
                        
                except Exception as e:
                    logging.error(f"Error in chat response: {str(e)}")
                    return "I'm sorry, I encountered an error. Please try again."
            
            result = loop.run_until_complete(get_response())
            loop.close()
            
            return result
            
        except Exception as e:
            logging.error(f"Error in generate_chat_response: {str(e)}")
            return "I'm sorry, I encountered an error. Please try again."
