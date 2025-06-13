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
	const [isChrome, setIsChrome] = useState(false)
	const [checkedSupport, setCheckedSupport] = useState(false)

	useEffect(() => {
		if (typeof window !== 'undefined') {
			const ua = navigator.userAgent
			const isDesktop = !/Mobi|Android|iPhone|iPad|iPod|Mobile|Tablet|Touch/.test(ua)
			const chrome = /Chrome\//.test(ua) && !/Edge\//.test(ua) && !/OPR\//.test(ua) && !/Edg\//.test(ua)
			setAllowed(isDesktop && chrome)
			setIsChrome(chrome)
			setCheckedSupport(true)
		}
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
	const [velocity, setVelocity] = useState({ x: 2, y: 2 }) // px per frame
	const [animating, setAnimating] = useState(true)
	const [dragging, setDragging] = useState(false)
	const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
	const [offset, setOffset] = useState({ x: 0, y: 0 })
	const [expanded, setExpanded] = useState(false)
	const glassScale = expanded ? 2 : 1
	const [dragTimeout, setDragTimeout] = useState(null)

	// DVD animation
	useEffect(() => {
		if (!animating || dragging) return
		let rafId
		const animate = () => {
			setModalPos(pos => {
				const glassW = expanded ? (window.innerWidth * 0.8 - window.innerWidth * 0.26666) : (window.innerWidth * 0.5 - window.innerWidth * 0.26666)
				const glassH = expanded ? (window.innerHeight * 0.8 - window.innerHeight * 0.16666) : (window.innerHeight * 0.5 - window.innerHeight * 0.16666)
				let { x, y } = pos
				let { x: vx, y: vy } = velocity

				// Calculate bounds relative to window
				const minX = -window.innerWidth / 2 + glassW / 2 + 10
				const maxX = window.innerWidth / 2 - glassW / 2 - 10
				const minY = -window.innerHeight / 2 + glassH / 2 + 5
				const maxY = window.innerHeight / 2 - glassH / 2 - 5

				let hitCorner = false
				// Bounce logic (less bounce: just invert, don't add energy)
				if (x + vx < minX || x + vx > maxX) {
					vx = -Math.abs(vx) * Math.sign(vx)
				}
				if (y + vy < minY || y + vy > maxY) {
					vy = -Math.abs(vy) * Math.sign(vy)
				}
				// Move
				x += vx
				y += vy
				// Snap to bounds
				if (x < minX) x = minX
				if (x > maxX) x = maxX
				if (y < minY) y = minY
				if (y > maxY) y = maxY
				// Check for exact corner
				if ((x === minX || x === maxX) && (y === minY || y === maxY)) {
					hitCorner = true
				}
				setVelocity({ x: vx, y: vy })
				// If hit corner, pause for a moment
				if (hitCorner) {
					setAnimating(false)
					setTimeout(() => setAnimating(true), 600)
				}
				return { x, y }
			})
			rafId = requestAnimationFrame(animate)
		}
		rafId = requestAnimationFrame(animate)
		return () => cancelAnimationFrame(rafId)
	}, [animating, dragging, expanded, velocity])

	// Stop animation on drag
	const handleDragStart = (e) => {
		e.preventDefault()
		setDragging(true)
		setAnimating(false)
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
	const handleDragEnd = () => {
		setDragging(false)
		// Restart animation after 7 seconds if not already animating
		if (dragTimeout) clearTimeout(dragTimeout)
		const timeout = setTimeout(() => {
			setAnimating(true)
		}, 7000)
		setDragTimeout(timeout)
	}

	// Ensure drag listeners are always active after animation stops
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
		return () => {
			if (dragTimeout) clearTimeout(dragTimeout)
		}
	}, [dragTimeout])

	if (!checkedSupport) {
		return null
	}

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
		<div className="w-full max-w-5xl mx-auto min-h-screen max-h-none rounded-l overflow-hidden min-w-[320px] flex flex-col" style={{height:'100vh'}}>
			<div className="flex-1 relative min-h-screen h-full" ref={containerRef} style={{height:'100vh'}}>
				{/* Video background */}
				<video
					ref={videoRef}
					autoPlay
					muted
					playsInline
					className="absolute top-0 left-0 w-full h-full object-cover z-0 rounded-l"
					style={{ pointerEvents: 'none', height: '100vh', width: '100vw', minHeight: 0, minWidth: 0 }}
				/>
				{/* LiquidGlass overlay */}
				<LiquidGlass
					key={expanded ? 'expanded' : 'collapsed'}
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
						top: `calc(50% + ${modalPos.y}px)`,
						left: `calc(50% + ${modalPos.x}px)`,
						cursor: dragging ? 'grabbing' : 'grab',
						zIndex: 10,
					}}
				>
					<div
						className={`${expanded ? 'w-[calc(80vw-26.666vw)]' : 'w-[calc(50vw-26.666vw)]'} ${expanded ? 'h-[calc(80vh-16.666vh)]' : 'h-[calc(50vh-16.666vh)]'} flex items-end justify-center relative min-w-[220px] select-none`}
						onMouseDown={handleDragStart}
						onTouchStart={handleDragStart}
						style={{ userSelect: 'none', transition: 'width 0.2s' }}
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
						{/* expand/collapse button */}
						{!expanded && (
							<button
								onClick={() => setExpanded(true)}
								aria-label="Expand glass"
								className="absolute top-0 right-0 z-30 p-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors shadow-md border border-white/10"
								style={{
									transform: 'translate(50%,-50%) rotate(45deg)',
									backdropFilter: 'blur(2px)',
									WebkitBackdropFilter: 'blur(2px)',
									scale: '0.75',
									pointerEvents: 'auto',
								}}
							>
								<svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-white opacity-60 hover:opacity-90 transition-opacity" xmlns="http://www.w3.org/2000/svg">
									<polyline points="6,14 10,10 14,6" stroke="currentColor" strokeWidth="2" fill="none" />
								</svg>
							</button>
						)}
						{expanded && (
							<button
								onClick={() => setExpanded(false)}
								aria-label="Collapse glass"
								className="absolute top-0 right-0 z-30 p-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors shadow-md border border-white/10"
								style={{
									transform: 'translate(50%,-50%) rotate(-135deg)',
									backdropFilter: 'blur(2px)',
									WebkitBackdropFilter: 'blur(2px)',
									scale: '0.75',
									pointerEvents: 'auto',
								}}
							>
								<svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-white opacity-60 hover:opacity-90 transition-opacity" xmlns="http://www.w3.org/2000/svg">
									<polyline points="14,6 10,10 6,14" stroke="currentColor" strokeWidth="2" fill="none" />
								</svg>
							</button>
						)}
					</div>
				</LiquidGlass>
			</div>
		</div>
	)
}
