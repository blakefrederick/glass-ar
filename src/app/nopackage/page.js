"use client"

import { useRef, useState, useEffect } from "react"

const glassLevels = [
  { blur: 2, brightness: 1.1, saturation: 1.2, border: "rgba(255,255,255,0.18)", shadow: "0 4px 32px 0 rgba(0,0,0,0.10)" },
  { blur: 6, brightness: 1.2, saturation: 1.4, border: "rgba(255,255,255,0.22)", shadow: "0 8px 32px 0 rgba(0,0,0,0.13)" },
  { blur: 12, brightness: 1.3, saturation: 1.6, border: "rgba(255,255,255,0.28)", shadow: "0 12px 32px 0 rgba(0,0,0,0.16)" },
  { blur: 0, brightness: 1.0, saturation: 1.0, border: "rgba(255,255,255,0.10)", shadow: "0 2px 16px 0 rgba(0,0,0,0.08)" },
]

export default function NoPackageGlass() {
  const [level, setLevel] = useState(0)
  const [modalPos, setModalPos] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [allowed, setAllowed] = useState(false)
  const videoRef = useRef(null)
  const containerRef = useRef(null)

  const handleCycle = () => setLevel((prev) => (prev + 1) % glassLevels.length)

  const handleDragStart = (e) => {
    e.preventDefault()
    setDragging(true)
    const clientX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX
    const clientY = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY
    setDragStart({ x: clientX, y: clientY })
    setOffset({ x: modalPos.x, y: modalPos.y })
  }
  const handleDrag = (e) => {
    if (!dragging) return
    const clientX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX
    const clientY = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY
    setModalPos({
      x: offset.x + (clientX - dragStart.x),
      y: offset.y + (clientY - dragStart.y),
    })
  }
  const handleDragEnd = () => setDragging(false)

  // Attach drag listeners
  useEffect(() => {
    if (!dragging) return
    window.addEventListener('mousemove', handleDrag)
    window.addEventListener('mouseup', handleDragEnd)
    window.addEventListener('touchmove', handleDrag)
    window.addEventListener('touchend', handleDragEnd)
    return () => {
      window.removeEventListener('mousemove', handleDrag)
      window.removeEventListener('mouseup', handleDragEnd)
      window.removeEventListener('touchmove', handleDrag)
      window.removeEventListener('touchend', handleDragEnd)
    }
  }, [dragging, dragStart, offset])

  useEffect(() => {
    const ua = navigator.userAgent
    const isDesktop = !/Mobi|Android|iPhone|iPad|iPod|Mobile|Tablet|Touch/.test(ua)
    const isChrome = /Chrome\//.test(ua) && !/Edge\//.test(ua) && !/OPR\//.test(ua) && !/Edg\//.test(ua)
    // setAllowed(isDesktop && isChrome)
    setAllowed(true)
  }, [])

  // Camera feed logic
  useEffect(() => {
    if (!allowed) return
    if (!videoRef.current) return
    const tryGetUserMedia = () => {
      navigator.mediaDevices
        .getUserMedia({ video: { facingMode: 'environment' } })
        .then((stream) => {
          videoRef.current.srcObject = stream
        })
        .catch(() => {
          navigator.mediaDevices
            .getUserMedia({ video: { facingMode: 'user' } })
            .then((stream) => {
              videoRef.current.srcObject = stream
            })
            .catch(() => {
              navigator.mediaDevices
                .getUserMedia({ video: true })
                .then((stream) => {
                  videoRef.current.srcObject = stream
                })
                .catch((err) => {
                  console.error('Error accessing webcam:', err)
                })
            })
        })
    }
    tryGetUserMedia()
  }, [allowed])

  const glass = glassLevels[level]
  // SVG filter for glass edge distortion
  const svgFilterId = 'glass-distort-filter'

  return (
    <div className="w-full max-w-5xl mx-auto my-10 min-h-screen max-h-none rounded-3xl overflow-auto min-w-[320px] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 relative">
      {/* SVG filter definition for edge distortion */}
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <filter id={svgFilterId} x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="turbulence" baseFrequency="0.08 0.12" numOctaves="2" seed="2" result="turb"/>
          <feDisplacementMap in2="turb" in="SourceGraphic" scale="12" xChannelSelector="R" yChannelSelector="G"/>
        </filter>
      </svg>
      <div className="flex-1 relative min-h-screen" ref={containerRef}>
        {/* Video background */}
        {allowed && (
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="absolute top-0 left-0 w-full h-full object-cover z-0 rounded-3xl"
            style={{ pointerEvents: 'none' }}
          />
        )}
        {/* Glass overlay with SVG filter for edge distortion */}
        <div
          style={{
            position: 'fixed',
            top: `calc(45% + ${modalPos.y}px)`,
            left: `calc(50% + ${modalPos.x}px)`,
            cursor: dragging ? 'grabbing' : 'grab',
            zIndex: 10,
            borderRadius: 32,
            boxShadow: glass.shadow,
            background: 'rgba(255,255,255,0.10)',
            backdropFilter: `blur(${glass.blur}px) brightness(${glass.brightness}) saturate(${glass.saturation}) contrast(1.08)`,
            WebkitBackdropFilter: `blur(${glass.blur}px) brightness(${glass.brightness}) saturate(${glass.saturation}) contrast(1.08)`,
            border: `1.5px solid ${glass.border}`,
            minWidth: 220,
            minHeight: 120,
            overflow: 'hidden',
            transition: 'background 0.2s, box-shadow 0.2s, backdrop-filter 0.2s',
            WebkitMaskImage: `radial-gradient(circle at 50% 50%, #fff 60%, rgba(255,255,255,0.2) 100%)`,
            maskImage: `radial-gradient(circle at 50% 50%, #fff 60%, rgba(255,255,255,0.2) 100%)`,
            filter: `url(#${svgFilterId})`,
          }}
        >
          <div
            className="w-[calc(50vw-26.666vw)] h-[calc(50vh-16.666vh)] flex items-end justify-center relative min-w-[220px] select-none"
            onMouseDown={handleDragStart}
            onTouchStart={handleDragStart}
            style={{ userSelect: 'none' }}
          >
            <div className="space-y-3 text-white text-sm font-bold drop-shadow-lg opacity-60 mb-1 sticky bottom-0">
              this is glass
            </div>
            {/* settings button */}
            <button
              onClick={handleCycle}
              aria-label="Change glass intensity"
              className="absolute bottom-0 right-0 z-20 p-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors shadow-md border border-white/10"
              style={{ backdropFilter: 'blur(2px)', WebkitBackdropFilter: 'blur(2px)', scale: '0.75' }}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-white opacity-60 hover:opacity-90 transition-opacity" xmlns="http://www.w3.org/2000/svg">
                <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" fill="none" />
                <path d="M7 10a3 3 0 1 0 6 0 3 3 0 1 0-6 0" stroke="currentColor" strokeWidth="1.2" fill="none" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
