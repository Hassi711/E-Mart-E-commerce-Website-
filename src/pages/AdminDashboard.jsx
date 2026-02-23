import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import {
    Plus, Edit, Trash2, Eye, EyeOff, Loader, CheckCircle, AlertCircle,
    RefreshCw, X, Save, Star, Package, ShoppingBag, BarChart2,
    TrendingUp, Users, DollarSign, Calendar
} from 'lucide-react'
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area
} from 'recharts'

const AdminDashboard = () => {
    const { isAdmin } = useAuth()
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [successMsg, setSuccessMsg] = useState('')
    const [productRatings, setProductRatings] = useState({})
    const [activeTab, setActiveTab] = useState('products')
    const [orders, setOrders] = useState([])

    // Analytics State
    const [analytics, setAnalytics] = useState({
        revenue: { total: 0, today: 0, week: 0, month: 0, growth: 0 },
        orders: { total: 0, pending: 0, processing: 0, shipped: 0, delivered: 0, cancelled: 0 },
        customers: { total: 0, new: 0, returning: 0 },
        aov: 0,
        topProducts: [],
        revenueTrend: [],
        ordersPerDay: [],
        statusDistribution: []
    })

    // Edit/Add Modal State
    const [isProductModalOpen, setIsProductModalOpen] = useState(false)
    const [editingProduct, setEditingProduct] = useState(null) // null means creating new
    const [productFormData, setProductFormData] = useState({
        name: '',
        description: '',
        price: '',
        stock: '',
        category: 'Electronics', // Default category
        images: []
    })
    const [updateLoading, setUpdateLoading] = useState(false)

    // Fetch products
    const fetchProducts = async () => {
        setLoading(true)
        setError(null)
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) throw error
            setProducts(data || [])
        } catch (err) {
            console.error('Error fetching products:', err)
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const fetchRatings = async () => {
        const { data, error } = await supabase
            .from('reviews')
            .select('product_id, rating')

        if (error) {
            console.error('Error fetching ratings:', error)
            return
        }

        const ratingsMap = {}
        const countsMap = {}

        data?.forEach(review => {
            if (!ratingsMap[review.product_id]) {
                ratingsMap[review.product_id] = 0
                countsMap[review.product_id] = 0
            }
            ratingsMap[review.product_id] += review.rating
            countsMap[review.product_id] += 1
        })

        const averageRatings = {}
        Object.keys(ratingsMap).forEach(id => {
            averageRatings[id] = (ratingsMap[id] / countsMap[id]).toFixed(1)
        })

        setProductRatings(averageRatings)
    }

    const fetchOrders = async () => {
        setLoading(true)
        setError(null)
        try {
            const { data, error } = await supabase
                .from('orders')
                .select(`
                    *,
                    order_items (
                        *,
                        products ( name, price )
                    )
                `)
                .order('created_at', { ascending: false })

            if (error) throw error
            setOrders(data || [])
        } catch (err) {
            console.error('Error fetching orders:', err)
            setError('Failed to fetch orders')
        } finally {
            setLoading(false)
        }
    }

    // Calculate Analytics
    useEffect(() => {
        if (orders.length === 0) return

        const now = new Date()
        const todayStart = new Date(now.setHours(0, 0, 0, 0))
        const weekStart = new Date(now.setDate(now.getDate() - 7))
        const monthStart = new Date(now.setDate(now.getDate() - 30))

        let totalRev = 0, todayRev = 0, weekRev = 0, monthRev = 0
        let statusCounts = { pending: 0, processing: 0, shipped: 0, delivered: 0, cancelled: 0 }
        let customerMap = {}
        let productSales = {}
        let dailyRevenue = {}
        let dailyOrders = {}

        orders.forEach(order => {
            const orderDate = new Date(order.created_at)
            const amt = parseFloat(order.total_amount)
            const isCancelled = order.status === 'cancelled'

            // Status Counts
            if (statusCounts[order.status] !== undefined) {
                statusCounts[order.status]++
            }

            if (!isCancelled) {
                totalRev += amt
                if (orderDate >= todayStart) todayRev += amt
                if (orderDate >= weekStart) weekRev += amt
                if (orderDate >= monthStart) monthRev += amt

                // Daily Stats for Charts
                const dateKey = orderDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                dailyRevenue[dateKey] = (dailyRevenue[dateKey] || 0) + amt
                dailyOrders[dateKey] = (dailyOrders[dateKey] || 0) + 1

                // Product Sales
                order.order_items?.forEach(item => {
                    const pid = item.product_id
                    // Use item.products.name safely if available, else fallback provided ID
                    const pName = item.products?.name || 'Unknown Product'

                    if (!productSales[pid]) {
                        productSales[pid] = { id: pid, name: pName, quantity: 0, revenue: 0 }
                    }
                    productSales[pid].quantity += item.quantity
                    productSales[pid].revenue += (parseFloat(item.price_at_purchase) * item.quantity)
                })
            }

            // Customer Stats
            const custId = order.user_id || order.shipping_address?.email || 'Guest'
            customerMap[custId] = (customerMap[custId] || 0) + 1
        })

        // Customers New vs Returning
        let newCust = 0, retCust = 0
        Object.values(customerMap).forEach(count => {
            if (count === 1) newCust++
            else retCust++
        })

        // Top Products
        const sortedProducts = Object.values(productSales)
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 5)

        // Charts Data
        const trendData = Object.keys(dailyRevenue).map(date => ({
            date,
            revenue: dailyRevenue[date],
            orders: dailyOrders[date]
        })).reverse() // Show chronological if order list is desc

        // Status Pie Data
        const pieData = Object.keys(statusCounts).map(status => ({
            name: status.charAt(0).toUpperCase() + status.slice(1),
            value: statusCounts[status]
        })).filter(d => d.value > 0)

        setAnalytics({
            revenue: { total: totalRev, today: todayRev, week: weekRev, month: monthRev, growth: 12.5 }, // Mock growth
            orders: { total: orders.length, ...statusCounts },
            customers: { total: Object.keys(customerMap).length, new: newCust, returning: retCust },
            aov: orders.length > 0 ? (totalRev / orders.length) : 0,
            topProducts: sortedProducts,
            revenueTrend: trendData.reverse(), // Ensure chronological
            ordersPerDay: trendData,
            statusDistribution: pieData
        })

    }, [orders])


    const updateOrderStatus = async (orderId, newStatus) => {
        try {
            const { error } = await supabase
                .from('orders')
                .update({ status: newStatus })
                .eq('id', orderId)

            if (error) throw error

            const { error: historyError } = await supabase
                .from('order_status_history')
                .insert({
                    order_id: orderId,
                    status: newStatus,
                    changed_by: (await supabase.auth.getUser()).data.user.id
                })

            if (historyError) console.error('Error updating history:', historyError)

            setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o))
            showSuccess(`Order status updated to ${newStatus}`)
        } catch (err) {
            console.error('Error updating order:', err)
            setError('Failed to update order status')
        }
    }

    useEffect(() => {
        if (isAdmin) {
            if (activeTab === 'products') {
                fetchProducts()
                fetchRatings()
            } else { // Orders or Analytics needs orders
                fetchOrders()
            }
        }
    }, [isAdmin, activeTab])

    const deleteProduct = async (id) => {
        if (!window.confirm('Are you sure you want to delete this product?')) return
        try {
            const { error } = await supabase.from('products').delete().eq('id', id)
            if (error) throw error
            setProducts(products.filter(p => p.id !== id))
            showSuccess('Product deleted successfully')
        } catch (err) {
            console.error('Error deleting product:', err)
            setError('Failed to delete product')
        }
    }

    // Modal Handlers
    const openProductModal = (product = null) => {
        console.log("Opening Modal", product)
        setEditingProduct(product)
        if (product) {
            setProductFormData({
                name: product.name,
                description: product.description || '',
                price: product.price,
                stock: product.stock,
                category: product.category || 'Electronics',
                images: product.images || []
            })
        } else {
            setProductFormData({
                name: '',
                description: '',
                price: '',
                stock: '',
                category: 'Electronics',
                images: []
            })
        }
        setIsProductModalOpen(true)
    }

    const closeProductModal = () => {
        setIsProductModalOpen(false)
        setEditingProduct(null)
    }

    const handleFormChange = (e) => {
        setProductFormData({ ...productFormData, [e.target.name]: e.target.value })
    }

    const handleSaveProduct = async (e) => {
        e.preventDefault()
        setUpdateLoading(true)
        try {
            const productData = {
                name: productFormData.name,
                description: productFormData.description,
                price: parseFloat(productFormData.price),
                stock: parseInt(productFormData.stock),
                category: productFormData.category,
                is_active: true
                // Note: Image upload logic would go here, simplified for now
            }

            let result
            if (editingProduct) {
                const { data, error } = await supabase
                    .from('products')
                    .update(productData)
                    .eq('id', editingProduct.id)
                    .select()
                if (error) throw error
                result = data[0]
                setProducts(products.map(p => p.id === editingProduct.id ? { ...p, ...result } : p))
                showSuccess('Product updated successfully')
            } else {
                const { data, error } = await supabase
                    .from('products')
                    .insert(productData)
                    .select()
                if (error) throw error
                result = data[0]
                setProducts([result, ...products])
                showSuccess('Product created successfully')
            }

            closeProductModal()
        } catch (err) {
            console.error('Error saving product:', err)
            setError('Failed to save product')
        } finally {
            setUpdateLoading(false)
        }
    }

    const toggleProductStatus = async (id, currentStatus) => {
        try {
            const { error } = await supabase.from('products').update({ is_active: !currentStatus }).eq('id', id)
            if (error) throw error
            setProducts(products.map(p => p.id === id ? { ...p, is_active: !currentStatus } : p))
            showSuccess('Product status updated')
        } catch (err) {
            console.error('Error updating status:', err)
        }
    }

    const showSuccess = (msg) => {
        setSuccessMsg(msg)
        setTimeout(() => setSuccessMsg(''), 3000)
    }

    if (!isAdmin) return <div className="text-center pt-24 text-red-600 font-bold">Access Denied</div>

    // Chart Colors
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

    return (
        <div className="min-h-screen pt-24 pb-12 bg-slate-50 relative">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800">Admin Dashboard</h1>
                        <p className="text-slate-500 mt-1">Manage store & view analytics</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-4 mb-8 border-b border-slate-200 overflow-x-auto">
                    {[
                        { id: 'products', label: 'Products', icon: ShoppingBag },
                        { id: 'orders', label: 'Orders', icon: Package },
                        { id: 'analytics', label: 'Analytics', icon: BarChart2 },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`pb-4 px-4 font-medium transition-colors relative flex items-center gap-2 whitespace-nowrap ${activeTab === tab.id ? 'text-primary' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <tab.icon className="w-5 h-5" />
                            {tab.label}
                            {activeTab === tab.id && (
                                <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                            )}
                        </button>
                    ))}
                </div>

                {/* Notifications */}
                <AnimatePresence>
                    {error && (
                        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-2 border border-red-100">
                            <AlertCircle className="h-5 w-5" /> {error}
                        </motion.div>
                    )}
                    {successMsg && (
                        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg flex items-center gap-2 border border-green-100">
                            <CheckCircle className="h-5 w-5" /> {successMsg}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* --- PRODUCTS TAB --- */}
                {activeTab === 'products' && (
                    <div className="space-y-6">
                        <div className="flex justify-end gap-3">
                            <button onClick={fetchProducts} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50">
                                <RefreshCw className="h-4 w-4" /> Refresh
                            </button>
                            <button
                                onClick={() => openProductModal(null)}
                                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 shadow-sm"
                            >
                                <Plus className="h-5 w-5" /> Add Product
                            </button>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                            {/* ... (Keep existing table structure, updated handlers) ... */}
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 border-b border-slate-200">
                                        <tr>
                                            <th className="px-6 py-4 font-semibold text-slate-700">Product</th>
                                            <th className="px-6 py-4 font-semibold text-slate-700">Price</th>
                                            <th className="px-6 py-4 font-semibold text-slate-700">Stock</th>
                                            <th className="px-6 py-4 font-semibold text-slate-700">Status</th>
                                            <th className="px-6 py-4 font-semibold text-slate-700 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {products.map((product) => (
                                            <tr key={product.id} className="hover:bg-slate-50/50">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden">
                                                            {product.images?.[0] ? <img src={product.images[0]} className="h-full w-full object-cover" /> : <Package className="h-5 w-5 text-slate-400" />}
                                                        </div>
                                                        <div>
                                                            <div className="font-medium text-slate-900">{product.name}</div>
                                                            <div className="text-xs text-slate-500">{product.category}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">${product.price}</td>
                                                <td className="px-6 py-4">{product.stock}</td>
                                                <td className="px-6 py-4">
                                                    <button onClick={() => toggleProductStatus(product.id, product.is_active)} className={`px-2 py-1 rounded-full text-xs font-bold ${product.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                                                        {product.is_active ? 'Active' : 'Hidden'}
                                                    </button>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <button onClick={() => openProductModal(product)} className="p-2 text-slate-400 hover:text-blue-600 bg-slate-50 rounded-lg"><Edit className="h-4 w-4" /></button>
                                                        <button onClick={() => deleteProduct(product.id)} className="p-2 text-slate-400 hover:text-red-600 bg-slate-50 rounded-lg"><Trash2 className="h-4 w-4" /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- ORDERS TAB --- */}
                {activeTab === 'orders' && (
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        {/* Reuse existing orders table logic */}
                        {loading ? <div className="p-12 text-center"><Loader className="animate-spin h-8 w-8 mx-auto text-primary" /></div> : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 border-b border-slate-200">
                                        <tr>
                                            <th className="px-6 py-4 font-semibold text-slate-700">Order ID</th>
                                            <th className="px-6 py-4 font-semibold text-slate-700">Total</th>
                                            <th className="px-6 py-4 font-semibold text-slate-700">Status</th>
                                            <th className="px-6 py-4 font-semibold text-slate-700">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {orders.map(order => (
                                            <tr key={order.id} className="hover:bg-slate-50/50">
                                                <td className="px-6 py-4 text-sm font-mono">{order.id.slice(0, 8)}</td>
                                                <td className="px-6 py-4 font-bold">${order.total_amount}</td>
                                                <td className="px-6 py-4">
                                                    <select
                                                        value={order.status}
                                                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                                                        className="bg-white border border-slate-200 rounded-md text-sm px-2 py-1"
                                                    >
                                                        <option value="pending">Pending</option>
                                                        <option value="processing">Processing</option>
                                                        <option value="shipped">Shipped</option>
                                                        <option value="delivered">Delivered</option>
                                                        <option value="cancelled">Cancelled</option>
                                                    </select>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-500">{new Date(order.created_at).toLocaleDateString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* --- ANALYTICS TAB --- */}
                {activeTab === 'analytics' && (
                    <div className="space-y-8 animate-fade-in">
                        {/* KPI Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><DollarSign className="w-6 h-6" /></div>
                                    <span className="text-green-500 text-sm font-bold flex items-center">+{analytics.revenue.growth}% <TrendingUp className="w-3 h-3 ml-1" /></span>
                                </div>
                                <h3 className="text-slate-500 text-sm font-medium">Total Revenue</h3>
                                <div className="text-3xl font-bold text-slate-900 mt-1">${analytics.revenue.total.toFixed(2)}</div>
                                <div className="text-xs text-slate-400 mt-2">Today: ${analytics.revenue.today.toFixed(2)}</div>
                            </div>

                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-purple-50 text-purple-600 rounded-xl"><Package className="w-6 h-6" /></div>
                                </div>
                                <h3 className="text-slate-500 text-sm font-medium">Total Orders</h3>
                                <div className="text-3xl font-bold text-slate-900 mt-1">{analytics.orders.total}</div>
                                <div className="text-xs text-slate-400 mt-2">{analytics.orders.pending} Pending Processing</div>
                            </div>

                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-orange-50 text-orange-600 rounded-xl"><ShoppingBag className="w-6 h-6" /></div>
                                </div>
                                <h3 className="text-slate-500 text-sm font-medium">Avg Order Value</h3>
                                <div className="text-3xl font-bold text-slate-900 mt-1">${analytics.aov.toFixed(2)}</div>
                            </div>

                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl"><Users className="w-6 h-6" /></div>
                                </div>
                                <h3 className="text-slate-500 text-sm font-medium">Total Customers</h3>
                                <div className="text-3xl font-bold text-slate-900 mt-1">{analytics.customers.total}</div>
                                <div className="text-xs text-slate-400 mt-2">{analytics.customers.new} New vs {analytics.customers.returning} Returning</div>
                            </div>
                        </div>

                        {/* Charts Row 1 */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                                <h3 className="text-lg font-bold text-slate-800 mb-6">Revenue Trend</h3>
                                <div className="h-80">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={analytics.revenueTrend}>
                                            <defs>
                                                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                                                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#64748B' }} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B' }} tickFormatter={(value) => `$${value}`} />
                                            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                                            <Area type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                                <h3 className="text-lg font-bold text-slate-800 mb-6">Order Status Breakdown</h3>
                                <div className="h-80 flex items-center justify-center">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={analytics.statusDistribution}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={100}
                                                fill="#8884d8"
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {analytics.statusDistribution.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                            <Legend verticalAlign="bottom" height={36} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        {/* Top Products */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                            <h3 className="text-lg font-bold text-slate-800 mb-6">Top Selling Products</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 border-b border-slate-100">
                                        <tr>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Product</th>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Revenue</th>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Quantity Sold</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {analytics.topProducts.map((p, i) => (
                                            <tr key={p.id}>
                                                <td className="px-6 py-4 font-medium text-slate-900 flex items-center gap-3">
                                                    <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 text-xs flex items-center justify-center font-bold">{i + 1}</span>
                                                    {p.name}
                                                </td>
                                                <td className="px-6 py-4 text-right font-mono text-slate-700">${p.revenue.toFixed(2)}</td>
                                                <td className="px-6 py-4 text-right text-slate-700">{p.quantity}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Product Modal (Create/Edit) */}
            <AnimatePresence>
                {isProductModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                                <h3 className="text-xl font-bold text-slate-800">{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
                                <button onClick={closeProductModal}><X className="h-6 w-6 text-slate-400" /></button>
                            </div>
                            <form onSubmit={handleSaveProduct} className="p-6 space-y-4">
                                <div><label className="block text-sm font-medium mb-1">Name</label><input type="text" name="name" value={productFormData.name} onChange={handleFormChange} required className="w-full px-4 py-2 rounded-xl border border-slate-200" /></div>
                                <div><label className="block text-sm font-medium mb-1">Category</label>
                                    <select name="category" value={productFormData.category} onChange={handleFormChange} className="w-full px-4 py-2 rounded-xl border border-slate-200">
                                        <option value="Electronics">Electronics</option>
                                        <option value="Fashion">Fashion</option>
                                        <option value="Home">Home & Living</option>
                                        <option value="Accessories">Accessories</option>
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div><label className="block text-sm font-medium mb-1">Price</label><input type="number" step="0.01" name="price" value={productFormData.price} onChange={handleFormChange} required className="w-full px-4 py-2 rounded-xl border border-slate-200" /></div>
                                    <div><label className="block text-sm font-medium mb-1">Stock</label><input type="number" name="stock" value={productFormData.stock} onChange={handleFormChange} required className="w-full px-4 py-2 rounded-xl border border-slate-200" /></div>
                                </div>
                                <div><label className="block text-sm font-medium mb-1">Description</label><textarea name="description" value={productFormData.description} onChange={handleFormChange} className="w-full px-4 py-2 rounded-xl border border-slate-200" rows="3"></textarea></div>
                                <div className="flex justify-end gap-3 mt-6">
                                    <button type="button" onClick={closeProductModal} className="px-4 py-2 text-slate-600 font-medium">Cancel</button>
                                    <button type="submit" disabled={updateLoading} className="px-6 py-2 bg-primary text-white rounded-xl font-bold hover:bg-blue-700 flex items-center gap-2">
                                        {updateLoading ? <Loader className="animate-spin h-5 w-5" /> : <Save className="h-5 w-5" />} Save Product
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default AdminDashboard
