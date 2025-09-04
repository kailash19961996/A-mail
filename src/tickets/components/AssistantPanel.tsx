import { ChatBubbleLeftRightIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { useState, useEffect, useRef } from 'react'
import dayjs from 'dayjs'
import type { Ticket } from '../types/ticket'
import { API_CONFIG } from '../config/api'
import './AssistantPanel.css'

type Props = {
  open: boolean
  onToggle: () => void
  ticket?: Ticket
}

type ChatMessage = {
  id: string
  sender: 'user' | 'assistant'
  message: string
  timestamp: number
}

export function AssistantPanel({ open, onToggle, ticket }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'assistant',
      message: "Hi! I'm here to help you handle this ticket. I can suggest responses, analyze the conversation, or help with next steps. What would you like assistance with?",
      timestamp: Date.now() - 60000
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isThinking, setIsThinking] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
  const [showQuickActions, setShowQuickActions] = useState(true)
  const [contextSent, setContextSent] = useState(false)
  const [totalCost, setTotalCost] = useState<number>(0)
  const [sessionTicket, setSessionTicket] = useState<Ticket | undefined>(undefined)
  const [showStars, setShowStars] = useState(false)
  const sessionRef = useRef<string>('')

  // Auto-scroll when messages change
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Trigger star animation when cost changes
  useEffect(() => {
    if (totalCost > 0) {
      setShowStars(true)
      const timer = setTimeout(() => setShowStars(false), 1500) // Hide stars after animation
      return () => clearTimeout(timer)
    }
  }, [totalCost])

  // Session management: create session on open, reset on close
  useEffect(() => {
    if (open) {
      console.log('🤖 [AI Assistant] Panel opened, creating new session')
      sessionRef.current = crypto.randomUUID()
      setContextSent(false) // Reset context flag for new session
      // Only show quick actions if this is truly a fresh start (messages only contain initial greeting)
      setShowQuickActions(messages.length <= 1)
      // Lock the ticket context for this session
      if (!sessionTicket && ticket) {
        setSessionTicket(ticket)
      }
    } else {
      // Reset session on close
      if (sessionRef.current) {
        console.log('🤖 [AI Assistant] Panel closed, resetting session:', sessionRef.current)
        fetch(`${API_CONFIG.BASE_URL}/ai/reset`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ session_id: sessionRef.current })
        }).catch((err) => {
          console.warn('🤖 [AI Assistant] Failed to reset session:', err)
        })
      }
      sessionRef.current = ''
      setContextSent(false)
      setSessionTicket(undefined)
      setTotalCost(0) // Reset cost when session closes
      // Reset messages to initial state when panel closes
      setMessages([
        {
          id: '1',
          sender: 'assistant',
          message: "Hi! I'm here to help you handle this ticket. I can suggest responses, analyze the conversation, or help with next steps. What would you like assistance with?",
          timestamp: Date.now() - 60000
        }
      ])
      setShowQuickActions(true) // Will be shown next time panel opens
    }
  }, [open, messages.length])

  // Helper function to format comprehensive ticket context for AI
  const getTicketContext = () => {
    const t = sessionTicket || ticket
    if (!t) {
      return 'No ticket information available.'
    }

    // Build comprehensive ticket context
    let context = `TICKET INFORMATION:
- Ticket ID: ${t.ticket_id}
- Subject: ${t.subject}
- Client: ${t.client?.first_name} ${t.client?.last_name} (${t.client?.email})
- Source: ${t.channel}
- Group: ${t.ticket_group}
- Status: ${t.status}
- Priority: ${t.priority}
- Category: ${t.category}
- Currently Assigned To: ${t.assigned_to}
- Created: ${dayjs(t.created_at).format('MMM D, YYYY HH:mm')}
- Last Updated: ${dayjs(t.last_updated_at).format('MMM D, YYYY HH:mm')}
- Total Messages: ${t.message_count || 0}
`

    // Add conversation history if available
    if (t.messages && t.messages.length > 0) {
      const sortedMessages = t.messages
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      
      // Cap at last 20 messages to avoid token limits
      const recentMessages = sortedMessages.slice(-20)
      
      // Get unique agents who have handled this case
      const agentsInvolved = new Set<string>()
      recentMessages.forEach(msg => {
        if (msg.created_by_type === 'AGENT') {
          agentsInvolved.add(msg.created_by_id)
        }
      })
      
      context += `\nCASE HANDLERS:\n`
      if (agentsInvolved.size > 0) {
        context += `Agents involved: ${Array.from(agentsInvolved).join(', ')}\n`
      } else {
        context += `No agent responses yet.\n`
      }
      
      context += `\nCONVERSATION HISTORY (Last ${recentMessages.length} messages):\n`
      
      recentMessages.forEach((msg) => {
        if (msg.created_by_type === 'CLIENT') {
          context += `Client: ${msg.text}\n`
        } else if (msg.created_by_type === 'AGENT') {
          context += `Agent ${msg.created_by_id}: ${msg.text}\n`
        } else {
          context += `System: ${msg.text}\n`
        }
        
        // Add attachment info if present
        if (msg.attachments && msg.attachments.length > 0) {
          context += `[${msg.attachments.length} attachment(s) included]\n`
        }
      })
      
      if (sortedMessages.length > 20) {
        context += `\n[Note: Showing last 20 of ${sortedMessages.length} total messages]\n`
      }
    } else {
      context += `\nCONVERSATION HISTORY:\nNo messages yet in this ticket.`
    }

    return context
  }

  // Render AI message with proper HTML structure like ChatBot.jsx
  const renderBoldSegments = (text: string) => {
    const parts = text.split(/\*\*(.*?)\*\*/g);
    return parts.map((part, idx) => (
      idx % 2 === 1 ? <strong key={idx}>{part}</strong> : <span key={idx}>{part}</span>
    ));
  };

  const renderBotMessage = (text: string) => {
    if (!text || text.trim() === '') return null;
    
    // Normalize email-style messages: add spacing around common sections
    const normalizeEmailFormatting = (raw: string): string => {
      let t = raw;
      // Ensure Subject appears on its own line
      t = t.replace(/\s*Subject\s*:/i, "\nSubject: ");
      // Insert a line break before hyphen-separated key-value labels e.g. " - Status:"
      t = t.replace(/\s+-\s+([A-Z][A-Za-z ]{1,40}):/g, "\n$1:");
      // Space before salutations and sign-offs
      t = t.replace(/\s+(Dear\s+[^\n]+)/i, "\n\n$1");
      t = t.replace(/\s+(Hi\s+[^\n]+)/i, "\n\n$1");
      t = t.replace(/\s+(Best regards,|Regards,|Sincerely,)/gi, "\n\n$1");
      // Space before common paragraph starters
      t = t.replace(/\s+(In the meantime,|If you have any|Thank you for your patience|Our team|Agent\s+[\w@.]+)/gi, "\n\n$1");
      // Collapse excessive spaces
      t = t.replace(/[ \t]{2,}/g, ' ');
      return t;
    };

    const textNormalized = normalizeEmailFormatting(text);
    
    // Detect a numbered list starting with "1. " and split into items
    const listStartIndex = textNormalized.search(/\b1\.\s/);
    if (listStartIndex >= 0) {
      const intro = textNormalized.slice(0, listStartIndex).trim();
      let listText = textNormalized.slice(listStartIndex).trim();
      
      // Find the last numbered item and separate everything after it
      const lastNumberMatch = listText.match(/(\d+\.\s[^]*?)(\n\n|\r\n\r\n|$)/);
      let listOnly = listText;
      let conclusion = '';
      
      if (lastNumberMatch && lastNumberMatch.index !== undefined) {
        const afterLastNumber = listText.slice(lastNumberMatch.index + lastNumberMatch[1].length).trim();
        if (afterLastNumber && !afterLastNumber.match(/^\d+\./)) {
          conclusion = afterLastNumber;
          listOnly = listText.slice(0, lastNumberMatch.index + lastNumberMatch[1].length).trim();
        }
      }

      // Remove orphan trailing numbering like "4." with no content
      listOnly = listOnly.replace(/\s*\d+\.\s*$/, '');

      const items = listOnly
        .split(/\s(?=\d+\.\s)/g)
        .map((s) => s.replace(/^\d+\.\s*/, '').trim())
        .filter(Boolean);

      return (
        <div className="message-content">
          {intro && <p>{renderBoldSegments(intro)}</p>}
          <ol>
            {items.map((item, idx) => (
              <li key={idx}>{renderBoldSegments(item)}</li>
            ))}
          </ol>
          {conclusion && <p>{renderBoldSegments(conclusion)}</p>}
        </div>
      );
    }

    // Handle key-value blocks (Label: Value) if there are several lines like that
    const linesForKV = textNormalized.split(/\n/);
    const kvPairs: Array<{ key: string; value: string }> = [];
    const remaining: string[] = [];
    for (const ln of linesForKV) {
      const m = ln.match(/^\s*([A-Za-z][A-Za-z ]{1,40}):\s*(.+)$/);
      if (m && !/^(Conversation History|Case Handlers)/i.test(m[1])) {
        kvPairs.push({ key: m[1].trim(), value: m[2].trim() });
      } else {
        remaining.push(ln);
      }
    }

    if (kvPairs.length >= 3) {
      // Render as neat key-value list plus whatever remaining paragraphs exist
      const remText = remaining.join('\n').trim();
      return (
        <div className="message-content">
          {remText && <p>{renderBoldSegments(remText.split(/\n{2,}/)[0])}</p>}
          <ul className="kv-list">
            {kvPairs.map((p, i) => (
              <li key={i}><strong>{p.key}:</strong> {renderBoldSegments(p.value)}</li>
            ))}
          </ul>
          {remText && remText.split(/\n{2,}/).slice(1).map((para, idx) => (
            <p key={`kvp-${idx}`}>{renderBoldSegments(para)}</p>
          ))}
        </div>
      );
    }

    // Handle bullet points
    if (textNormalized.includes('•') || textNormalized.includes('- ')) {
      const lines = textNormalized.split('\n');
      let currentParagraph = '';
      const elements = [];
      let listItems = [];
      
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('•') || trimmed.startsWith('- ')) {
          // If we have a current paragraph, add it
          if (currentParagraph) {
            elements.push(<p key={elements.length}>{renderBoldSegments(currentParagraph)}</p>);
            currentParagraph = '';
          }
          // Add to list items
          listItems.push(trimmed.replace(/^[•-]\s*/, ''));
        } else if (trimmed === '' && listItems.length > 0) {
          // End of list
          elements.push(
            <ul key={elements.length}>
              {listItems.map((item, idx) => (
                <li key={idx}>{renderBoldSegments(item)}</li>
              ))}
            </ul>
          );
          listItems = [];
        } else {
          // Regular paragraph content
          currentParagraph += (currentParagraph ? ' ' : '') + trimmed;
        }
      }
      
      // Add remaining content
      if (listItems.length > 0) {
        elements.push(
          <ul key={elements.length}>
            {listItems.map((item, idx) => (
              <li key={idx}>{renderBoldSegments(item)}</li>
            ))}
          </ul>
        );
      }
      if (currentParagraph) {
        elements.push(<p key={elements.length}>{renderBoldSegments(currentParagraph)}</p>);
      }
      
      return <div className="message-content">{elements}</div>;
    }

    // Fallback: preserve line breaks as paragraphs
    return (
      <div className="message-content">
        {textNormalized.split(/\n{2,}|\r\n{2,}/).map((para, idx) => (
          <p key={idx}>{renderBoldSegments(para)}</p>
        ))}
      </div>
    );
  };

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    const messagesContainer = document.querySelector('.chatbot-messages')
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight
    }
  }

  // Simulate streaming by revealing text character by character
  const simulateStreaming = async (text: string, messageId: string) => {
    const words = text.split(' ')
    let currentText = ''
    
    setIsStreaming(true)
    console.log('🤖 [AI Assistant] Starting to stream response:', { messageId, totalWords: words.length })
    
    for (let i = 0; i < words.length; i++) {
      currentText += (i > 0 ? ' ' : '') + words[i]
      
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, message: currentText }
          : msg
      ))
      
      // Auto-scroll during streaming
      setTimeout(scrollToBottom, 10)
      
      // Vary speed: faster for short words, slower for punctuation
      const delay = words[i].includes('.') || words[i].includes('!') || words[i].includes('?') 
        ? 100 : Math.random() * 50 + 30
      
      await new Promise(resolve => setTimeout(resolve, delay))
    }
    
    setIsStreaming(false)
    console.log('🤖 [AI Assistant] Finished streaming response')
  }

  const callAI = async (message: string) => {
    try {
      console.log('🤖 [AI Assistant] Making API call:', { 
        sessionId: sessionRef.current, 
        message: message.substring(0, 50) + '...', 
        contextSent,
        willSendContext: !contextSent 
      })

      const payload: any = {
        session_id: sessionRef.current || (sessionRef.current = crypto.randomUUID()),
        message
      }

      // Include ticket context only for first message (when contextSent is false)
      if (!contextSent) {
        // System message to keep answers concise, relevant, and to redirect irrelevant prompts
        const systemInstruction = `\nSYSTEM RULES:\n- Keep replies concise by default; expand only when asked.\n- Stay strictly relevant to the ticket context.\n- If a user asks for something unrelated to this ticket, politely redirect and ask to focus on ticket-related actions.\n- When listing actions, prefer short bullet points over long paragraphs.\n`
        payload.context = getTicketContext() + "\n\n" + systemInstruction
        setContextSent(true)
        console.log('🤖 [AI Assistant] Including ticket context in request')
      } else {
        console.log('🤖 [AI Assistant] Using session memory, no context needed')
      }

      const response = await fetch(`${API_CONFIG.BASE_URL}/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await response.json()
      console.log('🤖 [AI Assistant] API response:', { 
        success: data.success, 
        replyLength: data.data?.reply?.length || 0 
      })

      if (!response.ok || data.success === false) {
        const errMsg = data?.error || `Request failed with status ${response.status}`
        throw new Error(errMsg)
      }

      // update running cost if provided
      if (data?.data?.cost_usd) {
        setTotalCost((prev) => +(prev + Number(data.data.cost_usd)).toFixed(4))
      }
      return data.data.reply as string
    } catch (err: any) {
      console.error('🤖 [AI Assistant] API call failed:', err)
      throw new Error(err?.message || 'Unexpected error contacting AI service')
    }
  }

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    console.log('🤖 [AI Assistant] User sending message:', inputMessage.substring(0, 100))
    
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      message: inputMessage,
      timestamp: Date.now()
    }
    
    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)
    setShowQuickActions(false) // Hide quick actions after first message
    
    // Create placeholder assistant message for streaming
    const assistantMessageId = (Date.now() + 1).toString()
      const assistantMessage: ChatMessage = {
      id: assistantMessageId,
        sender: 'assistant',
      message: '',
        timestamp: Date.now()
      }

    try {
      // Show thinking indicator
      setIsThinking(true)
      console.log('🤖 [AI Assistant] Showing thinking indicator')
      
      // Add empty assistant message for streaming
      setMessages(prev => [...prev, assistantMessage])
      
      const reply = await callAI(userMessage.message)
      
      // Hide thinking, start streaming
      setIsThinking(false)
      await simulateStreaming(reply, assistantMessageId)
      
    } catch (e: any) {
      console.error('🤖 [AI Assistant] Error occurred:', e)
      setIsThinking(false)
      setIsStreaming(false)
      
      // Update the assistant message with error
      setMessages(prev => prev.map(msg => 
        msg.id === assistantMessageId 
          ? { ...msg, message: `Error: ${e.message}` }
          : msg
      ))
    } finally {
      setIsLoading(false)
      console.log('🤖 [AI Assistant] Message processing complete')
    }
  }

  const suggestions = [
    'Draft a response acknowledging the issue',
    'Suggest troubleshooting steps',
    'Request additional information',
    'Escalate to technical team',
    'Close ticket with resolution'
  ]

  if (!open) return null

  return (
    <div className="w-[25%] min-w-[320px] h-full flex flex-col rounded-2xl shadow-lg overflow-hidden" style={{ 
      background: 'rgba(255,255,255,0.7)', 
      backdropFilter: 'blur(10px)', 
      WebkitBackdropFilter: 'blur(10px)' 
    }}>
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 bg-white rounded-2xl rounded-b-none">
        <div className="flex flex-col">
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
          <ChatBubbleLeftRightIcon className="w-5 h-5 text-blue-500" />
          AI Assistant
        </div>
          <div className="text-[8px] text-gray-400 mt-1 opacity-60 leading-tight" style={{ fontSize: '9px', lineHeight: '10px' }}>
            {sessionTicket?.client?.first_name && sessionTicket?.client?.last_name ? (
              <>
                <div>Working on {sessionTicket.client.first_name} {sessionTicket.client.last_name}'s case</div>
                <div>ID: {sessionTicket.ticket_id}</div>
              </>
            ) : (
              <>
                <div>Working on current ticket</div>
                {sessionTicket?.ticket_id && <div>ID: {sessionTicket.ticket_id}</div>}
              </>
            )}
            <div className="relative mt-2">
              <span className="text-[6px] text-gray-400 opacity-60" style={{ fontSize: '10px', lineHeight: '8px' }}>Session cost: ${totalCost.toFixed(4)}</span>
              {/* Animated stars that appear when cost changes */}
              {showStars && (
                <div className="cost-stars absolute -top-4 left-1/2 transform -translate-x-1/2 pointer-events-none">
                  <div className="star star-1">✦</div>
                  <div className="star star-2">✦</div>
                  <div className="star star-3">✦</div>
                  <div className="star star-4">✦</div>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end">
        <button 
            className="rounded-lg bg-gray-100 p-1.5 text-red-500 hover:bg-red-50 hover:text-red-600 hover:scale-110 transition-all duration-200" 
          onClick={onToggle}
        >
          <XMarkIcon className="w-4 h-4" />
        </button>
        </div>
      </div>
      
      <div className="chatbot-messages flex-1 overflow-y-auto p-3 space-y-4 custom-scrollbar bg-transparent min-h-0">
        {messages.map((msg) => {
          // Skip rendering placeholder assistant items with no text to avoid empty bubbles
          if (msg.sender === 'assistant' && msg.message.trim().length === 0) {
            return null
          }
          return (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={
                'rounded-2xl px-3 py-2 text-xs shadow-soft transform transition-all duration-200 ' +
                (msg.sender === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-900')
              }
              style={{ maxWidth: '66%' }}
            >
              {msg.sender === 'assistant' && msg.message.trim().length > 0 ? (
                renderBotMessage(msg.message) || <div className="message-content">{msg.message}</div>
              ) : (
                msg.sender === 'user' ? <div className="whitespace-pre-wrap">{msg.message}</div> : null
              )}
              {/* Streaming indicator */}
              {msg.sender === 'assistant' && isStreaming && msg.id === messages[messages.length - 1]?.id && (
                <div className="inline-block w-2 h-2 bg-blue-400 rounded-full animate-pulse ml-1"></div>
              )}
            </div>
          </div>
          )
        })}
        
        {/* Thinking indicator */}
        {isThinking && (
          <div className="flex justify-start">
            <div className="rounded-2xl px-3 py-2 text-xs shadow-soft bg-white text-gray-900" style={{ maxWidth: '66%' }}>
              <div className="thinking-orbit">
                <div className="orbit-ring">
                  <div className="orbit-planet p1"></div>
                  <div className="orbit-planet p2"></div>
                  <div className="orbit-planet p3"></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Quick Actions - only show initially */}
      {showQuickActions && (
      <div className="p-4 space-y-3 flex-shrink-0">
        <div className="text-sm font-medium text-gray-700 mb-2">Quick Actions:</div>
        <div className="grid grid-cols-1 gap-2">
          {suggestions.map((suggestion, idx) => (
            <button
              key={idx}
                onClick={() => {
                  console.log('🤖 [AI Assistant] Quick action selected:', suggestion)
                  setInputMessage(suggestion)
                }}
              className="text-left text-sm p-2 rounded-lg bg-white/60 hover:bg-white/80 text-gray-700 transition-colors border border-gray-200"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
      )}
      
      {/* Message input area - matching main conversation footer */}
      <div className="p-3 border-t border-gray-200 bg-white flex-shrink-0">
        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  sendMessage()
                }
              }}
              placeholder="Ask the assistant..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              rows={1}
              style={{
                height: '40px'
              }}
            />
          </div>
          <button
            onClick={sendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              inputMessage.trim() && !isLoading
                ? 'bg-blue-500 hover:bg-blue-600 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isLoading ? 'Sending...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  )
}


