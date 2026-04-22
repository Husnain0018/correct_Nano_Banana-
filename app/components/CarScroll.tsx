'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'

type Flavor = 'mango' | 'chocolate' | 'pomegranate'

interface FlavorData {
    name: string
    title: string
    subtitle: string
    price: string
    gradient: string
    accent: string
    frames: {
        path: string
        start: number
        end: number
        suffix: string
    }
    slides: {
        h2: string
        p: string
    }[]
}

const flavors: Record<Flavor, FlavorData> = {
    mango: {
        name: 'Cream Mango',
        title: 'Cream Mango.',
        subtitle: 'Pure sunshine.',
        price: '₹120',
        gradient: 'linear-gradient(135deg, #FFB74D 0%, #FFA726 100%)',
        accent: '#FFB74D',
        frames: {
            path: '/frames/frame_',
            start: 3,
            end: 119,
            suffix: '_delay-0.04s.jpg'
        },
        slides: [
            { h2: 'Bursting with fresh mango.', p: 'Hand-picked Alphonso mangoes, perfectly ripened under the summer sun.' },
            { h2: 'Vitamin-packed refreshment.', p: 'A natural energy boost that revitalizes your body and mind instantly.' },
            { h2: 'Made from fruit, not concentrate.', p: 'Our proprietary extraction technology retains 99.9% of nutrients.' },
        ]
    },
    chocolate: {
        name: 'Dutch Chocolate',
        title: 'Dutch Chocolate.',
        subtitle: 'Midnight velvet.',
        price: '₹150',
        gradient: 'linear-gradient(135deg, #3D2B1F 0%, #1A0F0A 100%)',
        accent: '#795548',
        frames: {
            path: '/frames/chocolate/frame_',
            start: 0,
            end: 119,
            suffix: '_delay-0.04s.jpg'
        },
        slides: [
            { h2: 'Rich Belgian cocoa.', p: 'A smooth, dark experience made from the finest ethical cocoa beans.' },
            { h2: 'Guilt-free indulgence.', p: 'Deep chocolate flavor with zero added sugar and 100% plant-based cream.' },
            { h2: 'Antioxidant superfood.', p: 'Packed with flavonoids to boost your mood and heart health naturally.' },
        ]
    },
    pomegranate: {
        name: 'Ruby Pomegranate',
        title: 'Ruby Pomegranate.',
        subtitle: 'Liquid jewelry.',
        price: '₹140',
        gradient: 'linear-gradient(135deg, #880808 0%, #4A0404 100%)',
        accent: '#DC143C',
        frames: {
            path: '/frames/pomegranate/frame_',
            start: 0,
            end: 119,
            suffix: '_delay-0.04s.jpg'
        },
        slides: [
            { h2: 'Deep Ruby Essence.', p: 'Cold-pressed pomegranate arils for a tart, refreshingly sophisticated taste.' },
            { h2: 'The Heart Healer.', p: 'High in potassium and anti-inflammatory compounds for total body wellness.' },
            { h2: 'Pure Aril Extraction.', p: 'Never heated, never concentrated. Just pure, vibrant fruit power.' },
        ]
    }
}

const preloadImages = (
    flavor: FlavorData,
    onProgress: (loaded: number, total: number) => void
): Promise<HTMLImageElement[]> => {
    return new Promise((resolve) => {
        const images: HTMLImageElement[] = []
        let loadedCount = 0
        const { start, end, path, suffix } = flavor.frames
        const total = end - start + 1

        for (let i = start; i <= end; i++) {
            const img = new Image()
            img.src = `${path}${i}${suffix}`

            img.onload = () => {
                loadedCount++
                onProgress(loadedCount, total)
                if (loadedCount === total) {
                    resolve(images)
                }
            }

            img.onerror = () => {
                loadedCount++
                onProgress(loadedCount, total)
                if (loadedCount === total) {
                    resolve(images)
                }
            }

            images[i - start] = img
        }
    })
}

