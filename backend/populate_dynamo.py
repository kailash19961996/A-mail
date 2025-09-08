#!/usr/bin/env python3
"""
DynamoDB Ticket Data Population Script for A-mail

This script clears and populates DynamoDB tables with diverse ticket and message data.
Creates 30+ tickets with 5-10 messages each, with realistic legal/litigation scenarios.


Requirements:
    - boto3
    - AWS credentials configured
    - DynamoDB tables: Tickets and TicketMessages
"""

import boto3
import json
import random
from datetime import datetime, timedelta
from decimal import Decimal
import uuid

# AWS Configuration
AWS_REGION = 'eu-west-2'
TICKETS_TABLE = 'Tickets'
MESSAGES_TABLE = 'TicketMessages'

# Initialize DynamoDB client
print("🔧 Initializing DynamoDB connection...")
dynamodb = boto3.resource('dynamodb', region_name=AWS_REGION)
tickets_table = dynamodb.Table(TICKETS_TABLE)
messages_table = dynamodb.Table(MESSAGES_TABLE)

def clear_tables():
    """Clear all existing data from both tables"""
    print("🗑️  Clearing existing data from DynamoDB tables...")
    
    try:
        # Clear Tickets table
        print("   📋 Clearing Tickets table...")
        scan = tickets_table.scan()
        with tickets_table.batch_writer() as batch:
            for item in scan['Items']:
                batch.delete_item(Key={'ticket_id': item['ticket_id']})
        print(f"   ✅ Deleted {len(scan['Items'])} tickets")
        
        # Clear TicketMessages table
        print("   💬 Clearing TicketMessages table...")
        scan = messages_table.scan()
        with messages_table.batch_writer() as batch:
            for item in scan['Items']:
                batch.delete_item(Key={
                    'ticket_id': item['ticket_id'],
                    'message_sort_key': item['message_sort_key']
                })
        print(f"   ✅ Deleted {len(scan['Items'])} messages")
        
        print("✅ Tables cleared successfully")
        
    except Exception as e:
        print(f"❌ Error clearing tables: {str(e)}")
        raise

