'use client'

import { useState, useRef, useEffect } from 'react'
import dynamic from 'next/dynamic'

const LiquidGlass = dynamic(() => import('liquid-glass-react'), { ssr: false })

export default function Home() {
	const displacementScale = 100
	const blurAmount = 0.3
	const saturation = 220
	const aberrationIntensity = 5
	const elasticity = 0
	const cornerRadius = 32
	const userInfoOverLight = false
	const userInfoMode = 'standard'

	const containerRef = useRef(null)

	const backgroundImageFiles = [
		'20-1400x1300.jpg',
		'238-1100x1200.jpg',
		'353-2000x2000.jpg',
		'367-1200x1200.jpg',
		'452-1100x1200.jpg',
		'457-2000x2000.jpg',
		'537-1200x1200.jpg',
		'55-1100x1200.jpg',
		'576-1200x1200.jpg',
		'608-1200x1200.jpg',
		'62-2000x2000.jpg',
		'659-2000x2000.jpg',
		'737-1100x1200.jpg',
		'776-2000x2000.jpg',
		'831-1400x1300.jpg',
		'842-1200x1200.jpg',
		'918-1400x1300.jpg'
	]
	const backgroundImages = backgroundImageFiles.map((f) => `/backgrounds/${f}`)

	const [shuffledImages, setShuffledImages] = useState([])

	useEffect(() => {
		function shuffle(array) {
			let currentIndex = array.length,
				randomIndex
			while (currentIndex !== 0) {
				randomIndex = Math.floor(Math.random() * currentIndex)
				currentIndex--
				;[array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]]
			}
			return array
		}
		setShuffledImages(shuffle([...backgroundImages]))
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

	if (shuffledImages.length === 0) {
		return null // or a loading spinner
	}

	return (
		<div className="w-full max-w-5xl mx-auto my-10 min-h-screen max-h-none rounded-3xl overflow-auto">
			<div className="flex-1 relative min-h-screen" ref={containerRef}>
				<div onClick={handleCycle} className="absolute inset-0 z-10 cursor-pointerApp" style={{ borderRadius: 32 }} />
				<div className="w-full pb-96 mb-96 flex flex-col">
					{shuffledImages.map((src, i) => (
						<img
							key={src}
							src={src}
							className="w-full h-96 object-cover my-10"
							alt={`Background ${i + 1}`}
						/>
					))}
				</div>
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
