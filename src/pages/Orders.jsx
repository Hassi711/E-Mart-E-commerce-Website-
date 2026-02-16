import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Loader, Package, ChevronDown, ChevronUp, Calendar, MapPin } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const Orders = () => {
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [expandedOrder, setExpandedOrder] = useState(null)

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                // Fetch orders with their items and related product details
                const { data, error } = await supabase
                    .from('orders')
                    .select(`
                        *,
                        order_items (
                            *,
                            products (
                                name,
                                images
                            )
                        )
                    `)
                    .order('created_at', { ascending: false })

                if (error) throw error
                setOrders(data)
            } catch (err) {
                console.error('Error fetching orders:', err)
                setError('Failed to load your orders.')
            } finally {
                setLoading(false)
            }
        }

        fetchOrders()
    }, [])

    const toggleOrder = (orderId) => {
        setExpandedOrder(expandedOrder === orderId ? null : orderId)
    }

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    if (loading) return (
        <div className="min-h-screen pt-24 flex justify-center items-center">
            <Loader className="animate-spin h-10 w-10 text-primary" />
        </div>
    )

    if (error) return (
        <div className="min-h-screen pt-24 px-4 flex justify-center items-center">
            <div className="text-red-500 bg-red-50 p-4 rounded-lg border border-red-100">
                {error}
            </div>
        </div>
    )

    return (
        <div className="min-h-screen pt-24 pb-12 bg-slate-50">
            <div className="container mx-auto px-4 max-w-4xl">
                <h1 className="text-3xl font-bold text-slate-900 mb-8">My Orders</h1>

                {orders.length === 0 ? (
                    <div className="bg-white p-12 rounded-3xl shadow-sm border border-slate-100 text-center">
                        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                            <Package className="h-8 w-8" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-700 mb-2">No orders yet</h2>
                        <p className="text-slate-500">You haven't placed any orders yet.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order) => (
                            <motion.div
                                key={order.id}
                                layout
                                className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
                            >
                                {/* Order Header */}
                                <div
                                    onClick={() => toggleOrder(order.id)}
                                    className="p-6 cursor-pointer hover:bg-slate-50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                                >
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-3">
                                            <span className="font-bold text-slate-900 text-lg">Order #{order.id.slice(0, 8)}</span>
                                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide ${order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                                                    order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                                        'bg-blue-100 text-blue-700'
                                                }`}>
                                                {order.status}
                                            </span>
                                        </div>
                                        <div className="flex items-center text-slate-500 text-sm gap-4">
                                            <span className="flex items-center"><Calendar className="h-4 w-4 mr-1" /> {formatDate(order.created_at)}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between md:justify-end gap-6">
                                        <span className="text-xl font-bold text-slate-900">${parseFloat(order.total_amount).toFixed(2)}</span>
                                        {expandedOrder === order.id ? <ChevronUp className="text-slate-400" /> : <ChevronDown className="text-slate-400" />}
                                    </div>
                                </div>

                                {/* Order Details (Collapsible) */}
                                <AnimatePresence>
                                    {expandedOrder === order.id && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="border-t border-slate-100 bg-slate-50/50"
                                        >
                                            <div className="p-6 space-y-6">
                                                {/* Shipping Info */}
                                                <div className="flex items-start gap-3 text-sm text-slate-600 bg-white p-4 rounded-xl border border-slate-100">
                                                    <MapPin className="h-5 w-5 text-slate-400 mt-0.5" />
                                                    <div>
                                                        <p className="font-semibold text-slate-900">Shipping Address</p>
                                                        <p>{order.shipping_address?.fullName}</p>
                                                        <p>{order.shipping_address?.address}</p>
                                                        <p>{order.shipping_address?.city}, {order.shipping_address?.zipCode}</p>
                                                        <p>{order.shipping_address?.country}</p>
                                                    </div>
                                                </div>

                                                {/* Items List */}
                                                <div className="space-y-3">
                                                    <h4 className="font-semibold text-slate-900 text-sm">Items</h4>
                                                    {order.order_items.map((item) => (
                                                        <div key={item.id} className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-100">
                                                            <div className="flex items-center gap-3">
                                                                <div className="h-10 w-10 bg-slate-100 rounded-lg overflow-hidden">
                                                                    {item.products?.images && item.products.images[0] && (
                                                                        <img src={item.products.images[0]} alt={item.products.name} className="h-full w-full object-cover" />
                                                                    )}
                                                                </div>
                                                                <div>
                                                                    <p className="font-medium text-slate-900 text-sm">{item.products?.name || 'Product Info Unavailable'}</p>
                                                                    <p className="text-xs text-slate-500">Qty: {item.quantity}</p>
                                                                </div>
                                                            </div>
                                                            <span className="font-medium text-slate-900 text-sm">${parseFloat(item.price).toFixed(2)}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default Orders
