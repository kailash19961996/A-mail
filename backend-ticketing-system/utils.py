import boto3
import os
from typing import Dict, List, Any, Optional
from datetime import datetime
from decimal import Decimal
import uuid
import json
import logging

# Configure logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

# Initialize AWS clients
dynamodb = boto3.resource('dynamodb', region_name=os.environ.get('AWS_REGION', 'eu-west-2'))
tickets_table = dynamodb.Table(os.environ.get('TICKETS_TABLE', 'Tickets'))
messages_table = dynamodb.Table(os.environ.get('MESSAGES_TABLE', 'TicketMessages'))

def decimal_to_int(obj):
    """Convert DynamoDB Decimal objects to int/float for JSON serialization"""
    if isinstance(obj, Decimal):
        return int(obj) if obj % 1 == 0 else float(obj)
    elif isinstance(obj, dict):
        return {k: decimal_to_int(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [decimal_to_int(v) for v in obj]
    return obj

def get_current_timestamp() -> str:
    """Get current timestamp in ISO8601 format"""
    return datetime.utcnow().isoformat() + 'Z'

def generate_ticket_id() -> str:
    """Generate a unique ticket ID"""
    return f"TICKET-{uuid.uuid4().hex[:12].upper()}"

def generate_message_id() -> str:
    """Generate a unique message ID using UUID"""
    return uuid.uuid4().hex[:16].upper()

def get_all_tickets(
    status_filter: Optional[str] = None,
    assigned_to_filter: Optional[str] = None,
    ticket_group_filter: Optional[str] = None
) -> List[Dict[str, Any]]:
    """
    Retrieve all tickets with optional filtering
    Uses GSI queries when filters are provided for better performance
    """
    try:
        if status_filter:
            # Use GSI1 - ByStatusUpdated
            response = tickets_table.query(
                IndexName='GSI1',
                KeyConditionExpression='#status = :status',
                ExpressionAttributeNames={'#status': 'status'},
                ExpressionAttributeValues={':status': status_filter.upper()},
                ScanIndexForward=False  # Sort by last_updated_at descending
            )
        elif assigned_to_filter:
            # Use GSI2 - ByAssigneeUpdated
            response = tickets_table.query(
                IndexName='GSI2',
                KeyConditionExpression='assigned_to = :assigned_to',
                ExpressionAttributeValues={':assigned_to': assigned_to_filter},
                ScanIndexForward=False
            )
        elif ticket_group_filter:
            # Use GSI4 - ByGroupStatusUpdated (we'll need to scan all statuses for this group)
            response = tickets_table.query(
                IndexName='GSI4',
                KeyConditionExpression='ticket_group = :group',
                ExpressionAttributeValues={':group': ticket_group_filter},
                ScanIndexForward=False
            )
        else:
            # No filters - scan all tickets (not ideal for production)
            response = tickets_table.scan()
        
        tickets = response.get('Items', [])
        
        # Convert Decimal objects and sort by last_updated_at
        tickets = [decimal_to_int(ticket) for ticket in tickets]
        tickets.sort(key=lambda x: x.get('last_updated_at', ''), reverse=True)
        
        return tickets
        
    except Exception as e:
        logger.error(f"Error retrieving tickets: {str(e)}")
        raise

def get_ticket_by_id(ticket_id: str) -> Optional[Dict[str, Any]]:
    """Retrieve a single ticket by ID"""
    try:
        response = tickets_table.get_item(Key={'ticket_id': ticket_id})
        
        if 'Item' in response:
            return decimal_to_int(response['Item'])
        
        return None
        
    except Exception as e:
        logger.error(f"Error retrieving ticket {ticket_id}: {str(e)}")
        raise

def get_ticket_messages(ticket_id: str) -> List[Dict[str, Any]]:
    """Retrieve all messages for a ticket, ordered chronologically"""
    try:
        response = messages_table.query(
            KeyConditionExpression='ticket_id = :ticket_id',
            ExpressionAttributeValues={':ticket_id': ticket_id},
            ScanIndexForward=True  # Sort by message_sort_key ascending (chronological)
        )
        
        messages = response.get('Items', [])
        return [decimal_to_int(message) for message in messages]
        
    except Exception as e:
        logger.error(f"Error retrieving messages for ticket {ticket_id}: {str(e)}")
        raise

def create_ticket(
    subject: str,
    client: Dict[str, Any],
    channel: str,
    ticket_group: str,
    priority: str = 'medium',
    category: str = 'other',
    initial_message: str = '',
    assigned_to: str = 'UNASSIGNED'
) -> Dict[str, Any]:
    """Create a new ticket and optionally an initial message"""
    try:
        ticket_id = generate_ticket_id()
        current_time = get_current_timestamp()
        
        # Create ticket item
        ticket_item = {
            'ticket_id': ticket_id,
            'tenant_id': 'BlueLionLaw',
            'created_at': current_time,
            'last_updated_at': current_time,
            'resolved_at': None,
            'subject': subject,
            'ticket_group': ticket_group,
            'status': 'OPEN',
            'assigned_to': assigned_to,
            'priority': priority,
            'category': category,
            'client': client,
            'channel': channel,
            'message_count': 1 if initial_message else 0,
            'last_message_at': current_time if initial_message else None,
            'next_action': 'AGENT'
        }
        
        # Save ticket to DynamoDB
        tickets_table.put_item(Item=ticket_item)
        
        # If there's an initial message, create it
        if initial_message:
            add_message_to_ticket(
                ticket_id=ticket_id,
                text=initial_message,
                created_by_type='CLIENT',
                created_by_id=client.get('email', 'unknown'),
                created_source=channel,
                attachments=[]
            )
        
        return decimal_to_int(ticket_item)
        
    except Exception as e:
        logger.error(f"Error creating ticket: {str(e)}")
        raise

def update_ticket_status(
    ticket_id: str,
    status: Optional[str] = None,
    assigned_to: Optional[str] = None,
    priority: Optional[str] = None,
    category: Optional[str] = None,
    ticket_group: Optional[str] = None,
    next_action: Optional[str] = None
) -> bool:
    """Update ticket fields"""
    try:
        logger.info(f"🔄 [DB-UPDATE] Starting update for ticket {ticket_id}")
        updates_dict = {k: v for k, v in locals().items() if k != 'ticket_id' and v is not None}
        logger.info(f"📋 [DB-UPDATE] Updates to apply: {json.dumps(updates_dict, indent=2)}")
        
        # Build update expression dynamically
        update_expression = "SET last_updated_at = :last_updated"
        expression_values = {
            ':last_updated': get_current_timestamp()
        }
        
        if status:
            logger.info(f"✅ [DB-UPDATE] Adding status update: {status}")
            update_expression += ", #status = :status"
            expression_values[':status'] = status.upper()
            
            # Set resolved_at if status is RESOLVED
            if status.upper() == 'RESOLVED':
                logger.info(f"✅ [DB-UPDATE] Setting resolved_at timestamp")
                update_expression += ", resolved_at = :resolved_at"
                expression_values[':resolved_at'] = get_current_timestamp()
        
        if assigned_to is not None:
            update_expression += ", assigned_to = :assigned_to"
            expression_values[':assigned_to'] = assigned_to
        
        if priority:
            update_expression += ", priority = :priority"
            expression_values[':priority'] = priority
        
        if category:
            update_expression += ", category = :category"
            expression_values[':category'] = category
        
        if ticket_group:
            update_expression += ", ticket_group = :ticket_group"
            expression_values[':ticket_group'] = ticket_group
        
        if next_action:
            update_expression += ", next_action = :next_action"
            expression_values[':next_action'] = next_action.upper()
        
        # Add expression attribute names if using reserved words
        expression_names = {}
        if status:
            expression_names['#status'] = 'status'
        
        update_kwargs = {
            'Key': {'ticket_id': ticket_id},
            'UpdateExpression': update_expression,
            'ExpressionAttributeValues': expression_values,
            'ReturnValues': 'ALL_NEW'
        }
        
        if expression_names:
            update_kwargs['ExpressionAttributeNames'] = expression_names
        
        response = tickets_table.update_item(**update_kwargs)
        
        return 'Attributes' in response
        
    except Exception as e:
        logger.error(f"Error updating ticket {ticket_id}: {str(e)}")
        raise

def add_message_to_ticket(
    ticket_id: str,
    text: str,
    created_by_type: str,
    created_by_id: str,
    created_source: str,
    attachments: List[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """Add a message to a ticket and update ticket metadata"""
    try:
        if attachments is None:
            attachments = []
        
        current_time = get_current_timestamp()
        message_id = generate_message_id()
        
        # Create message sort key (timestamp + message_id for uniqueness)
        message_sort_key = f"{current_time}#{message_id}"
        
        # Create message item
        message_item = {
            'ticket_id': ticket_id,
            'message_sort_key': message_sort_key,
            'message_id': message_id,
            'created_at': current_time,
            'created_by_type': created_by_type.upper(),
            'created_by_id': created_by_id,
            'created_source': created_source,
            'text': text,
            'attachments': attachments
        }
        
        # Save message to DynamoDB
        messages_table.put_item(Item=message_item)
        
        # Determine next_action based on who sent the message
        # If AGENT sends message, next action should be CLIENT
        # If CLIENT sends message, next action should be AGENT
        next_action = 'CLIENT' if created_by_type.upper() == 'AGENT' else 'AGENT'
        
        logger.info(f"📋 [MESSAGE] Setting next_action: {next_action} (message from {created_by_type})")
        
        # Update ticket metadata
        tickets_table.update_item(
            Key={'ticket_id': ticket_id},
            UpdateExpression='ADD message_count :inc SET last_message_at = :last_message, last_updated_at = :last_updated, next_action = :next_action',
            ExpressionAttributeValues={
                ':inc': 1,
                ':last_message': current_time,
                ':last_updated': current_time,
                ':next_action': next_action
            }
        )
        
        return decimal_to_int(message_item)
        
    except Exception as e:
        logger.error(f"Error adding message to ticket {ticket_id}: {str(e)}")
        raise

def get_tickets_by_status(status: str) -> List[Dict[str, Any]]:
    """Get all tickets with a specific status using GSI1"""
    try:
        response = tickets_table.query(
            IndexName='GSI1',
            KeyConditionExpression='#status = :status',
            ExpressionAttributeNames={'#status': 'status'},
            ExpressionAttributeValues={':status': status.upper()},
            ScanIndexForward=False
        )
        
        tickets = response.get('Items', [])
        return [decimal_to_int(ticket) for ticket in tickets]
        
    except Exception as e:
        logger.error(f"Error retrieving tickets by status {status}: {str(e)}")
        raise

def get_tickets_by_assignee(assigned_to: str) -> List[Dict[str, Any]]:
    """Get all tickets assigned to a specific user using GSI2"""
    try:
        response = tickets_table.query(
            IndexName='GSI2',
            KeyConditionExpression='assigned_to = :assigned_to',
            ExpressionAttributeValues={':assigned_to': assigned_to},
            ScanIndexForward=False
        )
        
        tickets = response.get('Items', [])
        return [decimal_to_int(ticket) for ticket in tickets]
        
    except Exception as e:
        logger.error(f"Error retrieving tickets by assignee {assigned_to}: {str(e)}")
        raise

def get_tickets_by_client_email(email: str) -> List[Dict[str, Any]]:
    """Get all tickets for a specific client email using GSI3"""
    try:
        response = tickets_table.query(
            IndexName='GSI3',
            KeyConditionExpression='client.email = :email',
            ExpressionAttributeValues={':email': email},
            ScanIndexForward=False
        )
        
        tickets = response.get('Items', [])
        return [decimal_to_int(ticket) for ticket in tickets]
        
    except Exception as e:
        logger.error(f"Error retrieving tickets by client email {email}: {str(e)}")
        raise
