import os
from openai import OpenAI
from typing import Dict, Any, Optional, List


# Store conversation history per session
_sessions: Dict[str, List[Dict[str, str]]] = {}


def _get_openai_client():
    """Initialize OpenAI client with API key from environment"""
    api_key = os.environ.get("OPENAI_API_KEY", "")
    if not api_key:
        raise RuntimeError("OPENAI_API_KEY is not set")
    return OpenAI(api_key=api_key)


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
        client = _get_openai_client()
        
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
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages,
            temperature=0.7,
            max_tokens=500
        )
        
        # Extract reply
        reply = response.choices[0].message.content.strip()
        
        # Usage and cost estimation (best-effort)
        usage = getattr(response, 'usage', None)
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