export default function CarScroll() {
    const containerRef = useRef<HTMLDivElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const imagesRef = useRef<HTMLImageElement[]>([])
    
    const [currentFlavor, setCurrentFlavor] = useState<Flavor>('mango')
    const [isLoaded, setIsLoaded] = useState(false)
    const [loadProgress, setLoadProgress] = useState(0)
    const currentFrameRef = useRef(0)

    const flavor = flavors[currentFlavor]

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ['start start', 'end end'],
    })

    // Hero Text Transitions
    const introOpacity = useTransform(scrollYProgress, [0, 0.15, 0.2], [1, 1, 0])
    const introY = useTransform(scrollYProgress, [0, 0.15, 0.2], [0, 0, -50])

    const slide1Opacity = useTransform(scrollYProgress, [0.15, 0.2, 0.35, 0.4], [0, 1, 1, 0])
    const slide1Y = useTransform(scrollYProgress, [0.15, 0.2, 0.35, 0.4], [50, 0, 0, -50])

    const slide2Opacity = useTransform(scrollYProgress, [0.35, 0.4, 0.55, 0.6], [0, 1, 1, 0])
    const slide2Y = useTransform(scrollYProgress, [0.35, 0.4, 0.55, 0.6], [50, 0, 0, -50])

    const slide3Opacity = useTransform(scrollYProgress, [0.55, 0.6, 0.75, 0.8], [0, 1, 1, 0])
    const slide3Y = useTransform(scrollYProgress, [0.55, 0.6, 0.75, 0.8], [50, 0, 0, -50])

    const outroOpacity = useTransform(scrollYProgress, [0.75, 0.8, 0.95], [0, 1, 1])
    const outroY = useTransform(scrollYProgress, [0.75, 0.8], [50, 0])

    const drawFrame = useCallback((frameIndex: number) => {
        const canvas = canvasRef.current
        const ctx = canvas?.getContext('2d')
        const images = imagesRef.current

        if (!canvas || !ctx || !images.length || !images[frameIndex]) return

        const img = images[frameIndex]
        if (!img.complete) return

        const dpr = window.devicePixelRatio || 1
        const width = canvas.width / dpr
        const height = canvas.height / dpr

        ctx.clearRect(0, 0, width, height)

        const imgRatio = img.width / img.height
        const canvasRatio = width / height

        let drawWidth, drawHeight

        // Mobile responsiveness: Use a more prominent scaling for portrait screens
        const isMobile = width < 768
        
        if (isMobile && canvasRatio < 1) {
            // Focus on height for portrait mobile
            drawHeight = height * 0.85
            drawWidth = drawHeight * imgRatio
        } else {
            // Standard contain logic
            if (imgRatio > canvasRatio) {
                drawWidth = width
                drawHeight = width / imgRatio
            } else {
                drawHeight = height
                drawWidth = height * imgRatio
            }
        }

        const drawX = (width - drawWidth) / 2
        const drawY = (height - drawHeight) / 2

        ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight)
    }, [])

    const resizeCanvas = useCallback(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        
        const dpr = window.devicePixelRatio || 1
        canvas.width = window.innerWidth * dpr
        canvas.height = window.innerHeight * dpr
        canvas.style.width = `${window.innerWidth}px`
        canvas.style.height = `${window.innerHeight}px`
        
        const ctx = canvas.getContext('2d')
        if (ctx) ctx.scale(dpr, dpr)
        
        if (isLoaded) {
            drawFrame(currentFrameRef.current)
        }
    }, [isLoaded, drawFrame])

    useEffect(() => {
        setIsLoaded(false)
        setLoadProgress(0)
        
        preloadImages(flavors[currentFlavor], (loaded, total) => {
            setLoadProgress(Math.round((loaded / total) * 100))
        }).then((images) => {
            imagesRef.current = images
            setIsLoaded(true)
            
            // Draw current frame based on scroll progress immediately after load
            const progress = scrollYProgress.get()
            const totalFrames = flavors[currentFlavor].frames.end - flavors[currentFlavor].frames.start + 1
            const frameIndex = Math.min(totalFrames - 1, Math.floor(progress * totalFrames))
            currentFrameRef.current = frameIndex
            requestAnimationFrame(() => drawFrame(frameIndex))
        })
    }, [currentFlavor, drawFrame, scrollYProgress])

    useEffect(() => {
        if (!isLoaded) return

        const totalFrames = flavors[currentFlavor].frames.end - flavors[currentFlavor].frames.start + 1

        const unsubscribe = scrollYProgress.on('change', (progress) => {
            const frameIndex = Math.min(
                totalFrames - 1,
                Math.floor(progress * totalFrames)
            )

            if (frameIndex !== currentFrameRef.current) {
                currentFrameRef.current = frameIndex
                requestAnimationFrame(() => drawFrame(frameIndex))
            }
        })

        return () => unsubscribe()
    }, [isLoaded, currentFlavor, scrollYProgress, drawFrame])

    useEffect(() => {
        resizeCanvas()
        window.addEventListener('resize', resizeCanvas)
        return () => window.removeEventListener('resize', resizeCanvas)
    }, [resizeCanvas])

    const handleFlavorChange = (f: Flavor) => {
        if (f === currentFlavor) return
        setCurrentFlavor(f)
    }

    return (
        <main className="min-h-screen font-outfit transition-all duration-1000 ease-in-out" style={{ background: flavor.gradient }}>
            {/* Preloader */}
            <AnimatePresence>
                {!isLoaded && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/40 backdrop-blur-md"
                    >
                        <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mb-4"></div>
                        <p className="text-white font-medium animate-pulse drop-shadow-md tracking-wider">Blending {flavor.name}... {loadProgress}%</p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Navigation */}
            <motion.nav
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: isLoaded ? 0 : -100, opacity: isLoaded ? 1 : 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="fixed top-0 left-0 right-0 z-50 transition-all duration-500 py-4 md:py-8 backdrop-blur-sm bg-black/10"
            >
                <div className="max-w-7xl mx-auto px-4 md:px-6 flex items-center justify-between">
                    <div className="flex-shrink-0 cursor-pointer group flex items-center gap-2">
                        <div className="relative w-8 h-8 md:w-10 md:h-10 flex items-center justify-center">
                            <div className="absolute inset-0 bg-white/20 blur-lg opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
                            <svg className="w-8 h-8 md:w-10 md:h-10 text-white transform group-hover:rotate-12 transition-transform duration-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <span className="text-xl md:text-2xl font-black tracking-tighter transition-colors duration-300 flex flex-col leading-none text-white">
                            <span className="uppercase text-[0.5rem] md:text-[0.6rem] tracking-[0.4em] opacity-60 ml-px">The Future</span>
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-white/80 to-white/50 animate-gradient-x">NanoBanana.</span>
                        </span>
                    </div>

                    <div className="hidden md:flex items-center space-x-10">
                        {['Juices', 'Our Story', 'Health Benefits', 'Shop'].map((item) => (
                            <a key={item} href="#" className="text-xs uppercase tracking-[0.2em] font-bold transition-all duration-300 hover:tracking-[0.25em] relative group text-white/80 hover:text-white">
                                {item}
                                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"></span>
                            </a>
                        ))}
                    </div>

                    <button className="relative px-5 md:px-8 py-2 md:py-3 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-widest transition-all shadow-lg hover:shadow-white/20 hover:-translate-y-0.5 active:translate-y-0 overflow-hidden group bg-white text-gray-900">
                        <span className="relative z-10 group-hover:text-black transition-colors duration-300">Order Now</span>
                        <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300 ease-out"></div>
                    </button>
                </div>
            </motion.nav>

            {/* Side Controls */}
            <div className="fixed inset-y-0 left-0 z-[60] flex items-center px-2 md:px-8 pointer-events-none">
                <button 
                    onClick={() => handleFlavorChange(currentFlavor === 'mango' ? 'pomegranate' : currentFlavor === 'chocolate' ? 'mango' : 'chocolate')}
                    className="pointer-events-auto p-3 md:p-5 text-white bg-white/10 backdrop-blur-md hover:bg-white/20 rounded-full transition-all duration-300 focus:outline-none shadow-2xl transform hover:scale-110 border border-white/20" aria-label="Previous Flavor"
                >
                    <svg className="w-6 h-6 md:w-[30px] md:h-[30px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"></path></svg>
                </button>
            </div>
            <div className="fixed inset-y-0 right-0 z-[60] flex items-center px-2 md:px-8 pointer-events-none">
                <button 
                    onClick={() => handleFlavorChange(currentFlavor === 'mango' ? 'chocolate' : currentFlavor === 'chocolate' ? 'pomegranate' : 'mango')}
                    className="pointer-events-auto p-3 md:p-5 text-white bg-white/10 backdrop-blur-md hover:bg-white/20 rounded-full transition-all duration-300 focus:outline-none shadow-2xl transform hover:scale-110 border border-white/20" aria-label="Next Flavor"
                >
                    <svg className="w-6 h-6 md:w-[30px] md:h-[30px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"></path></svg>
                </button>
            </div>

            {/* Bottom Flavor Selector */}
            <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-[60] flex items-center gap-2 md:gap-4 bg-black/40 backdrop-blur-lg p-2 md:p-3 rounded-full border border-white/30 shadow-2xl pointer-events-auto max-w-[95vw] overflow-x-auto no-scrollbar scroll-smooth">
                <button 
                    onClick={() => handleFlavorChange('mango')}
                    className={`relative whitespace-nowrap px-4 md:px-6 py-2 md:py-3 rounded-full text-xs md:text-sm font-bold transition-all duration-300 ${currentFlavor === 'mango' ? 'bg-white text-orange-600 shadow-xl scale-110' : 'text-white hover:bg-white/20'}`}
                >
                    Cream Mango
                </button>
                <button 
                    onClick={() => handleFlavorChange('chocolate')}
                    className={`relative whitespace-nowrap px-4 md:px-6 py-2 md:py-3 rounded-full text-xs md:text-sm font-bold transition-all duration-300 ${currentFlavor === 'chocolate' ? 'bg-white text-amber-900 shadow-xl scale-110' : 'text-white hover:bg-white/20'}`}
                >
                    Dutch Chocolate
                </button>
                <button 
                    onClick={() => handleFlavorChange('pomegranate')}
                    className={`relative whitespace-nowrap px-4 md:px-6 py-2 md:py-3 rounded-full text-xs md:text-sm font-bold transition-all duration-300 ${currentFlavor === 'pomegranate' ? 'bg-white text-red-800 shadow-xl scale-110' : 'text-white hover:bg-white/20'}`}
                >
                    Ruby Pomegranate
                </button>
            </div>

            {/* Main scroll container */}
            <div ref={containerRef} className="relative h-[600vh] bg-transparent">
                <div className="sticky top-0 h-screen w-full overflow-hidden">
                    <canvas ref={canvasRef} className="block w-full h-full object-contain" />
                    
                    <div className="absolute inset-0 z-10 pointer-events-none">
                        <div className="w-full h-full relative max-w-7xl mx-auto">
                                                    {/* Intro Text */}
                            <motion.div 
                                key={`intro-${currentFlavor}`}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                style={{ opacity: introOpacity, y: introY }}
                                className="absolute inset-0 flex flex-col justify-center px-4 md:px-20 items-center text-center"
                            >
                                <h1 className="text-4xl sm:text-6xl md:text-8xl font-bold text-white mb-4 tracking-tighter drop-shadow-2xl">
                                    {flavor.title}<br/>
                                    <span className="text-2xl sm:text-4xl md:text-6xl font-light opacity-90 block mt-2">{flavor.subtitle}</span>
                                </h1>
                                <div className="flex items-center gap-4 mt-6">
                                    <span className="text-2xl md:text-3xl font-bold text-white">{flavor.price}</span>
                                    <span className="w-px h-10 bg-white/40"></span>
                                    <div className="text-left text-[0.7rem] md:text-sm font-medium text-white/80 space-y-1">
                                        <p>Rich in Vitamin C</p>
                                        <p>No preservatives</p>
                                        <p>100% fruit</p>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Slide 1 */}
                            <motion.div 
                                key={`slide1-${currentFlavor}`}
                                style={{ opacity: slide1Opacity, y: slide1Y }}
                                className="absolute inset-0 flex flex-col justify-center px-6 md:px-20 items-start text-left"
                            >
                                <h2 className="text-3xl sm:text-5xl md:text-7xl font-bold text-white max-w-xl leading-tight drop-shadow-lg text-balance">
                                    {flavor.slides[0].h2}
                                </h2>
                                <p className="mt-4 md:mt-6 text-base md:text-xl text-white/90 max-w-md">
                                    {flavor.slides[0].p}
                                </p>
                            </motion.div>

                            {/* Slide 2 */}
                            <motion.div 
                                key={`slide2-${currentFlavor}`}
                                style={{ opacity: slide2Opacity, y: slide2Y }}
                                className="absolute inset-0 flex flex-col justify-center px-6 md:px-20 items-end text-right"
                            >
                                <h2 className="text-3xl sm:text-5xl md:text-7xl font-bold text-white max-w-xl leading-tight drop-shadow-lg text-balance">
                                    {flavor.slides[1].h2}
                                </h2>
                                <p className="mt-4 md:mt-6 text-base md:text-xl text-white/90 max-w-md">
                                    {flavor.slides[1].p}
                                </p>
                            </motion.div>

                            {/* Slide 3 */}
                            <motion.div 
                                key={`slide3-${currentFlavor}`}
                                style={{ opacity: slide3Opacity, y: slide3Y }}
                                className="absolute inset-0 flex flex-col justify-center px-6 md:px-20 items-center text-center"
                            >
                                <h2 className="text-3xl sm:text-5xl md:text-7xl font-bold text-white leading-tight drop-shadow-lg text-balance">
                                    {flavor.slides[2].h2}
                                </h2>
                                <div className="mt-8 grid grid-cols-3 gap-4 md:gap-8 text-center px-4">
                                    <div>
                                        <div className="text-xl md:text-3xl font-bold text-white">0g</div>
                                        <div className="text-[0.6rem] md:text-sm text-white/70 uppercase tracking-widest mt-1">Sugar</div>
                                    </div>
                                    <div>
                                        <div className="text-xl md:text-3xl font-bold text-white">0%</div>
                                        <div className="text-[0.6rem] md:text-sm text-white/70 uppercase tracking-widest mt-1">Water</div>
                                    </div>
                                    <div>
                                        <div className="text-xl md:text-3xl font-bold text-white">100%</div>
                                        <div className="text-[0.6rem] md:text-sm text-white/70 uppercase tracking-widest mt-1">Pulp</div>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Outro */}
                            <motion.div 
                                key={`outro-${currentFlavor}`}
                                style={{ opacity: outroOpacity, y: outroY }}
                                className="absolute inset-0 flex flex-col justify-center px-6 md:px-20 items-center text-center"
                            >
                                <h2 className="text-4xl sm:text-6xl md:text-8xl font-bold text-white mb-6 md:mb-8 tracking-tighter drop-shadow-lg">
                                    Be You. Be Raw.
                                </h2>
                                <button className="pointer-events-auto px-8 md:px-10 py-3 md:py-4 bg-white rounded-full text-base md:text-xl font-bold shadow-2xl hover:scale-105 hover:bg-gray-100 transform transition-all duration-300" style={{ color: flavor.accent }}>
                                    Order {flavor.name}
                                </button>
                            </motion.div>

                        </div>
                    </div>
                </div>
            </div>

            {/* Feature Sections Below */}
            <div className="relative z-10 bg-white text-gray-900">
                <div className="py-16 md:py-24 px-6 md:px-12 max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12 md:gap-16">
                    <div className="flex-1 space-y-4 md:space-y-6">
                        <h3 className="text-3xl md:text-5xl font-bold tracking-tight text-center md:text-left" style={{ color: flavor.accent }}>The King of Fruits</h3>
                        <div className="h-1 w-24 mx-auto md:mx-0" style={{ backgroundColor: `${flavor.accent}33` }}></div>
                        <p className="text-lg md:text-xl leading-relaxed text-gray-600 text-center md:text-left">
                            Our {flavor.name} juice uses only the finest ingredients. 
                            Known for their rich sweetness and vibrant color, these fruits are cold-pressed 
                            within hours of harvest to preserve every drop of nutrient-rich goodness. 
                            It's not just juice; it's a liquid gold experience.
                        </p>
                    </div>
                    <div className="flex-1 w-full h-64 md:h-96 rounded-[2rem] md:rounded-3xl overflow-hidden shadow-2xl relative bg-gray-50 flex items-center justify-center">
                         <div className="absolute inset-0 opacity-50 transition-all duration-1000" style={{ background: flavor.gradient }}></div>
                         <span className="relative font-bold text-lg md:text-xl uppercase tracking-widest" style={{ color: flavor.accent }}>Flavor Details</span>
                    </div>
                </div>

                <div className="py-16 md:py-24 px-4 md:px-12 max-w-7xl mx-auto my-6 md:my-12 bg-gray-50 rounded-[2rem] md:rounded-[3rem] shadow-sm border border-gray-100 overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-12 items-center">
                        <div className="space-y-6 md:space-y-8">
                            <div className="text-center md:text-left">
                                <span className="font-bold tracking-widest uppercase text-xs md:text-sm" style={{ color: flavor.accent }}>Purchase</span>
                                <h3 className="text-4xl md:text-6xl font-black text-gray-900 mt-2 mb-2 md:mb-4">{flavor.price}</h3>
                                <p className="text-gray-500 font-medium text-sm md:text-base">per 300ml bottle</p>
                            </div>
                            <div className="flex flex-wrap justify-center md:justify-start gap-2 md:gap-3">
                                {['Cold Pressed', 'Never Heated', 'HPP Treated'].map(tag => (
                                    <span key={tag} className="px-3 md:px-4 py-1.5 md:py-2 bg-white rounded-full text-xs md:text-sm font-bold border border-gray-200 text-gray-700 shadow-sm transition-transform hover:-translate-y-1">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                            <div className="space-y-3 md:space-y-4 pt-4 border-t border-gray-200">
                                <div className="flex items-start gap-3 md:gap-4 group text-left">
                                    <div className="p-1.5 md:p-2 bg-green-100 rounded-full text-green-600 group-hover:bg-green-200 transition-colors shrink-0">
                                        <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                    </div>
                                    <div>
                                        <h5 className="font-bold text-gray-900 text-sm md:text-base">Guaranteed Fresh Delivery</h5>
                                        <p className="text-xs md:text-sm text-gray-600">Next-day delivery available in metro cities.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 md:gap-4 group text-left">
                                    <div className="p-1.5 md:p-2 bg-blue-100 rounded-full text-blue-600 group-hover:bg-blue-200 transition-colors shrink-0">
                                        <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                    </div>
                                    <div>
                                        <h5 className="font-bold text-gray-900 text-sm md:text-base">Satisfaction Policy</h5>
                                        <p className="text-xs md:text-sm text-gray-600">100% Satisfaction Guarantee.</p>
                                    </div>
                                </div>
                            </div>
                            <button className="w-full py-4 md:py-5 bg-black text-white rounded-xl md:rounded-2xl text-lg md:text-xl font-bold hover:bg-gray-800 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 active:scale-95">
                                Add to Cart — {flavor.price}
                            </button>
                        </div>
                        <div className="relative h-full min-h-[300px] md:min-h-[400px] flex items-center justify-center bg-white rounded-2xl md:rounded-3xl border border-gray-100 p-6 md:p-8">
                            <div className="text-center space-y-3 md:space-y-4">
                                <div className="w-32 h-32 md:w-48 md:h-48 mx-auto rounded-full bg-gradient-to-tr from-gray-100 to-gray-50 flex items-center justify-center mb-4 md:mb-6 shadow-inner">
                                    <svg className="w-16 h-16 md:w-24 md:h-24 text-gray-500/50" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 2L2 7l10 5 10-5-10-5zm0 9l2.5-1.25L12 8.75l-2.5 1.25L12 11zm0 2.25l-5-2.5-5 2.5 10 5 10-5-5-2.5-5 2.5z"></path>
                                    </svg>
                                </div>
                                <h4 className="text-xl md:text-2xl font-bold text-gray-900">Nano Processing™</h4>
                                <p className="text-sm md:text-gray-500 max-w-[200px] md:max-w-sm mx-auto">Proprietary extraction technology retains 99.9% of nutrients.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="py-20 md:py-32 flex flex-col items-center justify-center bg-gray-900 text-white clip-path-slant-top">
                    <p className="text-white/40 uppercase tracking-[0.2em] md:tracking-[0.3em] font-bold text-xs md:text-sm mb-4 md:mb-6">Continue the Journey</p>
                    <button 
                         onClick={() => handleFlavorChange(currentFlavor === 'mango' ? 'chocolate' : currentFlavor === 'chocolate' ? 'pomegranate' : 'mango')}
                        className="group relative inline-flex items-center gap-3 md:gap-4 px-8 md:px-12 py-4 md:py-5 bg-white text-black rounded-full text-lg md:text-xl font-bold overflow-hidden transition-all hover:scale-105 active:scale-95"
                    >
                        <span className="relative z-10 flex items-center gap-2 md:gap-3">
                            Next Flavor
                            <svg className="w-5 h-5 md:w-6 md:h-6 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                        </span>
                        <div className="absolute inset-0 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500" style={{ backgroundColor: flavor.accent }}></div>
                    </button>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-gray-900 text-white pt-12 md:pt-20 pb-10 border-t border-gray-800">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 md:gap-12 border-b border-gray-800 pb-12">
                    <div className="space-y-4">
                        <h4 className="text-2xl font-black tracking-tighter"><span className="text-white">Nano</span><span style={{ color: flavor.accent }}>Banana.</span></h4>
                        <p className="text-gray-400 text-sm leading-relaxed max-w-xs">Redefining freshness with technology. Pure, cold-pressed, and delivered with speed.</p>
                    </div>
                    <div className="space-y-4">
                        <h5 className="text-sm font-bold uppercase tracking-widest text-gray-500">Shop</h5>
                        <ul className="space-y-2 text-sm text-gray-300">
                            {['Cream Mango', 'Dutch Chocolate', 'Ruby Pomegranate', 'Variety Pack'].map(link => (
                                <li key={link}><a href="#" className="hover:text-white transition-colors" style={{ color: flavor.accent }}>{link}</a></li>
                            ))}
                        </ul>
                    </div>
                    <div className="space-y-4">
                        <h5 className="text-sm font-bold uppercase tracking-widest text-gray-500">Support</h5>
                        <ul className="space-y-2 text-sm text-gray-300">
                            {['FAQ', 'Shipping', 'Returns', 'Contact Us'].map(link => (
                                <li key={link}><a href="#" className="hover:text-white transition-colors">{link}</a></li>
                            ))}
                        </ul>
                    </div>
                    <div className="space-y-4 text-left">
                        <h5 className="text-sm font-bold uppercase tracking-widest text-gray-500 text-center md:text-left">Stay Fresh</h5>
                        <form className="flex flex-col gap-2">
                            <input type="email" placeholder="Your email" className="bg-gray-800 border-none rounded-lg px-4 py-3 text-sm text-white focus:ring-2 outline-none" style={{ '--tw-ring-color': flavor.accent } as any} />
                            <button className="text-white font-bold py-3 rounded-lg text-sm transition-colors" style={{ backgroundColor: flavor.accent }}>Subscribe</button>
                        </form>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto px-6 pt-8 flex flex-col md:flex-row justify-between items-center text-xs md:text-sm text-gray-600 gap-4">
                    <p className="text-center md:text-left">© 2026 Nano Banana Inc. All rights reserved.</p>
                    <div className="flex gap-4 md:gap-6 mt-0 md:mt-0">
                        <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                    </div>
                </div>
            </footer>
        </main>
    )
}
