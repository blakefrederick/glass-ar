'use client'

import { useRef, useEffect } from 'react'
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
          <div className="w-[calc(50vw-26.666vw)] h-[calc(50vh-16.666vh)] flex items-end justify-center relative">
            <div className="space-y-3 text-white text-sm font-bold drop-shadow-lg opacity-20 mb-1 sticky bottom-0">
              this is glass
            </div>
          </div>
        </LiquidGlass>
      </div>
    </div>
  )
}
