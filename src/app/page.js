'use client'

import { useRef, useEffect, useState } from 'react'
import dynamic from 'next/dynamic'

const LiquidGlass = dynamic(() => import('liquid-glass-react'), { ssr: false })

export default function ARPage() {
	const aberrationIntensity = 5
	const elasticity = 0
	const cornerRadius = 32
	const userInfoOverLight = false
	const userInfoMode = 'standard'

	const glassLevels = [
    { blurAmount: 0.05, displacementScale: 50, saturation: 120 },
		{ blurAmount: 0.1, displacementScale: 100, saturation: 140 },
		{ blurAmount: 0.2, displacementScale: 150, saturation: 160 },
		{ blurAmount: 0.0, displacementScale: 20, saturation: 110 },
	]
	const [level, setLevel] = useState(0)
	const handleCycle = () => setLevel((prev) => (prev + 1) % glassLevels.length)

	const containerRef = useRef(null)
	const videoRef = useRef(null)
	const [allowed, setAllowed] = useState(false)

	const ua = typeof navigator !== 'undefined' ? navigator.userAgent : ''
	const isDesktop = !/Mobi|Android|iPhone|iPad|iPod|Mobile|Tablet|Touch/.test(ua)
	const isChrome = /Chrome\//.test(ua) && !/Edge\//.test(ua) && !/OPR\//.test(ua) && !/Edg\//.test(ua)

	useEffect(() => {
		setAllowed(isDesktop && isChrome)
	}, [])

	useEffect(() => {
		if (!allowed) return // Don't ask for camera if not allowed
		if (!videoRef.current) return
		// Prefer environment, fallback to user, then fallback to any camera
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

	const [modalPos, setModalPos] = useState({ x: 0, y: 0 })
	const [dragging, setDragging] = useState(false)
	const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
	const [offset, setOffset] = useState({ x: 0, y: 0 })

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

	if (!allowed) {
		return (
			<div className="flex items-center justify-center min-h-screen text-center p-8">
				<div>
					<h1 className="text-2xl font-bold mb-4">Unsupported Device or Browser</h1>
					<p className="text-lg">You gotta use <span className="font-semibold">Desktop Chrome</span> for this.</p>
          <p className="text-xs mt-5">Why? Because the underlying package relies on WebGL2 shaders, pointer hover, and framebuffer sampling - all of which are throttled, missing, or buggy on Safari, Firefox, and mobile.</p>
          {isChrome && (
            <p className="mt-3">
              <a href="/nopackage" className="text-blue-600 underline hover:text-blue-800 text-xs">
                try this glass instead
              </a>
            </p>
          )}
				</div>
			</div>
		)
	}

	return (
		<div className="w-full max-w-5xl mx-auto my-10 min-h-screen max-h-none rounded-3xl overflow-auto min-w-[320px]">
			<div className="flex-1 relative min-h-screen" ref={containerRef}>
				{/* Video background */}
				<video
					ref={videoRef}
					autoPlay
					muted
					playsInline
					className="absolute top-0 left-0 w-full h-full object-cover z-0 rounded-3xl"
					style={{ pointerEvents: 'none' }}
				/>
				{/* LiquidGlass overlay */}
				<LiquidGlass
					displacementScale={glassLevels[level].displacementScale}
					blurAmount={glassLevels[level].blurAmount}
					saturation={glassLevels[level].saturation}
					aberrationIntensity={aberrationIntensity}
					elasticity={elasticity}
					cornerRadius={cornerRadius}
					mouseContainer={containerRef}
					overLight={userInfoOverLight}
					mode={userInfoMode}
					style={{
						position: 'fixed',
						top: `calc(45% + ${modalPos.y}px)`,
						left: `calc(50% + ${modalPos.x}px)`,
						cursor: dragging ? 'grabbing' : 'grab',
						zIndex: 10,
					}}
				>
					<div
						className="w-[calc(50vw-26.666vw)] h-[calc(50vh-16.666vh)] flex items-end justify-center relative min-w-[220px] select-none"
						onMouseDown={handleDragStart}
						onTouchStart={handleDragStart}
						style={{ userSelect: 'none' }}
					>
						<div className="space-y-3 text-white text-sm font-bold drop-shadow-lg opacity-20 mb-1 sticky bottom-0">
							{`this is glass ${level === glassLevels.length - 1 ? 0 : level + 1}`}
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
				</LiquidGlass>
			</div>
		</div>
	)
}
