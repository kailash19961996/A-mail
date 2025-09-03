import { Fragment } from 'react'
import classNames from 'classnames'

export type StatusKey = 'OPEN' | 'IN_PROGRESS' | 'ON_HOLD' | 'RESOLVED'

type Props = {
  counts: Record<StatusKey, number>
  active: StatusKey
  onChange: (s: StatusKey) => void
}

const keys: StatusKey[] = ['OPEN', 'IN_PROGRESS', 'ON_HOLD', 'RESOLVED']

const statusLabels: Record<StatusKey, string> = {
  'OPEN': 'Open',
  'IN_PROGRESS': 'In Progress',
  'ON_HOLD': 'On Hold',
  'RESOLVED': 'Resolved'
}

export function StatusTabs({ counts, active, onChange }: Props) {
  return (
    <div className="horizontal-scroll py-2">
      <div className="flex items-center gap-2 px-2">
        {keys.map((k) => (
          <Fragment key={k}>
            <button
              className={classNames(
                'flex items-center gap-2 rounded-full px-4 py-1.5 text-xs transition-all whitespace-nowrap flex-shrink-0',
                'bg-white shadow-sm hover:shadow-md border',
                active === k ? 'ring-1 ring-indigo-300 bg-indigo-50 border-indigo-200' : 'border-gray-200'
              )}
              onClick={() => onChange(k)}
            >
              <span className="font-medium">{statusLabels[k]}</span>
              <span className="inline-flex min-w-6 justify-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-bold">
                {counts[k] ?? 0}
              </span>
            </button>
          </Fragment>
        ))}
      </div>
    </div>
  )
}


