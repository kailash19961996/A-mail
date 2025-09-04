import dayjs from 'dayjs'
import { ChevronDownIcon } from '@heroicons/react/24/outline'
import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import type { Ticket, TicketStatus, Attachment } from '../types/ticket'
import { apiService } from '../services/api'
import { useAuth } from '../../contexts/AuthContext'

// PendingMessage component with countdown timer
function PendingMessage({ message, onUndo }: { message: string, onUndo: () => void }) {
  const [countdown, setCountdown] = useState(5)
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    
    return () => clearInterval(timer)
  }, [])
  
  return (
    <div 
      className="flex w-full justify-end message-slide-in"
      style={{ 
        animation: 'slideInFromBottom 0.3s ease-out',
        transform: 'translateY(0)'
      }}
    >
      <div
        className="rounded-2xl px-3 py-2 text-xs shadow-soft transform transition-all duration-300 relative"
        style={{ 
          maxWidth: '66%',
          background: 'rgba(239, 246, 255, 0.9)', // Clean light blue
          color: '#1f2937', // Dark grey for readability
          border: '1px solid rgba(219, 234, 254, 0.8)'
        }}
      >
        <div className="whitespace-pre-wrap">{message}</div>
        <div className="mt-1 flex justify-end">
          <button
            onClick={onUndo}
            className="text-xs px-2 py-1 rounded bg-blue-100 hover:bg-blue-200 text-blue-700 transition-colors duration-200 font-medium"
            style={{ 
              fontSize: '10px'
            }}
          >
            Undo {countdown}s
          </button>
        </div>
      </div>
    </div>
  )
}

type Props = {
  ticket?: Ticket
  assistantOpen: boolean
  onToggleAssistant: () => void
  onTicketUpdate?: (ticketId: string, updates?: Partial<Ticket>) => Promise<void>
}

// Get current user from application auth context

// UI color scheme constants
const UI_COLORS = {
  primary: '#6366f1', // indigo-500
  primaryHover: '#4f46e5', // indigo-600
  success: '#10b981', // emerald-500
  successHover: '#059669', // emerald-600
  danger: '#ef4444', // red-500
  dangerHover: '#dc2626', // red-600
  status: {
    'OPEN': '#6b7280', // gray-500
    'IN_PROGRESS': '#3b82f6', // blue-500
    'ON_HOLD': '#f59e0b', // amber-500
    'RESOLVED': '#10b981', // emerald-500
  },
  group: {
    'Ops Team': '#6b7280', // gray-500 - unified with UI
    'Tech': '#6b7280', // gray-500 - unified with UI
    'Litigation': '#6b7280', // gray-500 - unified with UI
  }
}

