import { useEffect, useMemo, useState } from 'react'
import { StatusTabs } from './components/StatusTabs'
import { TicketList } from './components/TicketList'
import { TicketConversation } from './components/TicketConversation'
import { AssistantPanel } from './components/AssistantPanel'
import { apiService, isErrorResponse } from './services/api'
import type { Ticket, StatusKey } from './types/ticket'
import './styles/animations.css'
import { useAuth } from '../contexts/AuthContext'


export default function TicketsApp() {
  const { user } = useAuth()
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeStatus, setActiveStatus] = useState<StatusKey>('OPEN')
  const [activeTicketId, setActiveTicketId] = useState<string | undefined>()
  const [assistantOpen, setAssistantOpen] = useState(false)

  const loadTickets = async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await apiService.getTickets()
      if (isErrorResponse(result)) {
        setError(result.error)
        console.error('Failed to load tickets:', result.error)
      } else {
        setTickets(result.data)
        if (result.data.length > 0 && !activeTicketId) {
          setActiveTicketId(result.data[0].ticket_id)
        }
      }
    } catch (err) {
      setError('Failed to connect to the server')
      console.error('Network error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleTicketUpdate = async (ticketId: string, updates?: Partial<Ticket>) => {
    // Smart state management - update local state directly instead of refreshing
    if (updates) {
      setTickets(prev => prev.map(t => 
        t.ticket_id === ticketId 
          ? { ...t, ...updates, last_updated_at: new Date().toISOString() }
          : t
      ))
    } else {
      // Fallback: only refresh the specific ticket if no updates provided
      const result = await apiService.getTicket(ticketId)
      if (!isErrorResponse(result)) {
        setTickets(prev => prev.map(t => t.ticket_id === ticketId ? result.data : t))
      }
    }
    
    // Add smooth animation to updated ticket
    setTimeout(() => {
      const ticketElement = document.querySelector(`[data-ticket-id="${ticketId}"]`)
      if (ticketElement) {
        ticketElement.classList.add('animate-pulse')
        setTimeout(() => ticketElement.classList.remove('animate-pulse'), 1000)
      }
    }, 50)
  }

  useEffect(() => { loadTickets() }, [])

  const currentUserEmail = user?.email || (typeof window !== 'undefined' ? localStorage.getItem('auth_email') || '' : '')

  const emailAliases = (email: string): string[] => {
    if (!email) return []
    const [local, domain] = email.split('@')
    if (!domain) return [email]
    const aliases = new Set<string>()
    aliases.add(email)
    if (domain.toLowerCase() === 'bluelionlaw.com') {
      aliases.add(`${local}@claimlionlaw.com`)
    } else if (domain.toLowerCase() === 'claimlionlaw.com') {
      aliases.add(`${local}@bluelionlaw.com`)
    }
    return Array.from(aliases)
  }

  const counts = useMemo(() => {
    const open = tickets.filter(t => t.assigned_to === 'UNASSIGNED' || !t.assigned_to).length
    const aliases = emailAliases(currentUserEmail)
    const inProgress = tickets.filter(t => aliases.includes(t.assigned_to) && t.status === 'IN_PROGRESS').length
    const onHold = tickets.filter(t => aliases.includes(t.assigned_to) && t.status === 'ON_HOLD').length
    const resolved = tickets.filter(t => aliases.includes(t.assigned_to) && t.status === 'RESOLVED').length
    return { OPEN: open, IN_PROGRESS: inProgress, ON_HOLD: onHold, RESOLVED: resolved }
  }, [tickets, currentUserEmail])

  const filtered = useMemo(() => {
    const aliases = emailAliases(currentUserEmail)
    switch (activeStatus) {
      case 'OPEN':
        return tickets.filter(t => t.assigned_to === 'UNASSIGNED' || !t.assigned_to)
      case 'IN_PROGRESS':
        return tickets.filter(t => aliases.includes(t.assigned_to) && t.status === 'IN_PROGRESS')
      case 'ON_HOLD':
        return tickets.filter(t => aliases.includes(t.assigned_to) && t.status === 'ON_HOLD')
      case 'RESOLVED':
        return tickets.filter(t => aliases.includes(t.assigned_to) && t.status === 'RESOLVED')
      default:
        return []
    }
  }, [tickets, activeStatus, currentUserEmail])
  
  const activeTicket = tickets.find(ticket => ticket.ticket_id === activeTicketId)

  // Ensure a valid selection exists for the current tab
  useEffect(() => {
    if (!filtered || filtered.length === 0) return
    const stillVisible = filtered.some(t => t.ticket_id === activeTicketId)
    if (!stillVisible) {
      setActiveTicketId(filtered[0].ticket_id)
    }
  }, [activeStatus, filtered])



  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading tickets...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Connection Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button onClick={loadTickets} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">Retry</button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen p-4 overflow-hidden">
      {/* Three-column responsive layout: Sidebar (tabs+list) | Conversation | Assistant */}
      <div className="flex h-full gap-4 overflow-hidden">
        {/* Status Tabs + Ticket List */}
        <aside
          className="flex flex-col gap-3 h-full min-h-0"
          style={{ width: '24%', minWidth: 280 }}
        >
          <div className="rounded-2xl p-3 shadow-lg" style={{ background: 'rgba(255,255,255,0.7)' }}>
            <StatusTabs 
              counts={counts} 
              active={activeStatus}
              onChange={setActiveStatus} 
            />
          </div>
          <TicketList 
            tickets={filtered} 
            activeTicketId={activeTicketId} 
            onSelect={setActiveTicketId} 
          />
        </aside>

        {/* Conversation Panel - width shrinks when assistant is open */}
        <main
          className="rounded-2xl shadow-lg transition-all h-full min-h-0 overflow-visible"
          style={{
            background: 'rgba(255,255,255,0.7)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            flexBasis: assistantOpen ? '51%' : '76%',
            flexGrow: 0,
            flexShrink: 0
          }}
        >
          <TicketConversation
            ticket={activeTicket}
            assistantOpen={assistantOpen}
            onToggleAssistant={() => setAssistantOpen((v) => !v)}
            onTicketUpdate={handleTicketUpdate}
          />
        </main>

        {/* Assistant Panel - shows as right column when open */}
        <AssistantPanel 
          open={assistantOpen} 
          onToggle={() => setAssistantOpen((v) => !v)}
          ticket={activeTicket}
        />
      </div>
    </div>
  )
}


