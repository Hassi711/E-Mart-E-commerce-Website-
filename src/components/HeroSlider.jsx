import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const HeroSlider = () => {
    const [products, setProducts] = useState([])
    const [currentIndex, setCurrentIndex] = useState(0)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchFeaturedProducts = async () => {
            try {
                // Fetch some recent products to feature
                const { data, error } = await supabase
                    .from('products')
                    .select('*')
                    .limit(5)
                    .order('created_at', { ascending: false })

                if (error) throw error
                if (data) setProducts(data)
            } catch (err) {
                console.error('Error fetching slider products:', err)
            } finally {
                setLoading(false)
            }
        }

        fetchFeaturedProducts()
    }, [])

    useEffect(() => {
        if (products.length === 0) return

        const timer = setInterval(() => {
            nextSlide()
        }, 2600)

        return () => clearInterval(timer)
    }, [currentIndex, products])

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev + 1) % products.length)
    }

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev - 1 + products.length) % products.length)
    }

    if (loading || products.length === 0) return null

    const currentProduct = products[currentIndex]

    return (
        <section className="relative w-full h-[600px] overflow-hidden bg-slate-950">
            {/* Elegant Background Gradient - Consistent Slate/Blue Theme */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-slate-800 via-slate-950 to-black"></div>
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>

            {/* Subtle Animated Glows - Blue/Cyan */}
            <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px] animate-pulse"></div>
            <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[120px] animate-pulse delay-1000"></div>

            <AnimatePresence mode='wait'>
                <motion.div
                    key={currentProduct.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="relative z-10 w-full h-full px-4 md:px-12 lg:px-20 flex items-center justify-center"
                >
                    <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-center">

                        {/* Content Card - refined glassmorphism */}
                        <motion.div
                            initial={{ x: -30, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                            className="p-8 md:p-12 rounded-3xl bg-white/5 backdrop-blur-2xl border border-white/10 shadow-2xl relative overflow-hidden group"
                        >
                            {/* Shine Effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

                            <span className="inline-block px-3 py-1 mb-6 text-xs font-bold tracking-wider text-blue-300 uppercase bg-blue-500/10 rounded-full border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.15)]">
                                Featured Collection
                            </span>
                            <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight drop-shadow-xl text-white">
                                {currentProduct.name}
                            </h2>
                            <p className="text-lg text-slate-300 mb-8 max-w-md line-clamp-3 font-light leading-relaxed">
                                {currentProduct.description}
                            </p>
                            <div className="flex flex-wrap items-center gap-6">
                                <Link to={`/product/${currentProduct.id}`}>
                                    <button className="px-8 py-4 bg-white text-slate-900 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-50 transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.15)] transform hover:-translate-y-1">
                                        Shop Now <ArrowRight className="h-5 w-5" />
                                    </button>
                                </Link>
                                <span className="text-3xl font-bold text-white drop-shadow-md">
                                    ${parseFloat(currentProduct.price).toFixed(2)}
                                </span>
                            </div>
                        </motion.div>

                        {/* Image Side - Floating */}
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            transition={{ delay: 0.3, duration: 0.6, type: "spring" }}
                            className="relative h-[400px] md:h-[500px] flex items-center justify-center perspective-1000"
                        >
                            {currentProduct.images?.[0] ? (
                                <div className="relative w-full h-full flex items-center justify-center group">
                                    {/* Glow behind image */}
                                    <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 to-cyan-500/20 rounded-full blur-[80px] transform group-hover:scale-110 transition-transform duration-700"></div>

                                    <img
                                        src={currentProduct.images[0]}
                                        alt={currentProduct.name}
                                        className="relative z-10 max-h-full max-w-full object-contain drop-shadow-[0_25px_50px_rgba(0,0,0,0.5)] transform group-hover:scale-105 group-hover:-rotate-2 transition-all duration-500"
                                    />
                                </div>
                            ) : (
                                <div className="w-64 h-64 bg-white/5 backdrop-blur-md rounded-2xl flex items-center justify-center text-slate-400 font-bold border border-white/10">
                                    No Image
                                </div>
                            )}
                        </motion.div>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Navigation Controls - Minimalist */}
            <div className="absolute bottom-8 right-8 md:right-24 flex gap-4 z-20">
                <button
                    onClick={prevSlide}
                    className="p-4 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-white hover:bg-white/10 hover:border-white/30 transition-all active:scale-95"
                >
                    <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                    onClick={nextSlide}
                    className="p-4 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-white hover:bg-white/10 hover:border-white/30 transition-all active:scale-95"
                >
                    <ChevronRight className="h-6 w-6" />
                </button>
            </div>

            {/* Pagination Dots */}
            <div className="absolute bottom-10 left-12 md:left-24 flex gap-3 z-20">
                {products.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => setCurrentIndex(idx)}
                        className={`h-1.5 rounded-full transition-all duration-500 ${idx === currentIndex
                            ? 'bg-white w-12 shadow-[0_0_10px_rgba(255,255,255,0.5)]'
                            : 'bg-white/20 w-3 hover:bg-white/40'
                            }`}
                    />
                ))}
            </div>
        </section>
    )
}

export default HeroSlider
