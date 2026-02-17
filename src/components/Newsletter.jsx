import { useState } from 'react'
import { Send } from 'lucide-react'

const Newsletter = () => {
    const [email, setEmail] = useState('')
    const [status, setStatus] = useState('idle') // idle, loading, success, error

    const handleSubmit = (e) => {
        e.preventDefault()
        setStatus('loading')
        // Simulate API call
        setTimeout(() => {
            setStatus('success')
            setEmail('')
            setTimeout(() => setStatus('idle'), 3000)
        }, 1500)
    }

    return (
        <section className="py-20 bg-slate-900 text-white relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
            <div className="absolute -top-24 -left-24 w-64 h-64 bg-blue-600 rounded-full blur-[100px] opacity-20"></div>
            <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-cyan-500 rounded-full blur-[100px] opacity-20"></div>

            <div className="container mx-auto px-4 relative z-10 text-center">
                <span className="inline-block px-3 py-1 mb-6 text-xs font-bold tracking-wider text-blue-300 uppercase bg-blue-500/10 rounded-full border border-blue-500/20">
                    Stay Updated
                </span>
                <h2 className="text-3xl md:text-5xl font-bold mb-6">
                    Subscribe to our <span className="text-blue-400">Newsletter</span>
                </h2>
                <p className="text-slate-400 mb-10 max-w-2xl mx-auto text-lg">
                    Get the latest updates on new products, exclusive sales, and special offers directly in your inbox. No spam, we promise!
                </p>

                <form onSubmit={handleSubmit} className="max-w-md mx-auto relative flex items-center">
                    <div className="relative w-full">
                        <input
                            type="email"
                            placeholder="Enter your email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full pl-6 pr-16 py-4 rounded-full bg-white/10 border border-white/10 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all backdrop-blur-sm"
                        />
                        <button
                            type="submit"
                            disabled={status === 'loading' || status === 'success'}
                            className={`absolute right-2 top-2 bottom-2 aspect-square rounded-full flex items-center justify-center transition-all duration-300 ${status === 'success' ? 'bg-green-500' : 'bg-blue-600 hover:bg-blue-500'
                                } text-white disabled:opacity-70 disabled:cursor-not-allowed`}
                        >
                            {status === 'loading' ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : status === 'success' ? (
                                <Send className="w-5 h-5 animate-ping" />
                            ) : (
                                <Send className="w-5 h-5" />
                            )}
                        </button>
                    </div>
                </form>

                {status === 'success' && (
                    <p className="mt-4 text-green-400 text-sm font-medium animate-fade-in-up">
                        Thanks for subscribing! Check your inbox soon.
                    </p>
                )}
            </div>
        </section>
    )
}

export default Newsletter
