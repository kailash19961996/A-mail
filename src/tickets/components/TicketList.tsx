import dayjs from 'dayjs'
import classNames from 'classnames'
import type { Ticket } from '../types/ticket'
import { fullName } from '../types/ticket'

type Props = {
  tickets: Ticket[]
  activeTicketId?: string
  onSelect: (id: string) => void
}

export function TicketList({ tickets, activeTicketId, onSelect }: Props) {
  return (
    <div className="flex-1 overflow-hidden rounded-2xl shadow-lg min-h-0" style={{ background: 'rgba(255,255,255,0.7)' }}>
      {/* Scroll within the list area only */}
      <div className="h-full overflow-y-auto custom-scrollbar">
        {tickets
          .sort((a, b) => new Date(b.last_message_at || b.last_updated_at).getTime() - new Date(a.last_message_at || a.last_updated_at).getTime())
          .map((t) => {
            const lastMessage = t.messages?.[t.messages.length - 1]
            const lastDate = t.last_message_at || t.last_updated_at
            const dt = dayjs(lastDate).format('MMM D')
            
            // Determine if entire ticket entry should be red (when action is on agent)
            const shouldShowRedText = ['IN_PROGRESS', 'ON_HOLD', 'RESOLVED'].includes(t.status) && t.next_action === 'AGENT'
            
            return (
              <button
                key={t.ticket_id}
                data-ticket-id={t.ticket_id}
                onClick={() => onSelect(t.ticket_id)}
                className={classNames('w-full text-left px-3 py-3 transition-all duration-200 rounded-xl')}
                style={{
                  background: activeTicketId === t.ticket_id ? '#eef2ff' : 'rgba(255,255,255,0.85)',
                  borderRight: activeTicketId === t.ticket_id ? '2px solid #6366f1' : '2px solid transparent'
                }}
              >
                <div className="flex items-center justify-between mb-0.5">
                  <div className={classNames(
                    "text-sm font-medium",
                    shouldShowRedText ? "text-red-600" : "text-gray-900"
                  )}>
                    {fullName(t)}
                  </div>
                  <div className="text-[11px] text-gray-500">{dt}</div>
                </div>
                <div className={classNames(
                  "text-[13px] font-medium mb-0.5",
                  shouldShowRedText ? "text-red-600" : "text-gray-700"
                )}>
                  {t.subject}
                </div>
                <div className="text-[11px] text-gray-500 line-clamp-1">
                  {lastMessage?.text || 'No messages yet'}
                </div>
              </button>
            )
          })}
      </div>
    </div>
  )
}


