import { ChatBubbleLeftRightIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { useState } from 'react'
import dayjs from 'dayjs'

type Props = {
  open: boolean
  onToggle: () => void
}

type ChatMessage = {
  id: string
  sender: 'user' | 'assistant'
  message: string
  timestamp: number
}

export function AssistantPanel({ open, onToggle }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'assistant',
      message: "Hi! I'm here to help you handle this ticket. I can suggest responses, analyze the conversation, or help with next steps. What would you like assistance with?",
      timestamp: Date.now() - 60000
    }
  ])
  const [inputMessage, setInputMessage] = useState('')

  const sendMessage = () => {
    if (!inputMessage.trim()) return
    
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      message: inputMessage,
      timestamp: Date.now()
    }
    
    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    
    // Simulate assistant response
    setTimeout(() => {
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        message: "I understand. Let me help you craft a response. Based on the conversation, I suggest acknowledging the issue and asking for more specific details about when the problem occurs.",
        timestamp: Date.now()
      }
      setMessages(prev => [...prev, assistantMessage])
    }, 1000)
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
    <div className="w-[25%] min-w-[320px] h-full flex flex-col rounded-2xl shadow-lg overflow-hidden" style={{ background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }}>
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 bg-white rounded-2xl rounded-b-none">
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
          <ChatBubbleLeftRightIcon className="w-5 h-5 text-blue-500" />
          AI Assistant
        </div>
        <button 
          className="rounded-lg bg-gray-100 p-1.5 text-gray-600 hover:bg-gray-200 transition-colors" 
          onClick={onToggle}
        >
          <XMarkIcon className="w-4 h-4" />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-3 space-y-4 custom-scrollbar bg-transparent min-h-0">
        {messages.map((msg) => (
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
              <div className={`text-[11px] opacity-60 mb-1 ${msg.sender === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                {dayjs(msg.timestamp).format('HH:mm')}
              </div>
              <div className="whitespace-pre-wrap">{msg.message}</div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="p-4 space-y-3 flex-shrink-0">
        <div className="text-sm font-medium text-gray-700 mb-2">Quick Actions:</div>
        <div className="grid grid-cols-1 gap-2">
          {suggestions.map((suggestion, idx) => (
            <button
              key={idx}
              onClick={() => setInputMessage(suggestion)}
              className="text-left text-sm p-2 rounded-lg bg-white/60 hover:bg-white/80 text-gray-700 transition-colors border border-gray-200"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
      
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
            disabled={!inputMessage.trim()}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              inputMessage.trim()
                ? 'bg-blue-500 hover:bg-blue-600 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
}