def generate_ticket_scenarios():
    """Generate diverse ticket scenarios for a litigation firm"""
    
    print("📝 Generating diverse legal case scenarios...")
    
    # Core realistic scenarios for litigation firm
    base_scenarios = [
        {
            'client': {'first_name': 'Sarah', 'last_name': 'Johnson', 'email': 'sarah.j@email.com', 'phone': '+44-20-7123-4567'},
            'subject': 'Personal injury claim - car accident',
            'category': 'personal injury',
            'channel': 'Website Form',
            'priority': 'high',
            'initial_message': 'I was involved in a car accident last month where the other driver ran a red light. I suffered whiplash and my car was totaled. I need legal representation for my injury claim and dealing with insurance companies.'
        },
        {
            'client': {'first_name': 'Michael', 'last_name': 'Chen', 'email': 'm.chen@techstartup.co.uk', 'phone': '+44-161-555-0123'},
            'subject': 'Contract dispute with supplier',
            'category': 'commercial litigation',
            'channel': 'Direct Email',
            'priority': 'medium',
            'initial_message': 'Our main supplier has breached their delivery contract, causing significant delays to our product launch. We need to pursue legal action for damages and find a way to exit this contract.'
        },
        {
            'client': {'first_name': 'Emma', 'last_name': 'Williams', 'email': 'e.williams@gmail.com', 'phone': '+44-121-999-8877'},
            'subject': 'Employment discrimination case',
            'category': 'employment law',
            'channel': 'Phone Call',
            'priority': 'high',
            'initial_message': 'I believe I was discriminated against at work due to my pregnancy. My manager started treating me differently after I announced my pregnancy and I was passed over for a promotion I deserved.'
        },
        {
            'client': {'first_name': 'James', 'last_name': 'Thompson', 'email': 'james.thompson@property.com', 'phone': '+44-113-456-7890'},
            'subject': 'Property boundary dispute',
            'category': 'property law',
            'channel': 'Client Portal',
            'priority': 'medium',
            'initial_message': 'My neighbor has built a fence that clearly encroaches 2 feet onto my property. I have the original survey documents and they refuse to acknowledge the boundary. Need legal guidance on my rights.'
        },
        {
            'client': {'first_name': 'Lisa', 'last_name': 'Davies', 'email': 'lisa.davies@hotmail.com', 'phone': '+44-29-2000-1234'},
            'subject': 'Divorce proceedings consultation',
            'category': 'family law',
            'channel': 'Website Form',
            'priority': 'medium',
            'initial_message': 'My marriage has broken down irretrievably. I need to start divorce proceedings and require advice on asset division, custody of our two children, and spousal support arrangements.'
        },
        {
            'client': {'first_name': 'Robert', 'last_name': 'Wilson', 'email': 'r.wilson@innovatetech.co.uk', 'phone': '+44-131-777-5555'},
            'subject': 'Intellectual property theft',
            'category': 'IP law',
            'channel': 'Direct Email',
            'priority': 'urgent',
            'initial_message': 'A competitor has stolen our proprietary software code and is using it in their product. We have evidence of the theft and need immediate legal action to protect our IP and seek damages.'
        },
        {
            'client': {'first_name': 'Amanda', 'last_name': 'Brown', 'email': 'amanda.b@email.co.uk', 'phone': '+44-117-888-9999'},
            'subject': 'Medical negligence claim',
            'category': 'medical negligence',
            'channel': 'Phone Call',
            'priority': 'high',
            'initial_message': 'I suffered serious complications during routine surgery that my doctor says were due to a surgical error. I was in hospital for an additional 3 weeks and may have permanent damage.'
        },
        {
            'client': {'first_name': 'David', 'last_name': 'Miller', 'email': 'd.miller@fintech.io', 'phone': '+44-20-1111-2222'},
            'subject': 'Investor agreement review',
            'category': 'corporate law',
            'channel': 'Client Portal',
            'priority': 'medium',
            'initial_message': 'We need urgent legal review of our Series A investment agreement. The investors are pushing for terms that seem unfavorable and we need advice before signing.'
        },
        {
            'client': {'first_name': 'Sophie', 'last_name': 'Taylor', 'email': 'sophie.taylor@boutique.com', 'phone': '+44-151-333-4444'},
            'subject': 'Defamation case against online reviews',
            'category': 'defamation',
            'channel': 'Website Form',
            'priority': 'medium',
            'initial_message': 'False and extremely damaging reviews about my boutique have been posted online by a competitor. These lies are destroying my business reputation and I need them removed and damages.'
        },
        {
            'client': {'first_name': 'Thomas', 'last_name': 'Anderson', 'email': 't.anderson@propertyinvest.com', 'phone': '+44-191-555-6666'},
            'subject': 'Landlord tenant dispute',
            'category': 'property law',
            'channel': 'Direct Email',
            'priority': 'low',
            'initial_message': 'My tenant has caused significant damage to my rental property and refuses to pay for repairs. They also haven\'t paid rent for 2 months and I need to evict them legally.'
        }
    ]
    
    # Additional case types to reach 30+ tickets
    additional_subjects = [
        'Insurance claim denial appeal',
        'Wrongful termination case',
        'Partnership dissolution',
        'Construction contract dispute',
        'Data breach liability',
        'Trademark infringement',
        'Will contest proceedings',
        'Consumer rights violation',
        'Planning permission appeal',
        'Professional negligence claim',
        'Breach of confidentiality',
        'Shareholder dispute',
        'Lease agreement breach',
        'Product liability case',
        'Age discrimination claim',
        'Copyright infringement',
        'Joint venture agreement',
        'Environmental law compliance',
        'Regulatory investigation',
        'Cross-border transaction',
        'Merger and acquisition',
        'Employment tribunal case',
        'Housing disrepair claim',
        'Clinical negligence',
        'Road traffic accident'
    ]
    
    first_names = ['Oliver', 'Charlotte', 'George', 'Amelia', 'Harry', 'Isla', 'Noah', 'Ava', 'Jack', 'Mia', 
                  'Jacob', 'Grace', 'Leo', 'Lily', 'Oscar', 'Freya', 'Charlie', 'Emily', 'Henry', 'Sophia']
    last_names = ['Smith', 'Jones', 'Williams', 'Brown', 'Wilson', 'Johnson', 'Davies', 'Robinson', 'Wright', 'Thompson',
                 'Evans', 'Walker', 'White', 'Roberts', 'Green', 'Hall', 'Wood', 'Jackson', 'Clarke', 'Patel']
    
    channels = ['Website Form', 'Direct Email', 'Phone Call', 'Client Portal', 'Social Media']
    categories = ['personal injury', 'commercial litigation', 'employment law', 'property law', 'family law', 
                 'IP law', 'medical negligence', 'corporate law', 'defamation', 'regulatory']
    priorities = ['low', 'medium', 'high', 'urgent']
    
    # Extend scenarios to reach 30+ tickets
    all_scenarios = base_scenarios.copy()
    
    for subject in additional_subjects:
        first_name = random.choice(first_names)
        last_name = random.choice(last_names)
        domain = random.choice(['gmail.com', 'hotmail.com', 'yahoo.co.uk', 'company.co.uk', 'business.com', 'law.co.uk'])
        email = f"{first_name.lower()}.{last_name.lower()}@{domain}"
        phone = f"+44-{random.randint(20, 191)}-{random.randint(100, 999)}-{random.randint(1000, 9999)}"
        
        all_scenarios.append({
            'client': {'first_name': first_name, 'last_name': last_name, 'email': email, 'phone': phone},
            'subject': subject,
            'category': random.choice(categories),
            'channel': random.choice(channels),
            'priority': random.choice(priorities),
            'initial_message': f'I need urgent legal assistance regarding {subject.lower()}. This matter is time-sensitive and I would appreciate your prompt advice on how to proceed with this case.'
        })
    
    print(f"✅ Generated {len(all_scenarios)} diverse legal scenarios")
    return all_scenarios

