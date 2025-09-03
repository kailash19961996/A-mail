export type Attachment = {
  bucket: string
  key: string
  file_name: string
  content_type: string
  size_bytes: number
}

export type Message = {
  ticket_id: string
  message_sort_key: string
  message_id: string
  created_at: string
  created_by_type: 'CLIENT' | 'AGENT' | 'SYSTEM'
  created_by_id: string
  created_source: string
  text: string
  attachments: Attachment[]
}

export type Client = {
  first_name: string
  last_name: string
  email: string
  phone: string | null
}

export type Ticket = {
  ticket_id: string
  tenant_id: string
  created_at: string
  last_updated_at: string
  resolved_at: string | null
  subject: string
  ticket_group: 'Ops Team' | 'Tech' | 'Litigation' | 'assign group'
  status: 'OPEN' | 'IN_PROGRESS' | 'ON_HOLD' | 'RESOLVED'
  assigned_to: string
  priority: 'high' | 'low' | 'medium'
  category: 'Authentication' | 'credit report' | 'other'
  client: Client | null
  channel: string
  message_count: number
  last_message_at: string
  next_action: 'CLIENT' | 'AGENT'
  // Frontend-only computed properties
  messages?: Message[]
}

export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'ON_HOLD' | 'RESOLVED'
export type StatusKey = 'OPEN' | 'IN_PROGRESS' | 'ON_HOLD' | 'RESOLVED'

export function deriveStatus(ticket: Ticket): TicketStatus {
  return ticket.status
}

export function fullName(ticket: Ticket): string {
  if (!ticket.client) return 'Unknown Client'
  return `${ticket.client.first_name || ''} ${ticket.client.last_name || ''}`.trim() || 'Unknown Client'
}


