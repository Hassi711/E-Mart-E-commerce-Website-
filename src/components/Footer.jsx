import { Facebook, Twitter, Instagram, Mail, MapPin, Phone } from 'lucide-react'
import { Link } from 'react-router-dom'

const Footer = () => {
    return (
        <footer className="bg-slate-900 text-slate-300 pt-16 pb-8">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    {/* Brand Section */}
                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold text-white font-sans">ModernShop</h2>
                        <p className="text-sm leading-relaxed">
                            Your one-stop destination for premium electronics, fashion, and lifestyle products. We deliver quality directly to your doorstep.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-6">Quick Links</h3>
                        <ul className="space-y-3">
                            <li><Link to="/" className="hover:text-primary transition-colors">Home</Link></li>
                            <li><Link to="/products" className="hover:text-primary transition-colors">Shop All</Link></li>
                            <li><Link to="/categories" className="hover:text-primary transition-colors">Categories</Link></li>
                            <li><Link to="/about" className="hover:text-primary transition-colors">About Us</Link></li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-6">Contact Us</h3>
                        <ul className="space-y-4">
                            <li className="flex items-start space-x-3">
                                <MapPin className="h-5 w-5 text-primary shrink-0" />
                                <span>123 Commerce Blvd,<br />Tech City, TC 90210</span>
                            </li>
                            <li className="flex items-center space-x-3">
                                <Phone className="h-5 w-5 text-primary shrink-0" />
                                <span>+1 (555) 123-4567</span>
                            </li>
                            <li className="flex items-center space-x-3">
                                <Mail className="h-5 w-5 text-primary shrink-0" />
                                <span>support@modernshop.com</span>
                            </li>
                        </ul>
                    </div>

                    {/* Newsletter & Social */}
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-6">Stay Connected</h3>
                        <div className="flex space-x-4 mb-6">
                            <a href="#" className="bg-slate-800 p-2 rounded-full hover:bg-primary transition-colors text-white">
                                <Facebook className="h-5 w-5" />
                            </a>
                            <a href="#" className="bg-slate-800 p-2 rounded-full hover:bg-primary transition-colors text-white">
                                <Twitter className="h-5 w-5" />
                            </a>
                            <a href="#" className="bg-slate-800 p-2 rounded-full hover:bg-primary transition-colors text-white">
                                <Instagram className="h-5 w-5" />
                            </a>
                        </div>
                    </div>
                </div>

                <div className="border-t border-slate-800 pt-8 text-center text-sm">
                    <p>&copy; {new Date().getFullYear()} ModernShop. All rights reserved.</p>
                </div>
            </div>
        </footer>
    )
}

export default Footer
