"""
A-mail Backend Lambda Function

Main AWS Lambda handler for the A-mail ticket management system.
Provides RESTful API endpoints for ticket and message management.

Features:
- Ticket CRUD operations
- Message management
- AI chat integration
- Status updates and assignments
- Comprehensive logging and error handling

Author: A-mail Development Team
License: MIT
"""

import json
import os
import logging
from typing import Dict, Any, Optional
from datetime import datetime
import traceback

from utils import (
    get_all_tickets,
    get_ticket_by_id,
    get_ticket_messages,
    create_ticket,
    update_ticket_status,
    add_message_to_ticket
)

# Configure comprehensive logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

# Add custom print statements for enhanced debugging
def log_info(message: str, data: Any = None):
    """Enhanced logging with print statements for CloudWatch visibility"""
    timestamp = datetime.utcnow().isoformat()
    log_msg = f"[{timestamp}] INFO: {message}"
    if data:
        log_msg += f" | Data: {json.dumps(data, default=str)}"
    print(log_msg)
    logger.info(log_msg)

def log_error(message: str, error: Any = None):
    """Enhanced error logging with print statements"""
    timestamp = datetime.utcnow().isoformat()
    log_msg = f"[{timestamp}] ERROR: {message}"
    if error:
        log_msg += f" | Error: {str(error)}"
    print(log_msg)
    logger.error(log_msg)

def get_cors_headers() -> Dict[str, str]:
    """Return CORS headers for API responses"""
    return {
        'Access-Control-Allow-Origin': '*',  # In production, replace with your frontend domain
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
        'Content-Type': 'application/json'
    }

def create_response(status_code: int, body: Any = None, error: Optional[str] = None) -> Dict[str, Any]:
    """Create a standardized API response"""
    response_body = {}
    
    if error:
        response_body['error'] = error
        response_body['success'] = False
    else:
        response_body['data'] = body
        response_body['success'] = True
        response_body['timestamp'] = datetime.utcnow().isoformat() + 'Z'
    
    return {
        'statusCode': status_code,
        'headers': get_cors_headers(),
        'body': json.dumps(response_body)
    }

