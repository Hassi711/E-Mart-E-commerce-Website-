import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Package, LogOut, User, Settings, ShoppingBag, CreditCard, ChevronRight } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

const SidePanel = ({ isOpen, onClose }) => {
    const { user, signOut } = useAuth()
    const navigate = useNavigate()
    const [stats, setStats] = useState({
        totalOrders: 0,
        totalSpent: 0,
        deliveredOrders: 0
    })
    const [recentOrders, setRecentOrders] = useState([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (isOpen && user) {
            fetchUserData()
        }
    }, [isOpen, user])

    const fetchUserData = async () => {
        setLoading(true)
        try {
            const { data: orders, error } = await supabase
                .from('orders')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })

            if (error) throw error

            if (orders) {
                const totalOrders = orders.length
                const totalSpent = orders.reduce((sum, order) => sum + (parseFloat(order.total_amount) || 0), 0)
                const deliveredOrders = orders.filter(o => o.status === 'delivered').length

                setStats({
                    totalOrders,
                    totalSpent,
                    deliveredOrders
                })

                setRecentOrders(orders.slice(0, 3))
            }
        } catch (error) {
            console.error("Error fetching user stats:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleLogout = async () => {
        await signOut()
        onClose()
        navigate('/login')
    }

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 z-[60] backdrop-blur-sm"
                    />

                    {/* Side Panel */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed top-0 right-0 h-full w-full sm:w-[400px] bg-white z-[70] shadow-2xl overflow-y-auto"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-slate-100 bg-slate-50/50 sticky top-0 backdrop-blur-md z-10">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-slate-900">My Profile</h2>
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500 hover:text-slate-900"
                                >
                                    <X className="h-6 w-6" />
                                </button>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center border-4 border-white shadow-sm overflow-hidden text-2xl font-bold text-blue-600">
                                    {user?.user_metadata?.avatar_url ? (
                                        <img src={user.user_metadata.avatar_url} alt="Profile" className="h-full w-full object-cover" />
                                    ) : (
                                        user?.email?.[0].toUpperCase()
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-slate-900 truncate text-lg">
                                        {user?.user_metadata?.full_name || 'User'}
                                    </h3>
                                    <p className="text-slate-500 text-sm truncate">{user?.email}</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 space-y-8">
                            {/* Quick Stats */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100">
                                    <p className="text-blue-600 text-xs font-bold uppercase tracking-wider mb-1">Total Spent</p>
                                    <p className="text-2xl font-bold text-slate-900">${stats.totalSpent.toFixed(2)}</p>
                                </div>
                                <div className="p-4 rounded-2xl bg-green-50 border border-green-100">
                                    <p className="text-green-600 text-xs font-bold uppercase tracking-wider mb-1">Delivered</p>
                                    <p className="text-2xl font-bold text-slate-900">{stats.deliveredOrders}</p>
                                </div>
                            </div>

                            {/* Action Menu */}
                            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                                <Link to="/profile" onClick={onClose} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors border-b border-slate-50 group">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-orange-50 text-orange-600 group-hover:bg-orange-100 transition-colors">
                                            <Settings className="h-5 w-5" />
                                        </div>
                                        <span className="font-semibold text-slate-700">Account Settings</span>
                                    </div>
                                    <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-slate-600" />
                                </Link>
                                <Link to="/orders" onClick={onClose} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors border-b border-slate-50 group">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-purple-50 text-purple-600 group-hover:bg-purple-100 transition-colors">
                                            <Package className="h-5 w-5" />
                                        </div>
                                        <span className="font-semibold text-slate-700">My Orders</span>
                                    </div>
                                    <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-slate-600" />
                                </Link>
                            </div>

                            {/* Recent Orders Preview */}
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="font-bold text-slate-900">Recent Orders</h4>
                                    <Link to="/orders" onClick={onClose} className="text-blue-600 text-sm font-semibold hover:text-blue-700">View All</Link>
                                </div>

                                {loading ? (
                                    <div className="space-y-3">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />
                                        ))}
                                    </div>
                                ) : recentOrders.length > 0 ? (
                                    <div className="space-y-3">
                                        {recentOrders.map(order => (
                                            <div key={order.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400">
                                                        <ShoppingBag className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-900 text-sm">#{order.id.slice(0, 8)}</p>
                                                        <p className="text-xs text-slate-500">{new Date(order.created_at).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold text-slate-900 text-sm">${parseFloat(order.total_amount).toFixed(2)}</p>
                                                    <p className={`text-[10px] font-bold uppercase tracking-wider ${order.status === 'delivered' ? 'text-green-600' :
                                                        order.status === 'cancelled' ? 'text-red-500' : 'text-blue-500'
                                                        }`}>{order.status}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                        <p>No recent orders found</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Footer - Logout */}
                        <div className="p-6 border-t border-slate-100 bg-white sticky bottom-0">
                            <button
                                onClick={handleLogout}
                                aria-label="Sign Out"
                                className="w-full flex items-center justify-center gap-2 p-4 rounded-xl bg-red-500 text-white font-bold text-lg shadow-lg shadow-red-100 hover:bg-red-600 hover:shadow-red-200 transform hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all duration-200"
                            >
                                <LogOut className="h-5 w-5" />
                                <span>Sign Out</span>
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>,
        document.body
    )
}

export default SidePanel
