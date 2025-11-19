'use client'

import { useEffect, useState } from 'react'

interface SpotifyStatus {
    track: string
    artist: string
    isPlaying: boolean
    imageUrl?: string
    timestamp?: number
    duration?: number // ms
    position?: number // seconds
}

export default function SpotifyPlaying() {
    const [status, setStatus] = useState<SpotifyStatus | null>(null)
    const [loading, setLoading] = useState(true)
    const [progress, setProgress] = useState(0)

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const res = await fetch('/api/spotify/current')
                if (res.ok) {
                    const data = await res.json()
                    setStatus(data)
                    if (data.position && data.duration) {
                        // duration is usually ms, position is seconds
                        // Check if duration is suspiciously small (seconds) or large (ms)
                        // Spotify AppleScript duration is usually ms.
                        const durationSec = data.duration > 10000 ? data.duration / 1000 : data.duration
                        setProgress((data.position / durationSec) * 100)
                    }
                }
            } catch (e) {
                console.error(e)
            } finally {
                setLoading(false)
            }
        }

        fetchStatus()
        const interval = setInterval(fetchStatus, 5000) // Poll faster
        return () => clearInterval(interval)
    }, [])

    // Interpolate progress locally between polls
    useEffect(() => {
        if (!status?.isPlaying || !status.duration) return

        const durationSec = status.duration > 10000 ? status.duration / 1000 : status.duration
        const interval = setInterval(() => {
            setProgress(p => {
                const newP = p + (1 / durationSec) * 100 * 0.1 // 100ms update
                return newP > 100 ? 100 : newP
            })
        }, 100)
        return () => clearInterval(interval)
    }, [status])

    if (loading || !status || !status.isPlaying) return null

    return (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 rounded-2xl border border-neutral-200 bg-white/80 p-3 shadow-lg backdrop-blur-md transition-all dark:border-neutral-800 dark:bg-neutral-900/80 w-64">
            <div className="flex items-center gap-3">
                {status.imageUrl ? (
                    <img
                        src={status.imageUrl}
                        alt={status.track}
                        className="h-10 w-10 animate-[spin_10s_linear_infinite] rounded-full object-cover"
                    />
                ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg>
                    </div>
                )}
                <div className="flex flex-col overflow-hidden">
                    <span className="text-[10px] font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                        Now Listening
                    </span>
                    <a
                        href={`https://open.spotify.com/search/${encodeURIComponent(status.track + ' ' + status.artist)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="truncate text-sm font-semibold text-neutral-900 hover:underline dark:text-neutral-100"
                    >
                        {status.track}
                    </a>
                    <span className="truncate text-xs text-neutral-600 dark:text-neutral-400">
                        {status.artist}
                    </span>
                </div>
                <div className="absolute -top-1 -right-1 h-3 w-3">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex h-3 w-3 rounded-full bg-green-500"></span>
                </div>
            </div>
            {/* Progress Bar */}
            <div className="h-1 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700">
                <div
                    className="h-full bg-green-500 transition-all duration-100 ease-linear"
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>
    )
}
