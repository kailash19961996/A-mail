import os
import json
import requests
from typing import Dict, Any, Optional, List

# Import OpenAI with error handling
try:
    from openai import OpenAI
    OPENAI_AVAILABLE = True
    print("✅ OpenAI module imported successfully")
except ImportError as e:
    print(f"❌ OpenAI module import failed: {e}")
    OPENAI_AVAILABLE = False


# Store conversation history per session
_sessions: Dict[str, List[Dict[str, str]]] = {}


def _get_openai_client():
    """Initialize OpenAI client with API key from environment"""
    if not OPENAI_AVAILABLE:
        raise RuntimeError("OpenAI module is not available")
    
    api_key = os.environ.get("OPENAI_API_KEY", "")
    if not api_key:
        raise RuntimeError("OPENAI_API_KEY is not set")
    
    print(f"🔑 API key found (length: {len(api_key)})")
    
    # Clear any proxy-related environment variables that might interfere
    proxy_vars = ['HTTP_PROXY', 'HTTPS_PROXY', 'http_proxy', 'https_proxy', 'ALL_PROXY', 'all_proxy']
    for var in proxy_vars:
        if var in os.environ:
            print(f"🧹 Removing proxy environment variable: {var}")
            del os.environ[var]
    
    try:
        # Try the simplest possible initialization
        print("🔧 Attempting basic OpenAI client initialization...")
        client = OpenAI(api_key=api_key)
        print(f"✅ OpenAI client initialized successfully")
        return client
    except TypeError as e:
        error_msg = str(e)
        print(f"❌ Basic initialization failed: {error_msg}")
        
        # If it's the proxies error, try creating the client without any extra parameters
        if 'proxies' in error_msg:
            try:
                print("🔧 Attempting manual client creation without proxies...")
                # Create client with absolutely minimal parameters
                import openai
                client = openai.OpenAI()
                client.api_key = api_key
                print(f"✅ OpenAI client initialized with manual method")
                return client
            except Exception as manual_error:
                print(f"❌ Manual initialization failed: {str(manual_error)}")
        
        raise RuntimeError(f"Failed to initialize OpenAI client: {error_msg}")
    except Exception as e:
        print(f"❌ Unexpected error initializing OpenAI client: {str(e)}")
        raise RuntimeError(f"Failed to initialize OpenAI client: {str(e)}")


def _call_openai_direct_api(messages: List[Dict[str, str]], api_key: str) -> Dict[str, Any]:
    """Direct HTTP call to OpenAI API as fallback"""
    print("🌐 Using direct HTTP API call to OpenAI")
    
    url = "https://api.openai.com/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "model": "gpt-4o-mini",
        "messages": messages,
        "temperature": 0.7,
        "max_tokens": 500
    }
    
    try:
        response = requests.post(url, headers=headers, json=payload, timeout=30)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"❌ Direct API call failed: {str(e)}")
        raise RuntimeError(f"OpenAI API call failed: {str(e)}")


def _get_or_create_session(session_id: str) -> List[Dict[str, str]]:
    """Get existing conversation history or create new session"""
    if session_id not in _sessions:
        _sessions[session_id] = []
    return _sessions[session_id]


def chat(session_id: str, input_text: str, system_context: Optional[str] = None) -> Dict[str, Any]:
    """Send a message to the conversation and return assistant reply.

    session_id: opaque id from frontend; new id creates fresh memory
    input_text: user message or instruction (e.g., a prompt like 'Draft a response...')
    system_context: optional initial context to prepend to memory for first turn
    """
    try:
        print(f"🤖 Starting AI chat - Session: {session_id}, Input length: {len(input_text)}")
        
        # Get API key
        api_key = os.environ.get("OPENAI_API_KEY", "")
        if not api_key:
            raise RuntimeError("OPENAI_API_KEY is not set")
        
        # Try to get OpenAI client, fall back to direct API if needed
        client = None
        use_direct_api = False
        
        try:
            client = _get_openai_client()
            print(f"🔗 OpenAI client obtained successfully")
        except Exception as client_error:
            print(f"⚠️ Client initialization failed, will use direct API: {str(client_error)}")
            use_direct_api = True
        
        # Get conversation history
        messages = _get_or_create_session(session_id)
        
        # Add system context only for first message in session
        if system_context and len(messages) == 0:
            messages.append({
                "role": "system", 
                "content": f"Context: {system_context}\n\nYou are an AI assistant helping with customer service responses. Use the provided context to give helpful, professional responses."
            })
        
        # Add user message
        messages.append({"role": "user", "content": input_text})
        
        # Call OpenAI API
        print(f"📤 Calling OpenAI API with {len(messages)} messages")
        
        if use_direct_api:
            # Use direct HTTP API call
            response_data = _call_openai_direct_api(messages, api_key)
            reply = response_data['choices'][0]['message']['content'].strip()
            usage = response_data.get('usage', {})
        else:
            # Use OpenAI client
            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=messages,
                temperature=0.7,
                max_tokens=500
            )
            reply = response.choices[0].message.content.strip()
            usage = getattr(response, 'usage', None)
        
        print(f"📥 OpenAI API response received successfully")
        
        # Usage and cost estimation (best-effort)
        usage_dict = None
        cost_usd = 0.0
        if usage:
            try:
                prompt_tokens = getattr(usage, 'prompt_tokens', 0) or (usage.get('prompt_tokens', 0) if isinstance(usage, dict) else 0)
                completion_tokens = getattr(usage, 'completion_tokens', 0) or (usage.get('completion_tokens', 0) if isinstance(usage, dict) else 0)
                total_tokens = getattr(usage, 'total_tokens', 0) or (usage.get('total_tokens', 0) if isinstance(usage, dict) else prompt_tokens + completion_tokens)
                usage_dict = {
                    "prompt_tokens": int(prompt_tokens),
                    "completion_tokens": int(completion_tokens),
                    "total_tokens": int(total_tokens)
                }
                # Approximate pricing for gpt-4o-mini (USD per 1K tokens)
                input_cost_per_1k = 0.00015
                output_cost_per_1k = 0.0006
                cost_usd = (prompt_tokens * input_cost_per_1k + completion_tokens * output_cost_per_1k) / 1000.0
            except Exception:
                usage_dict = None
                cost_usd = 0.0
        
        # Add assistant response to history
        messages.append({"role": "assistant", "content": reply})
        
        # Keep conversation history manageable (last 20 messages)
        if len(messages) > 20:
            # Keep system message if it exists, then last 19 messages
            system_msg = messages[0] if messages[0]["role"] == "system" else None
            recent_messages = messages[-19:]
            messages.clear()
            if system_msg:
                messages.append(system_msg)
            messages.extend(recent_messages)
        
        result: Dict[str, Any] = {"reply": reply}
        if usage_dict is not None:
            result["usage"] = usage_dict
            result["cost_usd"] = round(float(cost_usd), 6)
        return result
        
    except Exception as e:
        raise RuntimeError(f"OpenAI API error: {str(e)}")


def reset_session(session_id: str) -> None:
    """Clear conversation history for a session"""
    if session_id in _sessions:
        del _sessions[session_id]


