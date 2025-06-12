'use client'

import { useState, useRef, useEffect } from 'react'
import LiquidGlass from 'liquid-glass-react'

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
		navigator.mediaDevices
			.getUserMedia({ video: true })
			.then((stream) => {
				videoRef.current.srcObject = stream
			})
			.catch((err) => {
				console.error('Error accessing webcam:', err)
			})
	}, [])

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
				{/* LiquidGlass overlay */}
				<LiquidGlass
					displacementScale={displacementScale}
					blurAmount={blurAmount}
					saturation={saturation}
					aberrationIntensity={aberrationIntensity}
					elasticity={elasticity}
					cornerRadius={cornerRadius}
					mouseContainer={containerRef}
					overLight={userInfoOverLight}
					mode={userInfoMode}
					style={{
						position: 'fixed',
						top: '45%',
						left: '50%'
					}}
				>
					<div className="w-[calc(100vw-26.666vw)] h-[calc(90vh-16.666vh)] text-shadow-lg">
						<div className="space-y-3"></div>
					</div>
				</LiquidGlass>
			</div>
		</div>
	)
}
