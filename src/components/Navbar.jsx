import { Link, useNavigate, useLocation } from 'react-router-dom'
import { ShoppingCart, User, Menu, X, Search } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import logoImg from '../assets/videos/images/logo.jpeg'
import { motion, AnimatePresence } from 'framer-motion'

import SidePanel from './SidePanel'

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isSidePanelOpen, setIsSidePanelOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)
    const { user, signOut, isAdmin } = useAuth()
    const { getCartCount } = useCart()
    const navigate = useNavigate();

    const location = useLocation();

    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const isHome = location.pathname === '/';

    const handleLogout = async () => {
        try {
            await signOut();
            navigate('/login');
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'Shop', path: '/products' },
        { name: 'Categories', path: '/categories' },
    ]

    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ type: 'spring', stiffness: 100, damping: 20 }}
            className={`fixed top-0 w-full z-50 transition-all duration-300 border-b border-transparent ${scrolled || !isHome ? 'bg-white/80 backdrop-blur-md shadow-sm border-slate-200/50' : 'bg-transparent text-white'
                }`}
        >
            <div className="container mx-auto px-4 h-24 flex items-center justify-between">
                {/* Logo Area - Text Only, Larger */}
                <Link to="/" className="flex items-center space-x-3 group">
                    <span className={`text-3xl font-bold font-sans tracking-tight transition-colors ${scrolled || !isHome ? 'text-slate-900' : 'text-white'}`}>
                        Modern<span className="text-primary">Shop</span>
                    </span>
                </Link>

                {/* Desktop Navigation - Larger Text & Contrast Hover */}
                <div className="hidden md:flex items-center space-x-8">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            to={link.path}
                            className={`relative px-4 py-2 rounded-lg font-semibold text-lg tracking-wide transition-all 
                                ${scrolled || !isHome
                                    ? 'text-slate-700 hover:bg-slate-100 hover:text-primary'
                                    : 'text-slate-100 hover:bg-white/10 hover:text-white'
                                }`}
                        >
                            {link.name}
                        </Link>
                    ))}
                    {isAdmin && (
                        <Link
                            to="/admin/dashboard"
                            className={`relative px-4 py-2 rounded-lg font-semibold text-lg tracking-wide transition-all 
                                ${scrolled || !isHome
                                    ? 'text-slate-700 hover:bg-slate-100 hover:text-primary'
                                    : 'text-slate-100 hover:bg-white/10 hover:text-white'
                                }`}
                        >
                            Dashboard
                        </Link>
                    )}
                </div>

                {/* Right Actions - Larger Icons & Buttons */}
                <div className="hidden md:flex items-center space-x-6">
                    {/* Search */}
                    <div className="relative group">
                        <button className={`p-3 rounded-full transition-colors ${scrolled || !isHome ? 'hover:bg-slate-100 text-slate-700' : 'hover:bg-white/10 text-white'}`}>
                            <Search className="h-6 w-6" />
                        </button>
                    </div>

                    {/* Cart */}
                    <Link to="/cart" className="relative group">
                        <div className={`p-3 rounded-full transition-colors ${scrolled || !isHome ? 'hover:bg-slate-100 text-slate-700' : 'hover:bg-white/10 text-white'}`}>
                            <ShoppingCart className="h-6 w-6" />
                            {getCartCount() > 0 && (
                                <span className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center bg-red-500 rounded-full text-white text-xs font-bold ring-2 ring-white">
                                    {getCartCount()}
                                </span>
                            )}
                        </div>
                    </Link>

                    {/* User Auth */}
                    {user ? (
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => setIsSidePanelOpen(true)}
                                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                            >
                                {user.user_metadata?.avatar_url ? (
                                    <img
                                        src={user.user_metadata.avatar_url}
                                        alt={user.user_metadata.full_name || 'User'}
                                        className="h-8 w-8 rounded-full border border-slate-200"
                                    />
                                ) : (
                                    <div className={`h-8 w-8 rounded-full flex items-center justify-center ${scrolled || !isHome ? 'bg-slate-100 text-slate-600' : 'bg-white/20 text-white'}`}>
                                        <User className="h-5 w-5" />
                                    </div>
                                )}
                                <span className={`font-medium hidden lg:block ${scrolled || !isHome ? 'text-slate-700' : 'text-white'}`}>
                                    {user.user_metadata?.full_name || 'User'}
                                </span>
                            </button>

                            <SidePanel isOpen={isSidePanelOpen} onClose={() => setIsSidePanelOpen(false)} />
                        </div>
                    ) : (
                        <Link to="/login">
                            <motion.button
                                whileHover={{ scale: 1.05, translateY: -1 }}
                                whileTap={{ scale: 0.95, translateY: 1 }}
                                className="bg-gradient-to-b from-blue-500 to-blue-600 text-white px-8 py-3 rounded-full font-bold text-lg shadow-[0_4px_0_rgb(29,78,216),0_4px_10px_rgba(0,0,0,0.2)] active:shadow-none transition-all border-t border-blue-400"
                            >
                                Sign In
                            </motion.button>
                        </Link>
                    )}
                </div>

                {/* Mobile Menu Button - Larger */}
                <button
                    className={`md:hidden p-3 rounded-xl transition-colors ${scrolled || !isHome ? 'text-slate-800 hover:bg-slate-100' : 'text-white hover:bg-white/10'}`}
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    {isMenuOpen ? <X className="h-8 w-8" /> : <Menu className="h-8 w-8" />}
                </button>
            </div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-white border-t border-slate-100 overflow-hidden shadow-xl"
                    >
                        <div className="p-4 space-y-4">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    to={link.path}
                                    className="block px-6 py-4 rounded-xl hover:bg-slate-100 text-slate-800 font-bold text-xl"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    {link.name}
                                </Link>
                            ))}
                            {isAdmin && (
                                <Link
                                    to="/admin/dashboard"
                                    className="block px-6 py-4 rounded-xl hover:bg-slate-100 text-slate-800 font-bold text-xl"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    Dashboard
                                </Link>
                            )}
                            <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-4">
                                <Link to="/cart" className="flex items-center justify-center space-x-2 p-4 rounded-xl bg-slate-50 text-slate-800 font-bold text-lg">
                                    <ShoppingCart className="h-6 w-6" />
                                    <span>Cart {getCartCount() > 0 && `(${getCartCount()})`}</span>
                                </Link>
                                {user ? (
                                    <>
                                        <div className="flex items-center justify-center gap-3 p-4 rounded-xl bg-slate-50">
                                            {user.user_metadata?.avatar_url ? (
                                                <img
                                                    src={user.user_metadata.avatar_url}
                                                    alt={user.user_metadata.full_name}
                                                    className="h-10 w-10 rounded-full"
                                                />
                                            ) : (
                                                <User className="h-6 w-6 text-slate-500" />
                                            )}
                                            <span className="font-semibold text-slate-700">{user.user_metadata?.full_name || 'User'}</span>
                                        </div>
                                        <button
                                            onClick={() => {
                                                handleLogout();
                                                setIsMenuOpen(false);
                                            }}
                                            className="flex items-center justify-center p-4 rounded-xl bg-slate-100 text-slate-800 font-bold text-lg hover:bg-slate-200"
                                        >
                                            Logout
                                        </button>
                                    </>
                                ) : ( // ... existing sign in button ...
                                    <Link to="/login" className="flex items-center justify-center p-4 rounded-xl bg-primary text-white font-bold text-lg">
                                        Sign In
                                    </Link>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.nav>
    )
}

export default Navbar
