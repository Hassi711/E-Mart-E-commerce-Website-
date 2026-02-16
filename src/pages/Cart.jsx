import { useCart } from '../context/CartContext'
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

const Cart = () => {
    const { cartItems, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart()
    const subtotal = getCartTotal()
    const tax = subtotal * 0.1 // 10% tax
    const total = subtotal + tax

    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen pt-24 px-4 flex flex-col items-center justify-center bg-slate-50">
                <div className="bg-white p-12 rounded-3xl shadow-sm text-center max-w-md w-full border border-slate-100">
                    <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 text-primary">
                        <ShoppingBag className="h-10 w-10" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Your cart is empty</h2>
                    <p className="text-slate-500 mb-8">Looks like you haven't added anything to your cart yet.</p>
                    <Link to="/products" className="inline-flex items-center justify-center w-full px-6 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-primary transition-colors">
                        Start Shopping <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen pt-24 pb-12 bg-slate-50">
            <div className="container mx-auto px-4">
                <h1 className="text-3xl font-bold text-slate-900 mb-8">Shopping Cart</h1>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Cart Items */}
                    <div className="lg:w-2/3 space-y-4">
                        {cartItems.map((item) => (
                            <motion.div
                                key={item.id}
                                layout
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 hover:border-blue-100 transition-colors"
                            >
                                <div className="h-24 w-24 flex-shrink-0 bg-slate-100 rounded-xl overflow-hidden">
                                    {item.images && item.images[0] ? (
                                        <img src={item.images[0]} alt={item.name} className="h-full w-full object-cover mix-blend-multiply" />
                                    ) : (
                                        <div className="h-full w-full flex items-center justify-center text-slate-400 text-xs">No Img</div>
                                    )}
                                </div>

                                <div className="flex-grow">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-bold text-slate-900 line-clamp-1">{item.name}</h3>
                                            <p className="text-sm text-slate-500">{item.category_id ? 'Product' : 'Item'}</p>
                                        </div>
                                        <button
                                            onClick={() => removeFromCart(item.id)}
                                            className="text-slate-400 hover:text-red-500 transition-colors p-2"
                                            aria-label="Remove item"
                                        >
                                            <Trash2 className="h-5 w-5" />
                                        </button>
                                    </div>

                                    <div className="flex justify-between items-center mt-4">
                                        <div className="flex items-center space-x-3 bg-slate-50 rounded-lg p-1">
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                className="h-8 w-8 flex items-center justify-center bg-white rounded-md shadow-sm text-slate-600 hover:bg-slate-100 hover:text-primary transition-colors disabled:opacity-50"
                                            >
                                                <Minus className="h-4 w-4" />
                                            </button>
                                            <span className="font-bold text-slate-900 w-4 text-center">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                className="h-8 w-8 flex items-center justify-center bg-white rounded-md shadow-sm text-slate-600 hover:bg-slate-100 hover:text-primary transition-colors"
                                            >
                                                <Plus className="h-4 w-4" />
                                            </button>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-bold text-slate-900">${(item.price * item.quantity).toFixed(2)}</p>
                                            {item.quantity > 1 && (
                                                <p className="text-xs text-slate-500">${parseFloat(item.price).toFixed(2)} each</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Order Summary */}
                    <div className="lg:w-1/3">
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 sticky top-28">
                            <h2 className="text-xl font-bold text-slate-900 mb-6">Order Summary</h2>

                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between text-slate-600">
                                    <span>Subtotal</span>
                                    <span className="font-medium">${subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-slate-600">
                                    <span>Tax (10%)</span>
                                    <span className="font-medium">${tax.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-slate-600">
                                    <span>Shipping</span>
                                    <span className="text-green-600 font-medium">Free</span>
                                </div>
                                <div className="h-px bg-slate-100 my-4" />
                                <div className="flex justify-between text-slate-900 text-xl font-bold">
                                    <span>Total</span>
                                    <span>${total.toFixed(2)}</span>
                                </div>
                            </div>

                            <Link to="/checkout" className="block w-full">
                                <button className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold text-lg hover:bg-primary transition-colors shadow-lg shadow-blue-900/10 active:scale-[0.98] transition-transform">
                                    Proceed to Checkout
                                </button>
                            </Link>

                            <button
                                onClick={clearCart}
                                className="w-full mt-4 py-2 text-slate-400 text-sm font-medium hover:text-red-500 transition-colors"
                            >
                                Clear Cart
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Cart
