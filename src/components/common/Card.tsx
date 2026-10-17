import type { ReactNode } from 'react'

interface CardProps {
  title?: string
  description?: string
  children: ReactNode
  className?: string
}

export default function Card({ title, description, children, className = '' }: CardProps) {
  return (
    <section className={`rounded-lg border border-gray-200 bg-white ${className}`}>
      {(title || description) && (
        <header className="border-b border-gray-100 px-5 py-4">
          {title && <h3 className="text-base font-semibold text-gray-900">{title}</h3>}
          {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
        </header>
      )}
      <div className="px-5 py-4">{children}</div>
    </section>
  )
}
