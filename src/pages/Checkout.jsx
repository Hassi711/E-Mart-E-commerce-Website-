import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { Loader, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

const Checkout = () => {
    const { cartItems, getCartTotal, clearCart } = useCart()
    const { user } = useAuth()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [formData, setFormData] = useState({
        fullName: '',
        address: '',
        city: '',
        zipCode: '',
        country: ''
    })

    const total = getCartTotal() * 1.1 // Including tax

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        if (!user) {
            setError('You must be logged in to place an order.')
            setLoading(false)
            return
        }

        if (cartItems.length === 0) {
            setError('Your cart is empty.')
            setLoading(false)
            return
        }

        try {
            // Prepare items for RPC function
            const itemsJson = cartItems.map(item => ({
                product_id: item.id,
                quantity: item.quantity
            }))

            const shippingAddress = formData

            const { data, error } = await supabase.rpc('create_order_with_items', {
                items_json: itemsJson,
                shipping_address: shippingAddress
            })

            if (error) throw error

            // Order successful
            clearCart()
            navigate('/orders')
        } catch (err) {
            console.error('Error placing order:', err)
            setError(err.message || 'Failed to place order. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    if (cartItems.length === 0) {
        navigate('/cart')
        return null
    }

    return (
        <div className="min-h-screen pt-24 pb-12 bg-slate-50">
            <div className="container mx-auto px-4 max-w-4xl">
                <Link to="/cart" className="inline-flex items-center text-slate-500 hover:text-slate-900 mb-8 transition-colors">
                    <ArrowLeft className="h-4 w-4 mr-2" /> Back to Cart
                </Link>

                <div className="flex flex-col md:flex-row gap-8">
                    {/* Checkout Form */}
                    <div className="md:w-2/3">
                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                            <h2 className="text-2xl font-bold text-slate-900 mb-6">Shipping Details</h2>

                            {error && (
                                <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-2 border border-red-100">
                                    <AlertCircle className="h-5 w-5" />
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
                                    <input
                                        type="text"
                                        name="fullName"
                                        required
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                        placeholder="John Doe"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Address</label>
                                    <input
                                        type="text"
                                        name="address"
                                        required
                                        value={formData.address}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                        placeholder="123 Main St"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">City</label>
                                        <input
                                            type="text"
                                            name="city"
                                            required
                                            value={formData.city}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                            placeholder="New York"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">ZIP Code</label>
                                        <input
                                            type="text"
                                            name="zipCode"
                                            required
                                            value={formData.zipCode}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                            placeholder="10001"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Country</label>
                                    <input
                                        type="text"
                                        name="country"
                                        required
                                        value={formData.country}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                        placeholder="United States"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold text-lg hover:bg-primary transition-colors shadow-lg shadow-blue-900/10 active:scale-[0.98] transform flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <Loader className="animate-spin h-5 w-5" />
                                    ) : (
                                        <>
                                            Place Order <CheckCircle className="h-5 w-5" />
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Order Summary Preview */}
                    <div className="md:w-1/3">
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 sticky top-28">
                            <h3 className="text-lg font-bold text-slate-900 mb-4">Order Summary</h3>
                            <div className="space-y-3 mb-4 max-h-60 overflow-y-auto pr-2">
                                {cartItems.map(item => (
                                    <div key={item.id} className="flex justify-between text-sm">
                                        <span className="text-slate-600 truncate flex-1 mr-2">{item.quantity}x {item.name}</span>
                                        <span className="font-medium text-slate-900">${(item.price * item.quantity).toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="h-px bg-slate-100 my-4" />
                            <div className="flex justify-between text-slate-900 font-bold text-xl">
                                <span>Total</span>
                                <span>${total.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Checkout
