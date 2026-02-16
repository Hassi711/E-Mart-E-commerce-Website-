import { useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useCart } from '../context/CartContext'
import { Star, Truck, Shield, ArrowRight, Loader } from 'lucide-react'

const ProductDetails = () => {
    const { id } = useParams()
    const [product, setProduct] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const { addToCart } = useCart()
    const [activeImage, setActiveImage] = useState(0)

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const { data, error } = await supabase
                    .from('products')
                    .select('*')
                    .eq('id', id)
                    .single()

                if (error) throw error
                setProduct(data)
            } catch (err) {
                console.error('Error fetching product:', err)
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }
        fetchProduct()
    }, [id])

    if (loading) return (
        <div className="min-h-screen pt-24 flex justify-center items-center">
            <Loader className="animate-spin h-10 w-10 text-primary" />
        </div>
    )

    if (error || !product) return (
        <div className="min-h-screen pt-24 flex justify-center items-center text-red-500">
            Product not found
        </div>
    )

    return (
        <div className="min-h-screen pt-24 pb-12 bg-white">
            <div className="container mx-auto px-4">
                <div className="grid md:grid-cols-2 gap-12">
                    {/* Image Gallery */}
                    <div className="space-y-4">
                        <div className="aspect-square bg-slate-100 rounded-2xl overflow-hidden">
                            {product.images && product.images[activeImage] ? (
                                <img src={product.images[activeImage]} alt={product.name} className="w-full h-full object-cover mix-blend-multiply" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-400">No Image</div>
                            )}
                        </div>
                        {/* Thumbnails (Placeholder if multiple images exist) */}
                        {product.images && product.images.length > 1 && (
                            <div className="flex gap-4 overflow-x-auto pb-2">
                                {product.images.map((img, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setActiveImage(index)}
                                        className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${activeImage === index ? 'border-primary' : 'border-transparent'}`}
                                    >
                                        <img src={img} alt="" className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product Info */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                                {product.category_id ? 'In Stock' : 'Featured'}
                            </span>
                            <div className="flex items-center text-yellow-400 text-sm">
                                <Star className="fill-current w-4 h-4" />
                                <span className="ml-1 text-slate-600">4.8 (120 reviews)</span>
                            </div>
                        </div>

                        <h1 className="text-4xl font-bold text-slate-900 mb-4">{product.name}</h1>
                        <p className="text-3xl font-bold text-primary mb-6">${parseFloat(product.price).toFixed(2)}</p>

                        <p className="text-slate-600 mb-8 leading-relaxed">
                            {product.description}
                        </p>

                        <div className="flex gap-4 mb-8">
                            <button
                                onClick={() => addToCart(product)}
                                className="flex-1 bg-slate-900 text-white py-4 rounded-xl font-bold text-lg hover:bg-primary transition-colors shadow-xl shadow-blue-900/10 active:scale-[0.98] transform flex items-center justify-center gap-2"
                            >
                                Add to Cart <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50">
                                <Truck className="w-6 h-6 text-slate-400" />
                                <div>
                                    <h4 className="font-bold text-slate-900 text-sm">Free Delivery</h4>
                                    <p className="text-slate-500 text-xs">Orders over $50</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50">
                                <Shield className="w-6 h-6 text-slate-400" />
                                <div>
                                    <h4 className="font-bold text-slate-900 text-sm">2 Year Warranty</h4>
                                    <p className="text-slate-500 text-xs">100% Guarantee</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ProductDetails
