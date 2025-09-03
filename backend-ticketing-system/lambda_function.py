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

# Configure logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

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
    """Main Lambda handler function"""
    
    try:
        logger.info(f"Received event: {json.dumps(event)}")
        
        # Handle OPTIONS request for CORS preflight
        if event.get('httpMethod') == 'OPTIONS':
            return create_response(200)
        
        # Extract request details
        method = event.get('httpMethod', '').upper()
        path = event.get('path', '')
        path_parameters = event.get('pathParameters') or {}
        query_parameters = event.get('queryStringParameters') or {}
        
        # Parse body if present
        body = {}
        if event.get('body'):
            try:
                body = json.loads(event['body'])
            except json.JSONDecodeError:
                return create_response(400, error="Invalid JSON in request body")
        
        # Health check endpoint
        if path == '/health' and method == 'GET':
            return create_response(200, {
                'status': 'healthy',
                'service': 'bluelion-ticketing-system',
                'timestamp': datetime.utcnow().isoformat() + 'Z',
                'version': '1.0.0'
            })
        
        # Route requests - Order matters! More specific routes first
        if path == '/tickets':
            if method == 'GET':
                return handle_get_tickets(query_parameters)
            elif method == 'POST':
                return handle_create_ticket(body)
        
        elif path.startswith('/tickets/') and path.endswith('/messages'):
            # Handle messages endpoint BEFORE single ticket endpoint
            ticket_id = path.split('/')[2]  # Extract ticket_id from /tickets/{ticket_id}/messages
            
            if method == 'GET':
                return handle_get_ticket_messages(ticket_id)
            elif method == 'POST':
                return handle_add_message(ticket_id, body)
        
        elif path.startswith('/tickets/') and len(path_parameters.get('ticket_id', '')) > 0:
            ticket_id = path_parameters['ticket_id']
            
            if method == 'GET':
                return handle_get_ticket(ticket_id)
            elif method == 'PATCH':
                return handle_update_ticket(ticket_id, body)
        
        # Route not found
        return create_response(404, error=f"Route not found: {method} {path}")
        
    except Exception as e:
        logger.error(f"Unhandled error: {str(e)}")
        logger.error(traceback.format_exc())
        return create_response(500, error="Internal server error")

def handle_get_tickets(query_params: Dict[str, str]) -> Dict[str, Any]:
    """Handle GET /tickets - retrieve all tickets with optional filtering"""
    try:
        status = query_params.get('status')
        assigned_to = query_params.get('assigned_to')
        ticket_group = query_params.get('ticket_group')
        
        tickets = get_all_tickets(
            status_filter=status,
            assigned_to_filter=assigned_to,
            ticket_group_filter=ticket_group
        )
        
        return create_response(200, tickets)
        
    except Exception as e:
        logger.error(f"Error getting tickets: {str(e)}")
        return create_response(500, error="Failed to retrieve tickets")

def handle_get_ticket(ticket_id: str) -> Dict[str, Any]:
    """Handle GET /tickets/{ticket_id} - retrieve single ticket"""
    try:
        ticket = get_ticket_by_id(ticket_id)
        
        if not ticket:
            return create_response(404, error=f"Ticket {ticket_id} not found")
        
        return create_response(200, ticket)
        
    except Exception as e:
        logger.error(f"Error getting ticket {ticket_id}: {str(e)}")
        return create_response(500, error="Failed to retrieve ticket")

def handle_get_ticket_messages(ticket_id: str) -> Dict[str, Any]:
    """Handle GET /tickets/{ticket_id}/messages - retrieve messages for a ticket"""
    try:
        messages = get_ticket_messages(ticket_id)
        return create_response(200, messages)
        
    except Exception as e:
        logger.error(f"Error getting messages for ticket {ticket_id}: {str(e)}")
        return create_response(500, error="Failed to retrieve ticket messages")

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