def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Main Lambda Handler Function
    
    Processes incoming HTTP requests and routes them to appropriate handlers.
    Provides comprehensive logging for debugging and monitoring.
    """
    
    try:
        # Log incoming request details
        method = event.get('httpMethod', '').upper()
        path = event.get('path', '')
        request_id = context.aws_request_id if context else 'local'
        
        # Safely extract headers and request context
        headers = event.get('headers') or {}
        request_context = event.get('requestContext') or {}
        identity = request_context.get('identity') or {}
        
        log_info("🚀 Lambda function invoked", {
            'requestId': request_id,
            'method': method,
            'path': path,
            'userAgent': headers.get('User-Agent', 'Unknown'),
            'sourceIP': identity.get('sourceIp', 'Unknown')
        })
        
        print(f"📋 Full event details: {json.dumps(event, default=str)}")
        
        # Handle OPTIONS request for CORS preflight
        if method == 'OPTIONS':
            log_info("✅ CORS preflight request handled")
            return create_response(200)
        
        # Extract request details
        path_parameters = event.get('pathParameters') or {}
        query_parameters = event.get('queryStringParameters') or {}
        
        log_info("📊 Request parameters extracted", {
            'pathParams': path_parameters,
            'queryParams': query_parameters
        })
        
        # Parse body if present
        body = {}
        if event.get('body'):
            try:
                body = json.loads(event['body'])
                log_info("📝 Request body parsed", {'bodySize': len(str(body))})
            except json.JSONDecodeError as e:
                log_error("❌ Invalid JSON in request body", e)
                return create_response(400, error="Invalid JSON in request body")
        
        # Health check endpoint
        if path == '/health' and method == 'GET':
            log_info("💚 Health check requested")
            return create_response(200, {
                'status': 'healthy',
                'service': 'a-mail-ticketing-system',
                'timestamp': datetime.utcnow().isoformat() + 'Z',
                'version': '1.0.0'
            })
        
        # Route requests - Order matters! More specific routes first
        log_info("🔀 Routing request", {'method': method, 'path': path})
        
        # AI chat endpoints
        if path == '/ai/chat' and method == 'POST':
            log_info("🤖 AI chat request received")
            return handle_ai_chat(body)
        if path == '/ai/reset' and method == 'POST':
            log_info("🔄 AI reset request received")
            return handle_ai_reset(body)

        if path == '/tickets':
            if method == 'GET':
                log_info("📋 Get all tickets request")
                return handle_get_tickets(query_parameters)
            elif method == 'POST':
                log_info("➕ Create ticket request")
                return handle_create_ticket(body)
        
        elif path.startswith('/tickets/') and path.endswith('/messages'):
            # Handle messages endpoint BEFORE single ticket endpoint
            path_parts = path.split('/')
            print(f"🔍 Path parts: {path_parts}")
            if len(path_parts) >= 3:
                ticket_id = path_parts[2]  # Extract ticket_id from /tickets/{ticket_id}/messages
                log_info("💬 Message endpoint accessed", {'ticketId': ticket_id, 'method': method, 'pathParts': path_parts})
                
                if method == 'GET':
                    log_info("📨 Get messages request", {'ticketId': ticket_id})
                    return handle_get_ticket_messages(ticket_id)
                elif method == 'POST':
                    log_info("✉️ Add message request", {'ticketId': ticket_id})
                    return handle_add_message(ticket_id, body)
            else:
                log_error("❌ Invalid message endpoint path", {'path': path, 'pathParts': path_parts})
                return create_response(400, error="Invalid message endpoint path")
        
        elif path.startswith('/tickets/') and len(path_parameters.get('ticket_id', '')) > 0:
            ticket_id = path_parameters['ticket_id']
            log_info("🎫 Single ticket endpoint accessed", {'ticketId': ticket_id, 'method': method})
            
            if method == 'GET':
                log_info("🔍 Get single ticket request", {'ticketId': ticket_id})
                return handle_get_ticket(ticket_id)
            elif method == 'PATCH':
                log_info("✏️ Update ticket request", {'ticketId': ticket_id})
                return handle_update_ticket(ticket_id, body)
        
        # Route not found
        log_error("❌ Route not found", {'method': method, 'path': path})
        return create_response(404, error=f"Route not found: {method} {path}")
        
    except Exception as e:
        log_error("💥 Unhandled exception in lambda_handler", {
            'error': str(e),
            'traceback': traceback.format_exc(),
            'path': event.get('path', 'unknown'),
            'method': event.get('httpMethod', 'unknown')
        })
        return create_response(500, error="Internal server error")

def handle_get_tickets(query_params: Dict[str, str]) -> Dict[str, Any]:
    """
    Handle GET /tickets - retrieve all tickets with optional filtering
    Supports filtering by status, assigned_to, and ticket_group
    """
    try:
        status = query_params.get('status')
        assigned_to = query_params.get('assigned_to')
        ticket_group = query_params.get('ticket_group')
        
        log_info("🔍 Fetching tickets with filters", {
            'status': status,
            'assigned_to': assigned_to,
            'ticket_group': ticket_group
        })
        
        tickets = get_all_tickets(
            status_filter=status,
            assigned_to_filter=assigned_to,
            ticket_group_filter=ticket_group
        )
        
        log_info("✅ Tickets retrieved successfully", {
            'count': len(tickets) if tickets else 0,
            'filters_applied': bool(status or assigned_to or ticket_group)
        })
        
        return create_response(200, tickets)
        
    except Exception as e:
        log_error("❌ Error getting tickets", {
            'error': str(e),
            'filters': query_params,
            'traceback': traceback.format_exc()
        })
        return create_response(500, error="Failed to retrieve tickets")

def handle_get_ticket(ticket_id: str) -> Dict[str, Any]:
    """
    Handle GET /tickets/{ticket_id} - retrieve single ticket
    Returns complete ticket details including messages
    """
    try:
        log_info("🎫 Fetching single ticket", {'ticketId': ticket_id})
        
        ticket = get_ticket_by_id(ticket_id)
        
        if not ticket:
            log_info("❌ Ticket not found", {'ticketId': ticket_id})
            return create_response(404, error=f"Ticket {ticket_id} not found")
        
        log_info("✅ Ticket retrieved successfully", {
            'ticketId': ticket_id,
            'status': ticket.get('status'),
            'messageCount': len(ticket.get('messages', []))
        })
        
        return create_response(200, ticket)
        
    except Exception as e:
        log_error("❌ Error getting single ticket", {
            'ticketId': ticket_id,
            'error': str(e),
            'traceback': traceback.format_exc()
        })
        return create_response(500, error="Failed to retrieve ticket")

def handle_get_ticket_messages(ticket_id: str) -> Dict[str, Any]:
    """
    Handle GET /tickets/{ticket_id}/messages - retrieve messages for a ticket
    Returns chronologically ordered messages for the specified ticket
    """
    try:
        log_info("📨 Fetching ticket messages", {'ticketId': ticket_id})
        
        # Validate ticket_id format
        if not ticket_id or not ticket_id.strip():
            log_error("❌ Invalid ticket ID provided", {'ticketId': ticket_id})
            return create_response(400, error="Invalid ticket ID")
        
        ticket_id = ticket_id.strip()
        log_info("🔍 Cleaned ticket ID", {'cleanedTicketId': ticket_id})
        
        messages = get_ticket_messages(ticket_id)
        
        log_info("✅ Messages retrieved successfully", {
            'ticketId': ticket_id,
            'messageCount': len(messages) if messages else 0
        })
        
        return create_response(200, messages)
        
    except Exception as e:
        log_error("❌ Error getting ticket messages", {
            'ticketId': ticket_id,
            'error': str(e),
            'traceback': traceback.format_exc()
        })
        return create_response(500, error="Failed to retrieve ticket messages")

def handle_ai_chat(body: Dict[str, Any]) -> Dict[str, Any]:
    """
    Handle POST /ai/chat - proxy to AI conversation with session memory
    Processes AI chat requests and maintains conversation context
    """
    try:
        log_info("🤖 Processing AI chat request", {
            'hasMessage': 'message' in body,
            'hasSessionId': 'session_id' in body
        })
        
        from ai import chat as ai_chat
        
        required_fields = ['session_id', 'message']
        missing = [f for f in required_fields if f not in body]
        if missing:
            return create_response(400, error=f"Missing required fields: {', '.join(missing)}")

        session_id = str(body['session_id'])
        message = str(body['message'])
        context_seed = body.get('context')  # optional

        result = ai_chat(session_id=session_id, input_text=message, system_context=context_seed)
        return create_response(200, result)
    except Exception as e:
        logger.error(f"Error in AI chat: {str(e)}")
        return create_response(500, error=f"AI error: {str(e)}")

def handle_ai_reset(body: Dict[str, Any]) -> Dict[str, Any]:
    """Handle POST /ai/reset - clears a session"""
    try:
        from ai import reset_session as ai_reset
        
        session_id = body.get('session_id')
        if not session_id:
            return create_response(400, error="Missing required field: session_id")
        ai_reset(str(session_id))
        return create_response(200, {"reset": True})
    except Exception as e:
        logger.error(f"Error in AI reset: {str(e)}")
        return create_response(500, error=f"AI reset error: {str(e)}")

def handle_create_ticket(body: Dict[str, Any]) -> Dict[str, Any]:
    """Handle POST /tickets - create new ticket"""
    try:
        # Validate required fields
        required_fields = ['subject', 'client', 'channel', 'ticket_group']
        for field in required_fields:
            if field not in body:
                return create_response(400, error=f"Missing required field: {field}")
        
        # Validate client object
        client = body['client']
        client_required = ['first_name', 'last_name', 'email']
        for field in client_required:
            if field not in client:
                return create_response(400, error=f"Missing required client field: {field}")
        
        ticket = create_ticket(
            subject=body['subject'],
            client=client,
            channel=body['channel'],
            ticket_group=body['ticket_group'],
            priority=body.get('priority', 'medium'),
            category=body.get('category', 'other'),
            initial_message=body.get('initial_message', '')
        )
        
        return create_response(201, ticket)
        
    except Exception as e:
        logger.error(f"Error creating ticket: {str(e)}")
        return create_response(500, error="Failed to create ticket")

def handle_update_ticket(ticket_id: str, body: Dict[str, Any]) -> Dict[str, Any]:
    """Handle PATCH /tickets/{ticket_id} - update ticket"""
    try:
        logger.info(f"🔄 [UPDATE] Starting ticket update for ID: {ticket_id}")
        logger.info(f"📋 [UPDATE] Request body: {json.dumps(body, indent=2)}")
        
        allowed_updates = ['status', 'assigned_to', 'priority', 'category', 'ticket_group']
        updates = {k: v for k, v in body.items() if k in allowed_updates}
        
        logger.info(f"✅ [UPDATE] Filtered updates: {json.dumps(updates, indent=2)}")
        
        if not updates:
            logger.warning("❌ [UPDATE] No valid fields to update")
            return create_response(400, error="No valid fields to update")
        
        logger.info(f"🔄 [UPDATE] Calling update_ticket_status with updates: {updates}")
        success = update_ticket_status(ticket_id, **updates)
        
        if not success:
            logger.warning(f"❌ [UPDATE] Ticket {ticket_id} not found")
            return create_response(404, error=f"Ticket {ticket_id} not found")
        
        # Return updated ticket
        logger.info(f"🔄 [UPDATE] Retrieving updated ticket data")
        updated_ticket = get_ticket_by_id(ticket_id)
        logger.info(f"✅ [UPDATE] Successfully updated ticket: {json.dumps(updated_ticket, indent=2)}")
        return create_response(200, updated_ticket)
        
    except Exception as e:
        logger.error(f"❌ [UPDATE] Error updating ticket {ticket_id}: {str(e)}")
        import traceback
        logger.error(f"❌ [UPDATE] Full traceback: {traceback.format_exc()}")
        return create_response(500, error="Failed to update ticket")

def handle_add_message(ticket_id: str, body: Dict[str, Any]) -> Dict[str, Any]:
    """Handle POST /tickets/{ticket_id}/messages - add message to ticket"""
    try:
        logger.info(f"📤 [MESSAGE] Starting message add for ticket ID: {ticket_id}")
        logger.info(f"📋 [MESSAGE] Request body: {json.dumps(body, indent=2)}")
        
        # Validate required fields
        required_fields = ['text', 'created_by_type', 'created_by_id', 'created_source']
        missing_fields = [field for field in required_fields if field not in body]
        
        if missing_fields:
            logger.warning(f"❌ [MESSAGE] Missing required fields: {missing_fields}")
            return create_response(400, error=f"Missing required fields: {', '.join(missing_fields)}")
        
        logger.info(f"✅ [MESSAGE] All required fields present, adding message")
        
        message = add_message_to_ticket(
            ticket_id=ticket_id,
            text=body['text'],
            created_by_type=body['created_by_type'],
            created_by_id=body['created_by_id'],
            created_source=body['created_source'],
            attachments=body.get('attachments', [])
        )
        
        if not message:
            logger.error("❌ [MESSAGE] Failed to add message")
            return create_response(500, error="Failed to add message")
        
        logger.info(f"✅ [MESSAGE] Successfully added message: {json.dumps(message, indent=2)}")
        return create_response(201, message)
        
    except Exception as e:
        logger.error(f"❌ [MESSAGE] Error adding message to ticket {ticket_id}: {str(e)}")
        import traceback
        logger.error(f"❌ [MESSAGE] Full traceback: {traceback.format_exc()}")
        return create_response(500, error="Failed to add message")
