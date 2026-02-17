import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabase'
import { Link } from 'react-router-dom'
import { ArrowRight, Loader } from 'lucide-react'

// Import images (ensure paths match Home.jsx)
import electronicsImg from '../assets/videos/images/electronics.jpeg'
import fashionImg from '../assets/videos/images/fashion.jpeg'
import homeImg from '../assets/videos/images/home&living.jpeg'
import accessoriesImg from '../assets/videos/images/Accessories.jpeg'

const Categories = () => {
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const categories = [
        { name: 'Electronics', id: 'Electronics', img: electronicsImg, description: 'Latest gadgets and tech' },
        { name: 'Fashion', id: 'Fashion', img: fashionImg, description: 'Trendy clothing and apparel' },
        { name: 'Home & Living', id: 'Home', img: homeImg, description: 'Decor and essentials for your home' }, // ID 'Home' matches Products.jsx often
        { name: 'Accessories', id: 'Accessories', img: accessoriesImg, description: 'Complete your look' }
    ]

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true)
            try {
                const { data, error } = await supabase
                    .from('products')
                    .select('*')
                    .eq('is_active', true)
                    .order('created_at', { ascending: false })

                if (error) throw error
                setProducts(data || [])
            } catch (err) {
                console.error('Error fetching products:', err)
                setError('Failed to load products')
            } finally {
                setLoading(false)
            }
        }

        fetchProducts()
    }, [])

    const getProductsByCategory = (catId) => {
        // Simple text matching for now since we don't have strict relations yet
        // Adjust logic if you use category_id vs category name text
        return products.filter(p =>
            p.category === catId ||
            p.category_id === catId ||
            (p.description && p.description.toLowerCase().includes(catId.toLowerCase())) ||
            (p.name && p.name.toLowerCase().includes(catId.toLowerCase()))
        )
    }

    if (loading) {
        return (
            <div className="min-h-screen pt-24 flex justify-center items-center bg-slate-50">
                <Loader className="animate-spin h-10 w-10 text-primary" />
            </div>
        )
    }

    return (
        <div className="min-h-screen pt-24 pb-12 bg-slate-50">
            {/* Header */}
            <div className="bg-slate-900 text-white py-20 mb-12 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-30"></div>
                <div className="container mx-auto px-4 relative z-10 text-center">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl md:text-6xl font-bold mb-4"
                    >
                        Browse Categories
                    </motion.h1>
                    <p className="text-xl text-slate-300 max-w-2xl mx-auto">
                        Explore our curated collections and find exactly what you're looking for.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 space-y-20">
                {categories.map((category, index) => {
                    const categoryProducts = getProductsByCategory(category.id);

                    return (
                        <section key={category.id} className="scroll-mt-24" id={category.id}>
                            {/* Category Banner */}
                            <div className="relative rounded-3xl overflow-hidden h-64 md:h-80 mb-8 group shadow-xl">
                                <img
                                    src={category.img}
                                    alt={category.name}
                                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent flex flex-col justify-center px-8 md:px-16">
                                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-2">{category.name}</h2>
                                    <p className="text-slate-300 text-lg md:text-xl max-w-md">{category.description}</p>
                                    <Link
                                        to={`/products?category=${category.id}`}
                                        className="mt-6 inline-flex items-center gap-2 text-white font-semibold hover:text-blue-400 transition-colors w-fit"
                                    >
                                        View All {category.name} <ArrowRight className="h-5 w-5" />
                                    </Link>
                                </div>
                            </div>

                            {/* Products Grid/Carousel */}
                            {categoryProducts.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {categoryProducts.slice(0, 4).map(product => (
                                        <Link key={product.id} to={`/product/${product.id}`} className="group">
                                            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300 h-full flex flex-col">
                                                <div className="aspect-square rounded-xl bg-slate-100 mb-4 overflow-hidden relative">
                                                    {product.images && product.images[0] ? (
                                                        <img
                                                            src={product.images[0]}
                                                            alt={product.name}
                                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-slate-400">No Image</div>
                                                    )}
                                                </div>
                                                <div className="flex-grow">
                                                    <h3 className="font-bold text-slate-800 mb-1 line-clamp-1">{product.name}</h3>
                                                    <p className="text-sm text-slate-500 line-clamp-2 mb-3">{product.description}</p>
                                                </div>
                                                <div className="flex items-center justify-between mt-auto">
                                                    <span className="font-bold text-lg text-slate-900">${parseFloat(product.price).toFixed(2)}</span>
                                                    <span className="text-primary text-sm font-semibold group-hover:underline">View Details</span>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200">
                                    <p className="text-slate-500">No products found in this category yet.</p>
                                </div>
                            )}
                        </section>
                    )
                })}
            </div>
        </div>
    )
}

export default Categories