def generate_realistic_conversation(ticket_id, client_email, scenario, target_status):
    """Generate realistic back-and-forth conversation for a ticket with specific message counts"""
    
    # Define message counts based on status
    message_counts = {
        'OPEN': 5,
        'IN_PROGRESS': 15,
        'ON_HOLD': 4,
        'RESOLVED': 6
    }
    
    total_messages = message_counts.get(target_status, 6)
    messages = []
    
    # Start from 30-90 days ago (no future dates)
    base_time = datetime.now() - timedelta(days=random.randint(30, 90))
    
    # Realistic agent responses based on case type
    agent_responses = [
        "Thank you for contacting our firm. I've reviewed your case details and we can definitely assist you with this matter. Let me schedule a consultation to discuss your options.",
        "I'll need some additional documentation to properly assess your case. Can you provide copies of any relevant contracts, correspondence, or evidence you have?",
        "Based on the information you've provided, I believe we have a strong foundation for your case. Let me outline our recommended approach and next steps.",
        "I've consulted with our senior partners about your matter. We recommend proceeding with formal legal action. Here's what we propose...",
        "The opposing party has responded to our initial correspondence. Their position is as expected, and here's how we should counter their arguments.",
        "We've received the court date for your hearing. I'll prepare all necessary documentation and evidence. We should meet beforehand to review our strategy.",
        "Excellent news - we've reached a favorable settlement agreement that meets your objectives. Please review the terms I'm sending you.",
        "Your case has been resolved successfully in your favor. Here's a summary of the outcome and what happens next regarding implementation.",
        "I need to update you on some recent developments in your case. There have been some changes that affect our strategy. When would be convenient for a call?",
        "We've filed all the necessary paperwork with the court and relevant authorities. You should receive official confirmation within 5-7 business days.",
        "I've reviewed the documentation you provided and everything looks comprehensive. We can proceed with the next phase of your case.",
        "The opposing counsel has made a counter-offer. While it's lower than we hoped, it's within a reasonable range. Let me know your thoughts.",
        "I've scheduled a meeting with the expert witness for next week. This testimony will be crucial for strengthening your position.",
        "The judge has requested additional evidence. I'll prepare the supplementary filing and keep you informed of any developments."
    ]
    
    client_responses = [
        "Thank you for the quick response. I really appreciate your help with this matter. I'll gather those documents and send them over today.",
        "This is exactly what I was hoping to hear. When do you expect we'll have a resolution? What are the likely costs involved?",
        "That settlement offer sounds reasonable to me. Please proceed with finalizing the agreement. I'm relieved this is moving forward.",
        "Thanks for keeping me informed. I have a few questions about the next steps. Could we schedule a call tomorrow to discuss?",
        "I've attached all the requested documents to this message. Please let me know if you need anything else to move forward.",
        "This is fantastic news! Thank you so much for your excellent work on this case. I couldn't be happier with the outcome.",
        "I understand the situation. Please keep me updated on any further developments. I'm available for a call anytime this week.",
        "Yes, I'm available for a call tomorrow afternoon. What time works best for you? I want to make sure I understand everything clearly.",
        "Perfect. I'll watch for the confirmation documents and let you know as soon as I receive them. Thank you for handling everything so professionally.",
        "I really appreciate all your hard work on this case. Your expertise has made such a difference. I'll definitely recommend your firm to others.",
        "I have some concerns about the timeline. Is there anything we can do to expedite the process?",
        "The counter-offer seems fair given the circumstances. I'm willing to accept it if you think it's our best option.",
        "I'm a bit worried about the additional costs. Can you provide an estimate of what we might be looking at?",
        "Thank you for explaining everything so clearly. I feel much more confident about our position now."
    ]
    
    # Define agent emails - ensure 2 agents handle each ticket
    primary_agent = 'kylasben@gmail.com'  # User (second agent)
    other_agents = [
        'sarah.legal@firm.co.uk',
        'james.partner@firm.co.uk', 
        'emma.associate@firm.co.uk',
        'david.senior@firm.co.uk'
    ]
    secondary_agent = random.choice(other_agents)
    
    # Generate messages ensuring alternating client/agent pattern
    for i in range(total_messages):
        # Time between messages (1-24 hours)
        if i > 0:
            time_offset = timedelta(hours=random.randint(1, 24))
            base_time += time_offset
        
        if i == 0:
            # First message is always from client
            messages.append({
                'text': scenario['initial_message'],
                'created_by_type': 'CLIENT',
                'created_by_id': client_email,
                'created_source': scenario['channel'],
                'created_at': base_time
            })
        elif i % 2 == 1:
            # Odd indices = Agent responses
            # Alternate between two agents, with primary agent (kylasben) handling more
            if i == 1 or random.random() < 0.7:  # 70% primary agent
                agent_email = primary_agent
            else:
                agent_email = secondary_agent
                
            messages.append({
                'text': random.choice(agent_responses),
                'created_by_type': 'AGENT',
                'created_by_id': agent_email,
                'created_source': 'Internal CRM',
                'created_at': base_time
            })
        else:
            # Even indices = Client responses
            messages.append({
                'text': random.choice(client_responses),
                'created_by_type': 'CLIENT',
                'created_by_id': client_email,
                'created_source': scenario['channel'],
                'created_at': base_time
            })
    
    return messages

