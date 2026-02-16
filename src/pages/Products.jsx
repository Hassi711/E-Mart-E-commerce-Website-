import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabase'
import { Search, Filter, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'

const Products = () => {
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [categoryFilter, setCategoryFilter] = useState('All')
    const { addToCart } = useCart()

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true)
            try {
                let query = supabase
                    .from('products')
                    .select('*')
                    .eq('is_active', true)
                    .order('created_at', { ascending: false })

                // Apply category filter if not 'All' (Requires categories implementation, placeholder for now)
                // if (categoryFilter !== 'All') {
                //     query = query.eq('category', categoryFilter)
                // }

                const { data, error } = await query

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
    }, [categoryFilter])

    // Client-side search filtering
    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="min-h-screen pt-24 pb-12 bg-slate-50">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
                    <div>
                        <h1 className="text-4xl font-bold text-slate-900 mb-2">Shop All Products</h1>
                        <p className="text-slate-500">Discover our premium collection</p>
                    </div>
                </div>

                {/* Filters & Search */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-8 flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                    </div>
                    {/* Placeholder for Category Filter */}
                    <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                        {['All', 'Electronics', 'Fashion', 'Home', 'Accessories'].map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setCategoryFilter(cat)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${categoryFilter === cat
                                    ? 'bg-slate-900 text-white'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Products Grid */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                ) : error ? (
                    <div className="text-center py-20 text-red-500 bg-red-50 rounded-xl border border-red-100">
                        Failed to load products. Please try again later.
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="text-center py-20 text-slate-500 bg-white rounded-xl border border-slate-200">
                        No products found matching your criteria.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
                        {filteredProducts.map((product) => (
                            <motion.div
                                key={product.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                                className="bg-white rounded-3xl p-5 hover:shadow-xl transition-all duration-300 group border border-slate-100/80 flex flex-col h-full"
                            >
                                <div className="h-56 rounded-2xl mb-5 overflow-hidden relative shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)] bg-slate-100 flex-shrink-0">
                                    {product.images && product.images[0] ? (
                                        <img
                                            src={product.images[0]}
                                            alt={product.name}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 mix-blend-multiply"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-100">
                                            No Image
                                        </div>
                                    )}
                                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-slate-800 shadow-sm">
                                        In Stock
                                    </div>
                                </div>

                                <div className="flex-grow">
                                    <h3 className="font-bold text-lg mb-1 text-slate-800 tracking-tight line-clamp-1">{product.name}</h3>
                                    <p className="text-sm text-slate-500 mb-4 line-clamp-2">{product.description}</p>
                                </div>

                                <div className="flex items-center justify-between mt-auto">
                                    <span className="text-2xl font-bold text-slate-900 tracking-tighter">${parseFloat(product.price).toFixed(2)}</span>
                                    <button
                                        onClick={() => addToCart(product)}
                                        className="bg-slate-900 text-white h-10 w-10 rounded-full flex items-center justify-center shadow-lg hover:bg-primary hover:scale-110 transition-all"
                                    >
                                        <ArrowRight className="h-5 w-5" />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default Products
