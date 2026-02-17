import { motion } from 'framer-motion'
import HeroSlider from '../components/HeroSlider'
import SaleProducts from '../components/SaleProducts'
import Newsletter from '../components/Newsletter'
import Features from '../components/Features'
import Testimonials from '../components/Testimonials'
import BrandTicker from '../components/BrandTicker'
import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import videoBg from '../assets/videos/v1.mp4'
import electronicsImg from '../assets/videos/images/electronics.jpeg'
import fashionImg from '../assets/videos/images/fashion.jpeg'
import homeImg from '../assets/videos/images/home&living.jpeg'
import accessoriesImg from '../assets/videos/images/Accessories.jpeg'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const Home = () => {
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const { data, error } = await supabase
                    .from('products')
                    .select('*')
                    .eq('is_active', true)
                    .order('created_at', { ascending: false })

                if (error) throw error
                setProducts(data)
            } catch (err) {
                console.error('Error fetching products:', err)
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }

        fetchProducts()
    }, [])

    return (
        <div className="flex flex-col">


            {/* Hero Section - Full Width & Immersive */}
            <section className="relative w-full h-screen min-h-[600px] overflow-hidden flex items-center bg-slate-900">
                {/* Video Background */}
                <div className="absolute inset-0 w-full h-full">
                    <video
                        className="w-full h-full object-cover opacity-60"
                        src={videoBg}
                        autoPlay
                        loop
                        muted
                        playsInline
                    />
                    {/* Gradient Overlay for Text Readability */}
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/50 to-transparent"></div>
                </div>

                {/* Hero Content */}
                <div className="container mx-auto px-4 relative z-10 flex flex-col md:flex-row items-center pt-20">
                    <div className="flex-1 max-w-2xl space-y-8 text-center md:text-left">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <span className="inline-block px-4 py-1.5 rounded-full bg-blue-500/10 text-blue-200 text-sm font-bold mb-4 border border-blue-400/20 backdrop-blur-md shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]">
                                New Collection 2024
                            </span>
                            <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight mb-6 drop-shadow-xl">
                                The Future of <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-br from-blue-300 to-cyan-100 filter drop-shadow-lg">
                                    Shopping is Here
                                </span>
                            </h1>
                            <p className="text-lg text-slate-300 mb-8 max-w-lg mx-auto md:mx-0 leading-relaxed font-medium">
                                diverse collection of premium products curated just for you. Experience quality, speed, and style like never before.
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4 justify-center md:justify-start"
                        >
                            <Link to="/products">
                                <motion.button
                                    whileHover={{ scale: 1.02, translateY: -2 }}
                                    whileTap={{ scale: 0.95, translateY: 1 }}
                                    className="px-8 py-4 rounded-full font-bold text-lg text-white flex items-center space-x-2 transition-all 
                                    bg-gradient-to-b from-blue-500 to-blue-700 
                                    shadow-[0_4px_0_rgb(29,78,216),0_8px_20px_rgba(0,0,0,0.4)]
                                    active:shadow-[0_2px_0_rgb(29,78,216),0_4px_10px_rgba(0,0,0,0.3)]
                                    border-t border-blue-400/50"
                                >
                                    <span>Start Shopping</span>
                                    <ArrowRight className="h-5 w-5" />
                                </motion.button>
                            </Link>
                            <Link to="/categories">
                                <motion.button
                                    whileHover={{ scale: 1.02, translateY: -2 }}
                                    whileTap={{ scale: 0.95, translateY: 1 }}
                                    className="px-8 py-4 rounded-full font-bold text-lg text-white transition-all
                                    bg-gradient-to-b from-slate-700/50 to-slate-800/80 backdrop-blur-md
                                    shadow-[0_4px_0_rgba(0,0,0,0.5),0_8px_20px_rgba(0,0,0,0.3)]
                                    active:shadow-[0_2px_0_rgba(0,0,0,0.5),0_4px_10px_rgba(0,0,0,0.3)]
                                    border border-slate-600/50 border-t-slate-500/80"
                                >
                                    Explore Categories
                                </motion.button>
                            </Link>
                        </motion.div>
                    </div>

                    {/* Optional: Floating Element / Featured Product Card */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 1, delay: 0.4 }}
                        className="hidden md:flex flex-1 justify-end"
                    >
                        <div className="relative w-80 h-96 rounded-3xl p-6 transform rotate-[-6deg] hover:rotate-0 transition-transform duration-500
                        bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20
                        shadow-[20px_35px_50px_-15px_rgba(0,0,0,0.7),inset_0_-2px_4px_rgba(0,0,0,0.5),inset_0_1px_2px_rgba(255,255,255,0.2)]">
                            <div className="absolute -top-4 -left-4 bg-gradient-to-br from-red-500 to-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-full animate-bounce shadow-lg border-t border-red-400">
                                Popular
                            </div>
                            <div className="w-full h-full rounded-2xl overflow-hidden relative group shadow-inner">
                                <img src={fashionImg} alt="Featured" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                                <div className="absolute bottom-4 left-4 text-white">
                                    <p className="font-bold text-lg drop-shadow-md">Urban Collection</p>
                                    <p className="text-sm opacity-90 drop-shadow-sm">Trending Now</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Content Sections */}

            {/* Featured Categories - Full Width & Dominated */}
            <section className="bg-[#f0f9f4] py-24 relative overflow-hidden">
                {/* Subtle texture overlay */}
                <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] pointer-events-none"></div>

                <div className="container mx-auto px-4 relative z-10 max-w-7xl">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-12">
                        <div>
                            <span className="text-sm font-bold tracking-wider text-slate-500 uppercase mb-2 block">Collections</span>
                            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 drop-shadow-sm">Shop by Category</h2>
                        </div>
                        <Link to="/categories" className="hidden md:flex items-center gap-2 text-slate-700 font-bold hover:text-primary transition-colors text-lg group">
                            View All Categories <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            { name: 'Electronics', img: electronicsImg, id: 'Electronics', size: 'col-span-1 md:col-span-2 lg:col-span-2' },
                            { name: 'Fashion', img: fashionImg, id: 'Fashion', size: 'col-span-1' },
                            { name: 'Home & Living', img: homeImg, id: 'Home', size: 'col-span-1' },
                            { name: 'Accessories', img: accessoriesImg, id: 'Accessories', size: 'col-span-1 md:col-span-2 lg:col-span-4 h-[400px]' } // Full width bottom
                        ].map((cat, i) => (
                            <Link
                                to={`/categories#${cat.id}`}
                                key={i}
                                className={`group cursor-pointer relative overflow-hidden rounded-[2rem] transition-all duration-500
                                shadow-[10px_10px_30px_#d1d9e6,-10px_-10px_30px_#ffffff] hover:shadow-2xl hover:-translate-y-2
                                border border-white/50 h-96 ${cat.size || 'col-span-1'}`}
                            >
                                <img
                                    src={cat.img}
                                    alt={cat.name}
                                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity"></div>
                                <div className="absolute inset-0 p-8 flex flex-col justify-end">
                                    <h3 className="text-white font-bold text-3xl md:text-4xl drop-shadow-lg transform group-hover:-translate-y-2 transition-transform duration-300">
                                        {cat.name}
                                    </h3>
                                    <div className="h-0 group-hover:h-8 transition-all duration-300 overflow-hidden opacity-0 group-hover:opacity-100">
                                        <p className="text-slate-200 font-medium flex items-center gap-2">
                                            Explore Collection <ArrowRight className="h-4 w-4" />
                                        </p>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Hero Slider - Featured Products */}
            <HeroSlider />

            {/* Sale Products Section */}
            <SaleProducts />



            {/* Hot/Featured Product Section - Full Width Dark */}
            <section className="bg-slate-900 overflow-hidden text-white py-0 relative">
                {/* Mesh Gradient Background */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/40 via-slate-900 to-slate-900"></div>

                <div className="w-full px-4 md:px-12 lg:px-20 relative z-10">
                    <div className="flex flex-col md:flex-row items-center">
                        <div className="flex-1 py-16 pr-8 space-y-8">
                            <span className="inline-block bg-red-600 text-white text-xs font-bold px-3 py-1 uppercase tracking-wider rounded-sm shadow-md border-b-2 border-red-800">
                                Limited Time Offer
                            </span>
                            <h2 className="text-5xl md:text-6xl font-bold leading-none tracking-tight">
                                HOT SALE ON<br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300 drop-shadow-lg">
                                    ELECTRONICS
                                </span>
                            </h2>
                            <p className="text-slate-300 text-lg max-w-md font-light leading-relaxed">
                                Upgrade your gear with our premium selection of latest electronic gadgets at unbeatable prices.
                            </p>
                            <div className="flex space-x-6 pt-2">
                                <Link
                                    to="/products"
                                    className="bg-gradient-to-b from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white px-10 py-3 rounded-xl font-bold transition-all shadow-[0_4px_0_rgb(29,78,216)] active:shadow-none active:translate-y-1 border-t border-blue-400/30"
                                >
                                    Shop Sale
                                </Link>
                                <div className="flex flex-col justify-center">
                                    <span className="text-3xl font-bold text-white drop-shadow-md">$299.00</span>
                                    <span className="text-sm text-slate-500 line-through font-medium">$499.00</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex-1 relative h-[500px] w-full flex items-center justify-center">
                            <div className="absolute inset-0 w-[120%] h-full -right-[20%] skew-x-12 transform bg-slate-800/50 hidden md:block border-l border-white/5 backdrop-blur-sm"></div>
                            <img
                                src={electronicsImg}
                                alt="Hot Sale Electronics"
                                className="absolute inset-0 w-full h-full object-cover md:object-contain relative z-10 drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] transform hover:scale-105 transition-transform duration-500"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Products - Full Width White */}
            <section className="py-20 bg-slate-50">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between mb-12">
                        <h2 className="text-3xl font-bold text-slate-800">Featured Products</h2>
                        <Link to="/products" className="text-primary font-semibold hover:text-blue-700 transition-colors flex items-center group">
                            View all <ArrowRight className="ml-1 h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                        </div>
                    ) : error ? (
                        <div className="text-center py-12 text-red-500">
                            Failed to load products. Please try again later.
                        </div>
                    ) : products.length === 0 ? (
                        <div className="text-center py-12 text-slate-500">
                            No products found.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
                            {products.slice(0, 4).map((item) => (
                                <div key={item.id} className="bg-white rounded-3xl p-5 hover:shadow-2xl transition-all duration-300 group
                                shadow-[0_10px_20px_rgba(0,0,0,0.02),0_2px_6px_rgba(0,0,0,0.02)]
                                border border-slate-100/80">
                                    <Link to={`/product/${item.id}`}>
                                        <div className="h-56 rounded-2xl mb-5 overflow-hidden relative
                                        shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)] bg-slate-100">
                                            {item.images && item.images[0] ? (
                                                <img
                                                    src={item.images[0]}
                                                    alt={item.name}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 mix-blend-multiply"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-400">
                                                    No Image
                                                </div>
                                            )}
                                            {/* Glass Tag */}
                                            <div className="absolute top-3 right-3 bg-white/70 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-slate-800 shadow-sm border border-white/50">
                                                {item.category_id ? 'Product' : 'Item'}
                                            </div>
                                        </div>
                                        <h3 className="font-bold text-lg mb-1 truncate text-slate-800 tracking-tight group-hover:text-blue-600 transition-colors">{item.name}</h3>
                                        <p className="text-sm text-slate-500 mb-2 truncate">{item.description}</p>
                                        <div className="flex items-center justify-between mt-4">
                                            <span className="text-2xl font-bold text-slate-900 tracking-tighter">${parseFloat(item.price).toFixed(2)}</span>
                                            <button className="bg-slate-900 text-white h-10 w-10 rounded-full flex items-center justify-center
                                            shadow-[0_4px_10px_rgba(0,0,0,0.3)] hover:bg-primary hover:scale-110 hover:shadow-primary/40 active:scale-95 transition-all">
                                                <ArrowRight className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </Link>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Features Section - Why Choose Us */}
            <Features />

            {/* Brand Ticker Section - Trusted By */}
            <BrandTicker />

            {/* Testimonials Section */}
            <Testimonials />



            {/* Newsletter Section */}
            <Newsletter />
        </div>
    )
}

export default Home