def create_tickets_and_messages():
    """Create tickets and their associated messages in DynamoDB"""
    
    scenarios = generate_ticket_scenarios()
    statuses = ['OPEN', 'IN_PROGRESS', 'ON_HOLD', 'RESOLVED']
    ticket_groups = ['Ops Team', 'Tech', 'Litigation']
    
    # Distribute tickets across statuses
    status_distribution = {
        'OPEN': 8,          # 8 tickets with 5 messages each
        'IN_PROGRESS': 12,  # 12 tickets with 15 messages each  
        'ON_HOLD': 6,       # 6 tickets with 4 messages each
        'RESOLVED': 9       # 9 tickets with 6 messages each
    }
    
    print(f"📝 Creating {len(scenarios)} tickets with realistic conversations...")
    print(f"📊 Distribution: {status_distribution}")
    
    status_list = []
    for status, count in status_distribution.items():
        status_list.extend([status] * count)
    
    # Shuffle to randomize which scenarios get which status
    random.shuffle(status_list)
    
    for i, scenario in enumerate(scenarios):
        try:
            # Create unique ticket ID
            ticket_id = f"TICKET-{str(uuid.uuid4()).upper()[:12]}"
            
            # Get status for this ticket (or default if we have more scenarios)
            status = status_list[i] if i < len(status_list) else random.choice(statuses)
            
            # Generate realistic message conversation with specific status
            messages = generate_realistic_conversation(ticket_id, scenario['client']['email'], scenario, status)
            
            # Set assignment based on status
            if status == 'OPEN':
                assigned_to = 'UNASSIGNED'
            else:
                assigned_to = 'kylasben@gmail.com'
            
            # Calculate timing
            ticket_created = messages[0]['created_at']
            ticket_updated = messages[-1]['created_at']
            
            # Determine next action based on last message
            last_message = messages[-1]
            next_action = 'AGENT' if last_message['created_by_type'] == 'CLIENT' else 'CLIENT'
            
            # Create ticket record
            ticket_item = {
                'ticket_id': ticket_id,
                'assigned_to': assigned_to,
                'category': scenario['category'],
                'channel': scenario['channel'],
                'client': scenario['client'],
                'created_at': ticket_created.isoformat(),
                'last_message_at': ticket_updated.isoformat(),
                'last_updated_at': ticket_updated.isoformat(),
                'message_count': len(messages),
                'next_action': next_action,
                'priority': scenario['priority'],
                'resolved_at': ticket_updated.isoformat() if status == 'RESOLVED' else None,
                'status': status,
                'subject': scenario['subject'],
                'tenant_id': 'A-mail',
                'ticket_group': random.choice(ticket_groups)
            }
            
            # Insert ticket into DynamoDB
            tickets_table.put_item(Item=ticket_item)
            
            # Insert messages into DynamoDB
            for j, message in enumerate(messages):
                message_id = f"{str(uuid.uuid4()).upper()[:8]}"
                message_sort_key = f"{int(message['created_at'].timestamp() * 1000):015d}#{message_id}"
                
                message_item = {
                    'ticket_id': ticket_id,
                    'message_sort_key': message_sort_key,
                    'message_id': message_id,
                    'text': message['text'],
                    'created_by_type': message['created_by_type'],
                    'created_by_id': message['created_by_id'],
                    'created_source': message['created_source'],
                    'created_at': message['created_at'].isoformat(),
                    'attachments': []
                }
                
                messages_table.put_item(Item=message_item)
            
            print(f"✅ Created ticket {i+1}/{len(scenarios)}: {ticket_id} ({status}) with {len(messages)} messages")
            
        except Exception as e:
            print(f"❌ Error creating ticket {i+1}: {str(e)}")
            continue
    
    print(f"🎉 Successfully created {len(scenarios)} tickets with realistic legal conversations!")

def main():
    """Main execution function"""
    print("🚀 Starting A-mail DynamoDB population script...")
    print(f"📍 Region: {AWS_REGION}")
    print(f"📋 Tables: {TICKETS_TABLE}, {MESSAGES_TABLE}")
    print("=" * 60)
    
    try:
        # Clear existing data
        clear_tables()
        print()
        
        # Create new realistic data
        create_tickets_and_messages()
        print()
        
        print("✨ Script completed successfully!")
        print("💡 Your DynamoDB tables now contain diverse, realistic legal case data.")
        print("🎯 Perfect for testing the A-mail application!")
        print("=" * 60)
        
    except Exception as e:
        print(f"❌ Fatal error: {str(e)}")
        print("💡 Make sure your AWS credentials are configured and DynamoDB tables exist.")
        raise

if __name__ == "__main__":
    main()
