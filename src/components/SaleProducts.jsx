import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Timer, Tag } from 'lucide-react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const SaleProducts = () => {
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchSaleProducts = async () => {
            try {
                // Fetch products (simulating sale items)
                const { data, error } = await supabase
                    .from('products')
                    .select('*')
                    .limit(4)
                    .order('price', { ascending: true }) // Lowest price first for "sale"

                if (error) throw error
                if (data) setProducts(data)
            } catch (err) {
                console.error('Error fetching sale products:', err)
            } finally {
                setLoading(false)
            }
        }

        fetchSaleProducts()
    }, [])

    if (loading) return null

    return (
        <section className="py-20 bg-white">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row items-end justify-between mb-12 gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                                <Tag className="h-3 w-3" /> Flash Sale
                            </span>
                        </div>
                        <h2 className="text-4xl font-bold text-slate-900">
                            Clearance <span className="text-red-600">Sale</span>
                        </h2>
                        <p className="text-slate-500 mt-2 max-w-lg">
                            Grab these limited-time offers before they're gone! Massive discounts on selected items.
                        </p>
                    </div>

                    <Link to="/products" className="group flex items-center gap-2 text-slate-900 font-bold hover:text-red-600 transition-colors">
                        View All Offers <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {products.map((product, index) => (
                        <motion.div
                            key={product.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="group relative"
                        >
                            <div className="relative aspect-[4/5] bg-slate-100 rounded-2xl overflow-hidden mb-4">
                                <span className="absolute top-3 left-3 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded shadow-md z-10">
                                    -{Math.floor(Math.random() * 30 + 10)}%
                                </span>

                                {product.images?.[0] ? (
                                    <Link to={`/product/${product.id}`}>
                                        <img
                                            src={product.images[0]}
                                            alt={product.name}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                        />
                                    </Link>
                                ) : (
                                    <Link to={`/product/${product.id}`}>
                                        <div className="w-full h-full flex items-center justify-center text-slate-400">No Image</div>
                                    </Link>
                                )}

                                {/* Quick Add Overlay */}
                                <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-white/90 backdrop-blur-sm border-t border-white/50">
                                    <Link to={`/product/${product.id}`} className="block w-full py-3 bg-slate-900 text-white text-center rounded-xl font-bold hover:bg-red-600 transition-colors">
                                        View Details
                                    </Link>
                                </div>
                            </div>

                            <div>
                                <h3 className="font-bold text-slate-900 truncate">{product.name}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-red-600 font-bold text-lg">${parseFloat(product.price).toFixed(2)}</span>
                                    <span className="text-slate-400 text-sm line-through">${(parseFloat(product.price) * 1.2).toFixed(2)}</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default SaleProducts
