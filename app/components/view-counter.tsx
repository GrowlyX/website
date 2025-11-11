"use client"
import { useEffect, useState } from 'react'

export default function ViewCounter({ id, className }: { id: string; className?: string }) {
  const [count, setCount] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let aborted = false

    async function incrementAndFetch() {
      try {
        // Increment
        await fetch(`/api/views`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ id }),
          cache: 'no-store',
        })
        // Fetch latest
        const res = await fetch(`/api/views?id=${encodeURIComponent(id)}`, { cache: 'no-store' })
        if (!res.ok) throw new Error('Failed to fetch view count')
        const data = (await res.json()) as { id: string; count: number }
        if (!aborted) setCount(data.count)
      } catch (e) {
        if (!aborted) setError('—')
      }
    }

    incrementAndFetch()
    return () => {
      aborted = true
    }
  }, [id])

  if (error) return <span className={className}>Views {error}</span>

  return <span className={className}>This page has been viewed {count ?? '—'} times</span>
}
