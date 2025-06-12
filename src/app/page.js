'use client'

import { useState, useRef, useEffect } from 'react'
import dynamic from 'next/dynamic'

const LiquidGlass = dynamic(() => import('liquid-glass-react'), { ssr: false })

export default function ARPage() {
	const displacementScale = 100
	const blurAmount = 0.1
	const saturation = 140
	const aberrationIntensity = 5
	const elasticity = 0
	const cornerRadius = 32
	const userInfoOverLight = false
	const userInfoMode = 'standard'

	const containerRef = useRef(null)
	const videoRef = useRef(null)

	useEffect(() => {
		if (!videoRef.current) return
		// Try environment camera first, fallback to user
		const tryEnvironmentCamera = () => {
			navigator.mediaDevices
				.getUserMedia({ video: { facingMode: { exact: 'environment' } } })
				.then((stream) => {
					videoRef.current.srcObject = stream
				})
				.catch(() => {
					// fallback to user
					navigator.mediaDevices
						.getUserMedia({ video: { facingMode: { exact: 'user' } } })
						.then((stream) => {
							videoRef.current.srcObject = stream
						})
						.catch((err) => {
							console.error('Error accessing webcam:', err)
						})
				})
		}
		tryEnvironmentCamera()
	}, [])

	const glassLevels = [
		{ blurAmount: 0.1, displacementScale: 100, saturation: 140 },
		{ blurAmount: 0.2, displacementScale: 200, saturation: 180 },
		{ blurAmount: 0.3, displacementScale: 300, saturation: 220 },
		{ blurAmount: 0.4, displacementScale: 400, saturation: 260 },
		{ blurAmount: 0.5, displacementScale: 500, saturation: 300 },
		{ blurAmount: 0.0, displacementScale: 0, saturation: 100 },
	]
	const [level, setLevel] = useState(0)
	const handleCycle = () => setLevel((prev) => (prev + 1) % glassLevels.length)

	return (
		<div className="w-full max-w-5xl mx-auto my-10 min-h-screen max-h-none rounded-3xl overflow-auto">
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
				<div onClick={handleCycle} className="absolute inset-0 z-10 cursor-pointer" style={{ borderRadius: 32 }} />
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
						position: 'absolute',
						inset: 0,
						width: '100%',
						height: '100%',
						pointerEvents: 'none',
					}}
				>
					<div className="w-full h-full text-shadow-lg">
						<div className="space-y-3"></div>
					</div>
				</LiquidGlass>
			</div>
		</div>
	)
}
