import { API_CONFIG } from '../config/api'
import type { Ticket, Message } from '../types/ticket'

export interface ApiResponse<T> {
  success: boolean
  data: T
  timestamp?: string
}

export interface ErrorResponse {
  success: false
  error: string
}

class ApiService {
  private baseUrl: string

  constructor() {
    this.baseUrl = API_CONFIG.BASE_URL
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T> | ErrorResponse> {
    try {
      const url = `${this.baseUrl}${endpoint}`
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        console.error('API Error:', data)
        return {
          success: false,
          error: data.error || `HTTP ${response.status}: ${response.statusText}`,
        }
      }

      return data
    } catch (error) {
      console.error('Network Error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown network error',
      }
    }
  }

  async healthCheck(): Promise<ApiResponse<any> | ErrorResponse> {
    return this.makeRequest(API_CONFIG.ENDPOINTS.HEALTH)
  }

  async getTickets(filters?: {
    status?: string
    assigned_to?: string
    ticket_group?: string
  }): Promise<ApiResponse<Ticket[]> | ErrorResponse> {
    console.log('🚀 [API] Starting getTickets request', { filters })
    
    const params = new URLSearchParams()
    if (filters?.status) params.append('status', filters.status)
    if (filters?.assigned_to) params.append('assigned_to', filters.assigned_to)
    if (filters?.ticket_group) params.append('ticket_group', filters.ticket_group)

    const endpoint = `${API_CONFIG.ENDPOINTS.TICKETS}${
      params.toString() ? '?' + params.toString() : ''
    }`
    
    console.log('📡 [API] Fetching tickets from:', endpoint)
    const result = await this.makeRequest<Ticket[]>(endpoint)
    
    if (result.success) {
      console.log('✅ [API] Tickets fetched successfully, count:', result.data.length)
      
      // Strategy 1: Try to get individual ticket details with messages (fallback to basic tickets)
      const ticketsWithMessages = await Promise.all(
        result.data.map(async (ticket) => {
          try {
            console.log(`📨 [API] Fetching details for ticket: ${ticket.ticket_id}`)
            
            // Try to get full ticket details (should include messages from backend)
            const fullTicketResult = await this.getTicket(ticket.ticket_id)
            
            if (fullTicketResult.success && fullTicketResult.data.messages) {
              console.log(`✅ [API] Full ticket data retrieved for ${ticket.ticket_id}, messages: ${fullTicketResult.data.messages.length}`)
              return fullTicketResult.data
            }
            
            // Fallback: try direct message endpoint
            console.log(`⚠️ [API] Full ticket failed, trying direct messages for ${ticket.ticket_id}`)
            const messagesResult = await this.getTicketMessages(ticket.ticket_id)
            const messages = messagesResult.success && Array.isArray(messagesResult.data) 
              ? messagesResult.data 
              : []
            
            console.log(`📊 [API] Direct messages result for ${ticket.ticket_id}: ${messages.length} messages`)
            
            return {
              ...ticket,
              messages,
            }
          } catch (error) {
            console.error(`❌ [API] Failed to load messages for ticket ${ticket.ticket_id}:`, error)
            return {
              ...ticket,
              messages: [],
            }
          }
        })
      )
      
      console.log('🎯 [API] Final tickets with messages:', ticketsWithMessages.length)
      
      return {
        ...result,
        data: ticketsWithMessages,
      }
    }
    
    console.error('❌ [API] Failed to fetch tickets:', result)
    return result
  }

  async getTicket(ticketId: string): Promise<ApiResponse<Ticket> | ErrorResponse> {
    console.log(`🎫 [API] Fetching single ticket: ${ticketId}`)
    
    const result = await this.makeRequest<Ticket>(
      API_CONFIG.ENDPOINTS.TICKET_BY_ID(ticketId)
    )
    
    if (result.success) {
      console.log(`✅ [API] Ticket ${ticketId} fetched successfully`)
      
      // Check if messages are already included in the response
      if (result.data.messages && Array.isArray(result.data.messages)) {
        console.log(`📨 [API] Ticket ${ticketId} already includes ${result.data.messages.length} messages`)
        return result
      }
      
      // If not, try to fetch messages separately
      console.log(`📨 [API] Fetching messages separately for ticket ${ticketId}`)
      try {
        const messagesResult = await this.getTicketMessages(ticketId)
        const messages = messagesResult.success && Array.isArray(messagesResult.data) 
          ? messagesResult.data 
          : []
        
        console.log(`📊 [API] Fetched ${messages.length} messages for ticket ${ticketId}`)
        
        return {
          ...result,
          data: {
            ...result.data,
            messages,
          },
        }
      } catch (error) {
        console.error(`❌ [API] Failed to load messages for ticket ${ticketId}:`, error)
        return {
          ...result,
          data: {
            ...result.data,
            messages: [],
          },
        }
      }
    }
    
    console.error(`❌ [API] Failed to fetch ticket ${ticketId}:`, result)
    return result
  }

  async getTicketMessages(ticketId: string): Promise<ApiResponse<Message[]> | ErrorResponse> {
    console.log(`📨 [API] Fetching messages for ticket: ${ticketId}`)
    
    const endpoint = API_CONFIG.ENDPOINTS.TICKET_MESSAGES(ticketId)
    console.log(`📡 [API] Messages endpoint: ${endpoint}`)
    
    const result = await this.makeRequest<Message[]>(endpoint)
    
    if (result.success) {
      console.log(`✅ [API] Messages fetched successfully for ${ticketId}, count: ${result.data.length}`)
    } else {
      console.error(`❌ [API] Failed to fetch messages for ${ticketId}:`, result)
    }
    
    return result
  }

  async createTicket(ticketData: {
    subject: string
    client: {
      first_name: string
      last_name: string
      email: string
      phone?: string | null
    }
    channel: string
    ticket_group: string
    priority?: string
    category?: string
    initial_message?: string
  }): Promise<ApiResponse<Ticket> | ErrorResponse> {
    return this.makeRequest<Ticket>(API_CONFIG.ENDPOINTS.TICKETS, {
      method: 'POST',
      body: JSON.stringify(ticketData),
    })
  }

  async updateTicket(
    ticketId: string,
    updates: {
      status?: string
      assigned_to?: string
      priority?: string
      category?: string
      ticket_group?: string
      next_action?: string
    }
  ): Promise<ApiResponse<Ticket> | ErrorResponse> {
    return this.makeRequest<Ticket>(
      API_CONFIG.ENDPOINTS.TICKET_BY_ID(ticketId),
      {
        method: 'PATCH',
        body: JSON.stringify(updates),
      }
    )
  }

  async addMessage(
    ticketId: string,
    messageData: {
      text: string
      created_by_type: 'CLIENT' | 'AGENT' | 'SYSTEM'
      created_by_id: string
      created_source: string
      attachments?: Array<{
        bucket: string
        key: string
        file_name: string
        content_type: string
        size_bytes: number
      }>
    }
  ): Promise<ApiResponse<Message> | ErrorResponse> {
    return this.makeRequest<Message>(
      API_CONFIG.ENDPOINTS.TICKET_MESSAGES(ticketId),
      {
        method: 'POST',
        body: JSON.stringify(messageData),
      }
    )
  }
}

export const apiService = new ApiService()

// Helper function for error handling in components
export function isErrorResponse(
  response: ApiResponse<any> | ErrorResponse
): response is ErrorResponse {
  return !response.success
}