export function TicketConversation({ ticket, assistantOpen, onToggleAssistant, onTicketUpdate }: Props) {
  const { user } = useAuth()
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false)
  const [ticketGroupDropdownOpen, setTicketGroupDropdownOpen] = useState(false)
  const [attachmentViewer, setAttachmentViewer] = useState<Attachment | null>(null)
  const [messageText, setMessageText] = useState('')
  const [isAssigned, setIsAssigned] = useState(ticket?.assigned_to === (user?.email || ''))
  const [isSending, setIsSending] = useState(false)
  const [currentStatus, setCurrentStatus] = useState<TicketStatus>(ticket?.status || 'OPEN')
  const [currentTicketGroup, setCurrentTicketGroup] = useState<'Ops Team' | 'Tech' | 'Litigation' | 'assign group'>('assign group')
  const [pendingMessage, setPendingMessage] = useState<{text: string, id: string, timer: number | null} | null>(null)



  
  // Update state when ticket changes
  useEffect(() => {
    if (ticket) {
      console.log('🔄 [TICKET] Updating ticket state:', {
        ticketId: ticket.ticket_id,
        status: ticket.status,
        assignedTo: ticket.assigned_to,
        messageCount: ticket.messages?.length || 0
      })
      setCurrentStatus(ticket.status)
      setCurrentTicketGroup(ticket.ticket_group as 'Ops Team' | 'Tech' | 'Litigation' || 'assign group')
      setIsAssigned(ticket.assigned_to === (user?.email || ''))
    }
  }, [ticket])
  
  const handleStatusChange = async (newStatus: TicketStatus) => {
    if (!ticket || !isAssigned) return // Only allow status changes when assigned
    
    // Optimistic update - update UI immediately
    const previousStatus = currentStatus
    setCurrentStatus(newStatus)
    setStatusDropdownOpen(false)
    
    // Add smooth animation
    const button = document.querySelector('.status-dropdown-button')
    if (button) {
      button.classList.add('animate-bounce')
      setTimeout(() => button.classList.remove('animate-bounce'), 600)
    }
    
    try {
      console.log('🔄 [STATUS] Updating ticket status:', {
        ticketId: ticket.ticket_id,
        fromStatus: previousStatus,
        toStatus: newStatus,
        timestamp: new Date().toISOString()
      })
      
      const result = await apiService.updateTicket(ticket.ticket_id, { status: newStatus })
      console.log('✅ [STATUS] Backend response:', result)
      
      if ('success' in result && !result.success) {
        const errorMsg = `Failed to update status: ${(result as any).error}`
        console.error('❌ [STATUS] Backend rejected:', errorMsg)
        showErrorToast(errorMsg)
        // Revert on failure
        setCurrentStatus(previousStatus)
        return
      }
      
      console.log('✅ [STATUS] Status updated successfully, updating parent state')
      // Update parent state directly - no refresh needed
      onTicketUpdate?.(ticket.ticket_id, { status: newStatus })
      
    } catch (error) {
      const errorMsg = `Network error updating status: ${error}`
      console.error('❌ [STATUS] Network error:', error)
      showErrorToast(errorMsg)
      // Revert on error
      setCurrentStatus(previousStatus)
    }
  }

  const handleTicketGroupChange = async (newGroup: 'Ops Team' | 'Tech' | 'Litigation' | 'assign group') => {
    if (!ticket || newGroup === 'assign group') return
    
    // Optimistic update - update UI immediately
    const previousGroup = currentTicketGroup
    setCurrentTicketGroup(newGroup as 'Ops Team' | 'Tech' | 'Litigation' | 'assign group')
    setTicketGroupDropdownOpen(false)
    
    // Add smooth animation
    const button = document.querySelector('.group-dropdown-button')
    if (button) {
      button.classList.add('animate-pulse')
      setTimeout(() => button.classList.remove('animate-pulse'), 800)
    }
    
    try {
      console.log('🔄 [GROUP] Updating ticket group:', {
        ticketId: ticket.ticket_id,
        fromGroup: previousGroup,
        toGroup: newGroup,
        timestamp: new Date().toISOString()
      })
      
      const result = await apiService.updateTicket(ticket.ticket_id, { ticket_group: newGroup })
      console.log('✅ [GROUP] Backend response:', result)
      
      if ('success' in result && !result.success) {
        const errorMsg = `Failed to update group: ${(result as any).error}`
        console.error('❌ [GROUP] Backend rejected:', errorMsg)
        showErrorToast(errorMsg)
        // Revert on failure
        setCurrentTicketGroup(previousGroup)
        return
      }
      
      console.log('✅ [GROUP] Group updated successfully, updating parent state')
      // Update parent state directly - no refresh needed
      onTicketUpdate?.(ticket.ticket_id, { ticket_group: newGroup as any })
      
    } catch (error) {
      const errorMsg = `Network error updating group: ${error}`
      console.error('❌ [GROUP] Network error:', error)
      showErrorToast(errorMsg)
      // Revert on error
      setCurrentTicketGroup(previousGroup as 'Ops Team' | 'Tech' | 'Litigation' | 'assign group')
    }
  }

  const handleAssignToggle = async () => {
    if (!ticket) return
    
    const currentUserEmail = user?.email || (typeof window !== 'undefined' ? localStorage.getItem('auth_email') || '' : '')
    const newAssignment = isAssigned ? 'UNASSIGNED' : currentUserEmail
    const newStatus = isAssigned ? 'OPEN' : 'IN_PROGRESS' // Auto-set status based on assignment
    
    // Optimistic update - update UI immediately
    const previousAssigned = isAssigned
    const previousStatus = currentStatus
    
    setIsAssigned(!isAssigned)
    setCurrentStatus(newStatus)
    setStatusDropdownOpen(false)
    setTicketGroupDropdownOpen(false)
    
    // Add smooth animation
    const button = document.querySelector('.assign-toggle-btn')
    if (button) {
      button.classList.add('animate-bounce')
      setTimeout(() => button.classList.remove('animate-bounce'), 600)
    }
    
    try {
      console.log('🔄 [ASSIGN] Toggling assignment:', {
        ticketId: ticket.ticket_id,
        fromAssigned: previousAssigned,
        toAssigned: !isAssigned,
        newAssignment,
        newStatus,
        timestamp: new Date().toISOString()
      })
      
      const result = await apiService.updateTicket(ticket.ticket_id, { 
        assigned_to: newAssignment,
        status: newStatus 
      })
      console.log('✅ [ASSIGN] Backend response:', result)
      
      if ('success' in result && !result.success) {
        const errorMsg = `Failed to update assignment: ${(result as any).error}`
        console.error('❌ [ASSIGN] Backend rejected:', errorMsg)
        showErrorToast(errorMsg)
        // Revert on failure
        setIsAssigned(previousAssigned)
        setCurrentStatus(previousStatus)
        return
      }
      
      console.log('✅ [ASSIGN] Assignment updated successfully, updating parent state')
      // Update parent state directly - no refresh needed
      onTicketUpdate?.(ticket.ticket_id, { 
        assigned_to: newAssignment,
        status: newStatus 
      })
      
    } catch (error) {
      const errorMsg = `Network error updating assignment: ${String(error)}`
      console.error('❌ [ASSIGN] Network error:', error)
      showErrorToast(errorMsg)
      // Revert on error
      setIsAssigned(previousAssigned)
      setCurrentStatus(previousStatus)
    }
  }

  const handleSendMessage = async () => {
    if (!ticket || !messageText.trim() || !isAssigned) return
    
    const messageToSend = messageText.trim()
    const messageId = `pending-${Date.now()}`
    setMessageText('')
    
    console.log('⏳ [MESSAGE] Creating pending message (NOT sending to database yet):', {
      ticketId: ticket.ticket_id,
      messageText: messageToSend,
      pendingId: messageId,
      currentMessageCount: ticket.message_count,
      willSendIn: '5 seconds'
    })
    
    // Create pending message with 5-second timer
    const timer = setTimeout(() => {
      console.log('⏰ [MESSAGE] Timer expired, now sending to database:', messageId)
      // After 5 seconds, actually send the message
      actualSendMessage(messageToSend, messageId)
    }, 5000)
    
    setPendingMessage({
      text: messageToSend,
      id: messageId,
      timer
    })
    
    // Smooth scroll animation for new message
    setTimeout(() => {
      const messageArea = document.querySelector('.messages-container')
      if (messageArea) {
        messageArea.scrollTo({
          top: messageArea.scrollHeight,
          behavior: 'smooth'
        })
      }
    }, 100)
  }

  const handleUndoMessage = () => {
    if (!pendingMessage) return
    
    console.log('↩️ [MESSAGE] Undo clicked - message will NOT be sent to database:', {
      pendingId: pendingMessage.id,
      messageText: pendingMessage.text,
      ticketId: ticket?.ticket_id
    })
    
    // Clear the timer
    if (pendingMessage.timer) {
      clearTimeout(pendingMessage.timer)
    }
    
    // Restore message text to editor
    setMessageText(pendingMessage.text)
    
    // Clear pending message
    setPendingMessage(null)
  }

  const actualSendMessage = async (messageToSend: string, _messageId: string) => {
    if (!ticket) return
    
    setIsSending(true)
    
    try {
      console.log('📤 [MESSAGE] Actually sending message to database:', {
        ticketId: ticket.ticket_id,
        messageLength: messageToSend.length,
        sender: user?.email || 'UNKNOWN_USER',
        currentMessageCount: ticket.message_count,
        timestamp: new Date().toISOString()
      })
      
      const result = await apiService.addMessage(ticket.ticket_id, {
        text: messageToSend,
        created_by_type: 'AGENT',
        created_by_id: user?.email || 'UNKNOWN_USER',
        created_source: 'Internal CRM',
        attachments: []
      })
      
      console.log('📤 [MESSAGE] Backend response:', result)
      
      if ('success' in result && !result.success) {
        const errorMsg = `Failed to send message: ${(result as any).error}`
        console.error('❌ [MESSAGE] Backend rejected:', errorMsg)
        showErrorToast(errorMsg)
        // Restore message text on failure
        setMessageText(messageToSend)
        setPendingMessage(null)
        return
      }
      
      // Successfully sent - clear pending message and refresh
      setPendingMessage(null)
      
      if ('data' in result && result.data) {
        console.log('✅ [MESSAGE] Message sent successfully:', result.data)
        
        // Trigger a full refresh to get the new message from database
        console.log('📊 [MESSAGE] Refreshing ticket data to get new message from database')
        setTimeout(() => {
          onTicketUpdate?.(ticket.ticket_id)
        }, 300)
        
        // Smooth scroll animation
        setTimeout(() => {
          const messageArea = document.querySelector('.messages-container')
          if (messageArea) {
            messageArea.scrollTo({
              top: messageArea.scrollHeight,
              behavior: 'smooth'
            })
          }
        }, 100)
      } else {
        console.error('❌ [MESSAGE] No message data in response')
        showErrorToast('Message sent but no response data received')
        setMessageText(messageToSend)
        setPendingMessage(null)
      }
      
    } catch (error) {
      const errorMsg = `Network error sending message: ${error}`
      console.error('❌ [MESSAGE] Network error:', error)
      showErrorToast(errorMsg)
      // Restore message text on error
      setMessageText(messageToSend)
      setPendingMessage(null)
    } finally {
      setIsSending(false)
    }
  }

  // Error toast function
  const showErrorToast = (message: string) => {
    // Create toast element
    const toast = document.createElement('div')
    toast.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-in'
    toast.textContent = message
    
    // Add to DOM
    document.body.appendChild(toast)
    
    // Remove after 5 seconds
    setTimeout(() => {
      toast.classList.add('animate-out')
      setTimeout(() => {
        if (document.body.contains(toast)) {
          document.body.removeChild(toast)
        }
      }, 300)
    }, 5000)
  }

  const openAttachmentViewer = (attachment: Attachment) => {
    setAttachmentViewer(attachment)
  }

  if (!ticket || !ticket.client) {
    return (
      <div className="flex h-full items-center justify-center text-white/80">
        {!ticket ? 'Select a ticket' : 'Loading ticket details...'}
      </div>
    )
  }

  return (
    <>
      <style>{`
        @keyframes slideInFromBottom {
          0% {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        .message-slide-in {
          animation: slideInFromBottom 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(156, 163, 175, 0.5) transparent;
        }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(156, 163, 175, 0.5);
          border-radius: 3px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: rgba(156, 163, 175, 0.8);
        }
      `}</style>
      <div className="flex h-full flex-col rounded-2xl shadow-lg overflow-hidden">
      <header className="px-3 py-2 border-b border-gray-200 sticky top-0 z-10" style={{ background: 'rgba(255,255,255,0.7)' }}>
        {/* Line 1: Subject only */}
        <div className="mb-1">
          <h1 className="text-sm font-semibold text-gray-900">{ticket.subject}</h1>
        </div>

        {/* Line 2: Name, Email, Phone */}
        <div className="flex items-center text-xs text-gray-600 mb-1">
          <span className="font-medium">
            {ticket.client?.first_name || ''} {ticket.client?.last_name || ''}
          </span>
          <span className="mx-3">•</span>
          <span>{ticket.client?.email || 'No email'}</span>
          {ticket.client?.phone && (
            <>
              <span className="mx-3">•</span>
              <span>{ticket.client.phone}</span>
            </>
          )}
        </div>

        {/* Line 3: Tiny message ID, created source, total message count + Controls */}
        <div className="flex items-center justify-between text-gray-500 overflow-visible" style={{ fontSize: 11 }}>
          <div className="flex items-center gap-3">
            <span>ID: {ticket.ticket_id}</span>
            <span>Source: {ticket.channel}</span>
            <span>Messages: {ticket.message_count || ticket.messages?.length || 0}</span>
          </div>
          
          {/* Controls on the same row, aligned right */}
          <div className="flex items-center flex-nowrap justify-end whitespace-nowrap overflow-visible" style={{ gap: 5 }}>
          {!isAssigned ? (
            // OPEN TICKETS: Show Group Selection + Assign to Me
            <>
              {/* Ticket Group Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setTicketGroupDropdownOpen(!ticketGroupDropdownOpen)}
                  className="group-dropdown-button flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded border border-gray-300 hover:bg-gray-50 transition-all duration-200"
                  style={{ 
                    backgroundColor: currentTicketGroup === 'assign group' ? '#9ca3af' : UI_COLORS.group[currentTicketGroup as 'Ops Team' | 'Tech' | 'Litigation'],
                    color: 'white'
                  }}
                >
                  <span className="font-medium">{currentTicketGroup}</span>
                  <ChevronDownIcon className="w-3 h-3 text-white flex-shrink-0" />
                </button>

                {ticketGroupDropdownOpen && (
                  <div className="absolute top-full right-0 mt-1 border border-gray-200 rounded shadow-lg z-30 dropdown-enter block whitespace-normal" style={{ minWidth: 140, background: 'rgba(255,255,255,0.95)' }}>
                    {(['Ops Team', 'Tech', 'Litigation'] as const).map((group) => (
                      <button
                        key={group}
                        onClick={() => handleTicketGroupChange(group)}
                        className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50 first:rounded-t last:rounded-b transition-colors"
                        style={{ color: '#6b7280' }}
                      >
                        {group}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Assign to Me Button */}
              <button
                onClick={handleAssignToggle}
                className="assign-toggle-btn flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded bg-blue-500 hover:bg-blue-600 text-white transition-all duration-200"
              >
                Assign to me
              </button>
            </>
          ) : (
            // ASSIGNED TICKETS: Show Group + Status Selection + Unassign
            <>
              {/* Group Dropdown for Assigned Tickets */}
              <div className="relative">
                <button
                  onClick={() => setTicketGroupDropdownOpen(!ticketGroupDropdownOpen)}
                  className="group-dropdown-button flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded border border-gray-300 hover:bg-gray-50 transition-all duration-200"
                  style={{ 
                    backgroundColor: currentTicketGroup === 'assign group' ? '#9ca3af' : UI_COLORS.group[currentTicketGroup as 'Ops Team' | 'Tech' | 'Litigation'],
                    color: 'white'
                  }}
                >
                  <span className="font-medium">{currentTicketGroup}</span>
                  <ChevronDownIcon className="w-3 h-3" />
                </button>

                {ticketGroupDropdownOpen && (
                  <div className="absolute top-full right-0 mt-1 border border-gray-200 rounded shadow-lg z-30 dropdown-enter block whitespace-normal" style={{ minWidth: 140, background: 'rgba(255,255,255,0.95)' }}>
                    {(['Ops Team', 'Tech', 'Litigation'] as const).map((group) => (
                      <button
                        key={group}
                        onClick={() => handleTicketGroupChange(group)}
                        className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50 first:rounded-t last:rounded-b transition-colors"
                        style={{ color: '#6b7280' }}
                      >
                        {group}
                      </button>
                    ))}
            </div>
                )}
          </div>
          
              {/* Status Dropdown - IN_PROGRESS, ON_HOLD and RESOLVED */}
          <div className="relative">
            <button
              onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
                  className="status-dropdown-button flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded border border-gray-300 hover:bg-gray-50 transition-all duration-200"
                  style={{ backgroundColor: UI_COLORS.status[currentStatus] }}
            >
                  <span className="text-white font-medium">{currentStatus.replace('_', ' ')}</span>
                  <ChevronDownIcon className="w-3 h-3 text-white flex-shrink-0" />
            </button>
            
            {statusDropdownOpen && (
                  <div className="absolute top-full right-0 mt-1 border border-gray-200 rounded shadow-lg z-30 dropdown-enter block whitespace-normal" style={{ minWidth: 160, background: 'rgba(255,255,255,0.95)' }}>
                    {(['IN_PROGRESS', 'ON_HOLD', 'RESOLVED'] as TicketStatus[]).map((status) => (
                  <button
                    key={status}
                        onClick={() => handleStatusChange(status)}
                        className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50 first:rounded-t last:rounded-b transition-colors"
                        style={{ color: UI_COLORS.status[status] }}
                      >
                        {status.replace('_', ' ')}
                  </button>
                ))}
              </div>
                )}
              </div>

              {/* Unassign Button */}
              <button
                onClick={handleAssignToggle}
                className="assign-toggle-btn flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded bg-red-500 hover:bg-red-600 text-white transition-all duration-200"
              >
                Unassign me
              </button>
            </>
            )}
          </div>
        </div>
      </header>
       
      <div
        className="messages-container flex-1 overflow-y-auto p-3 space-y-4 custom-scrollbar"
        style={{ background: 'transparent' }}
      >
                 {Array.isArray(ticket.messages) && ticket.messages.map((m) => {
          const isAgent = m.created_by_type === 'AGENT'
          return (
            <div 
              key={m.message_id} 
              data-message-id={m.message_id}
              className={`flex w-full ${isAgent ? 'justify-end' : 'justify-start'} message-slide-in`}
              style={{ 
                animation: 'slideInFromBottom 0.3s ease-out',
                transform: 'translateY(0)'
              }}
            >
              <div
                className={
                  'rounded-2xl px-3 py-2 text-xs shadow-soft transform transition-all duration-200 ' +
                  (isAgent ? 'bg-blue-500 text-white' : 'text-gray-900')
                }
                style={{ 
                  maxWidth: '66%',
                  ...(isAgent ? {} : { background: 'rgba(255,255,255,0.6)' })
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    marginBottom: 4,
                    color: isAgent ? 'rgba(255,255,255,0.75)' : 'rgba(107,114,128,0.85)'
                  }}
                >
                  {m.created_by_type === 'AGENT' && (
                    <>
                      {m.created_by_id} • {dayjs(m.created_at).format('MMM D, HH:mm')} • ID: {m.message_id}
                    </>
                  )}
                  {m.created_by_type === 'CLIENT' && (
                    <>
                      {dayjs(m.created_at).format('MMM D, HH:mm')} • ID: {m.message_id}
                    </>
                  )}
                  {m.created_by_type !== 'AGENT' && m.created_by_type !== 'CLIENT' && (
                    <>
                      {m.created_by_type.toLowerCase()} • {dayjs(m.created_at).format('MMM D, HH:mm')} • ID: {m.message_id}
                    </>
                  )}
                </div>
                <div className="whitespace-pre-wrap">{m.text}</div>
                {m.attachments && m.attachments.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {m.attachments.map((a, i) => (
                      <button
                        key={i}
                        onClick={() => openAttachmentViewer(a)}
                        className={'inline-flex items-center gap-2 rounded-full'}
                        style={{
                          background: isAgent ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.10)',
                          color: isAgent ? '#ffffff' : '#1f2937',
                          padding: '4px 12px',
                          fontSize: 12,
                          transition: 'background-color 150ms ease'
                        }}
                        onMouseEnter={(e) => {
                          const target = e.currentTarget as HTMLButtonElement
                          target.style.background = isAgent ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.20)'
                        }}
                        onMouseLeave={(e) => {
                          const target = e.currentTarget as HTMLButtonElement
                          target.style.background = isAgent ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.10)'
                        }}
                      >
                        <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: '#34d399' }} />
                        {a.file_name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )
        })}
        
        {/* Pending message with undo option */}
        {pendingMessage && (
          <PendingMessage 
            message={pendingMessage.text}
            onUndo={handleUndoMessage}
          />
        )}
        {(!ticket.messages || !Array.isArray(ticket.messages) || ticket.messages.length === 0) && (
          <div className="text-center text-gray-500 py-8">
            <div className="text-lg mb-2">📝</div>
            <p>No messages yet</p>
            <p className="text-sm">Start a conversation with this ticket</p>
          </div>
        )}
      </div>

      {/* Message input area - only show if assigned */}
      <div className="p-3 border-t border-gray-200" style={{ background: 'rgba(255,255,255,0.7)' }}>
        {isAssigned ? (
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <textarea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSendMessage()
                  }
                }}
                placeholder="Type a message..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                disabled={isSending}
                rows={1}
                style={{
                  height: '40px'
                }}

              />
            </div>
            <button
              type="button"
              className="text-blue-500 hover:text-blue-600 transition-colors"
              title="Attach file"
              style={{ background: 'none', border: 'none', padding: '8px' }}
            >
              <svg style={{ width: 20, height: 20 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-7.07 7.07a6 6 0 008.485 8.485L20 13" />
              </svg>
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={handleSendMessage}
                disabled={!messageText.trim() || isSending}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  messageText.trim() && !isSending
                    ? 'bg-blue-500 hover:bg-blue-600 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isSending ? 'Sending...' : 'Send'}
              </button>
              <button
                className={`px-4 py-2 text-sm font-medium transition-all duration-200 relative rounded-lg ${
                  assistantOpen
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:from-purple-600 hover:to-indigo-700 shadow-lg hover:shadow-xl transform hover:scale-105'
                }`}
                onClick={onToggleAssistant}
                style={{
                  background: assistantOpen 
                    ? '#4f46e5' 
                    : 'linear-gradient(to right, #8b5cf6, #4f46e5)',
                  border: 'none'
                }}
              >
                <span className="relative z-10">ASK AI</span>
                {!assistantOpen && (
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-indigo-500 rounded-lg blur-sm animate-pulse opacity-30"></div>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500">
            Assign ticket to yourself to reply
          </div>
        )}
      </div>

      {/* Attachment Viewer Modal via portal (prevents clipping and ensures true overlay) */}
      {attachmentViewer && createPortal(
        <div
          style={{
            position: 'fixed',
            inset: 0 as any,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setAttachmentViewer(null) }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: 12,
              width: '100%',
              maxWidth: 960,
              maxHeight: '90vh',
              overflow: 'hidden',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottom: '1px solid #e5e7eb' }}>
              <h3 style={{ fontSize: 16, fontWeight: 600 }}>{attachmentViewer.file_name}</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  onClick={() => {
                    const link = document.createElement('a')
                    link.href = `https://${attachmentViewer.bucket}.s3.amazonaws.com/${attachmentViewer.key}`
                    link.download = attachmentViewer.file_name
                    link.click()
                  }}
                  style={{ padding: '6px 12px', background: '#4f46e5', color: '#fff', borderRadius: 8 }}
                >
                  Download
                </button>
                <button onClick={() => setAttachmentViewer(null)} style={{ color: '#9ca3af', fontSize: 20, padding: '0 8px' }}>×</button>
              </div>
            </div>
            <div style={{ padding: 16, overflow: 'auto', maxHeight: 'calc(90vh - 120px)' }}>
              {attachmentViewer.content_type?.startsWith('image/') ? (
                <img
                  src={`https://${attachmentViewer.bucket}.s3.amazonaws.com/${attachmentViewer.key}`}
                  alt={attachmentViewer.file_name}
                  style={{ maxWidth: '100%', height: 'auto' }}
                />
              ) : attachmentViewer.content_type?.startsWith('application/pdf') ? (
                <iframe
                  src={`https://${attachmentViewer.bucket}.s3.amazonaws.com/${attachmentViewer.key}`}
                  title={attachmentViewer.file_name}
                  style={{ width: '100%', height: 480 }}
                />
              ) : (
                <div style={{ textAlign: 'center', padding: '32px 0' }}>
                  <div style={{ color: '#6b7280', marginBottom: 16 }}>Preview not available for this file type</div>
                  <button
                    onClick={() => {
                      const link = document.createElement('a')
                      link.href = `https://${attachmentViewer.bucket}.s3.amazonaws.com/${attachmentViewer.key}`
                      link.download = attachmentViewer.file_name
                      link.click()
                    }}
                    style={{ padding: '8px 16px', background: '#4f46e5', color: '#fff', borderRadius: 8 }}
                  >
                    Download {attachmentViewer.file_name}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
    </>
  )
}




