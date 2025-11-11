"use client"

import Image from 'next/image'
import { useEffect, useMemo, useRef, useState } from 'react'

export type RotatorImage = {
  src: string
  alt: string
}

type ImageRotatorProps = {
  images: RotatorImage[]
  intervalMs?: number
  width?: number
  height?: number
  className?: string
}

export default function ImageRotator({
  images,
  intervalMs = 5000,
  width = 1500,
  height = 500,
  className,
}: ImageRotatorProps) {
  const validImages = useMemo(() => images.filter(Boolean), [images])
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    if (validImages.length <= 1) return
    if (paused) return

    timerRef.current && window.clearTimeout(timerRef.current)

    timerRef.current = window.setTimeout(() => {
      setIndex((i) => (i + 1) % validImages.length)
    }, intervalMs)

    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current)
      }
    }
  }, [index, paused, intervalMs, validImages.length])

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        setIndex((i) => (i + 1) % validImages.length)
      } else if (e.key === 'ArrowLeft') {
        setIndex((i) => (i - 1 + validImages.length) % validImages.length)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [validImages.length])

  if (!validImages.length) return null

  return (
    <div
      className={
        `relative w-full overflow-hidden rounded-md border border-neutral-200 dark:border-neutral-800 ${
          className ? className : ''
        }`
      }
      style={{ aspectRatio: `${width} / ${height}` }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label="Image Rotator"
    >
      {/* Slides */}
      {validImages.map((img, i) => (
        <div
          key={img.src + i}
          className={`absolute inset-0 transition-opacity duration-700 ${
            i === index ? 'opacity-100' : 'opacity-0'
          }`}
          aria-hidden={i !== index}
        >
          <Image
            src={img.src}
            alt={img.alt}
            fill
            sizes="100vw"
            priority={i === 0}
            className="object-cover"
          />
        </div>
      ))}

      {/* Controls */}
      {validImages.length > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous slide"
            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 text-white p-2 hover:bg-black/60 focus:outline-none focus:ring-2 focus:ring-white/80"
            onClick={() =>
              setIndex((i) => (i - 1 + validImages.length) % validImages.length)
            }
          >
            {/* Left arrow */}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button
            type="button"
            aria-label="Next slide"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 text-white p-2 hover:bg-black/60 focus:outline-none focus:ring-2 focus:ring-white/80"
            onClick={() => setIndex((i) => (i + 1) % validImages.length)}
          >
            {/* Right arrow */}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>

          {/* Dots */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2">
            {validImages.map((_, i) => (
              <button
                key={`dot-${i}`}
                aria-label={`Go to slide ${i + 1}`}
                className={`h-2.5 w-2.5 rounded-full transition-colors ${
                  i === index ? 'bg-white' : 'bg-white/50 hover:bg-white/80'
                }`}
                onClick={() => setIndex(i)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
