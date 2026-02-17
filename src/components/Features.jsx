import { Truck, ShieldCheck, Headphones, RotateCcw } from 'lucide-react'

const features = [
    {
        icon: Truck,
        title: 'Global Free Shipping',
        description: 'Experience the joy of free shipping on all orders over $50, delivered swiftly to your doorstep worldwide.'
    },
    {
        icon: ShieldCheck,
        title: '100% Secure Payments',
        description: 'Shop with complete peace of mind. Our encrypted payment gateways ensure your data is always protected.'
    },
    {
        icon: RotateCcw,
        title: 'Hassle-Free Returns',
        description: 'Not perfectly satisfied? No problem. Enjoy our easy, no-questions-asked 30-day return policy.'
    },
    {
        icon: Headphones,
        title: '24/7 Premium Support',
        description: 'Our dedicated team of experts is available around the clock to assist you with any inquiries.'
    }
]

const Features = () => {
    return (
        <section className="py-24 bg-white relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute top-0 right-0 w-1/3 h-full bg-slate-50 skew-x-12 opacity-50 pointer-events-none"></div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <span className="text-blue-600 font-bold tracking-wider uppercase text-sm mb-2 block">Our Promise to You</span>
                    <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 leading-tight">
                        Why We Are The <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">Best Choice</span>
                    </h2>
                    <p className="text-lg text-slate-600 leading-relaxed">
                        We don't just sell products; we deliver an exceptional experience. Here is how we distinguish ourselves from the rest, ensuring you get nothing but the best.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="bg-white p-8 rounded-3xl border border-slate-100 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_-10px_rgba(59,130,246,0.15)] hover:-translate-y-2 transition-all duration-300 group"
                        >
                            <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                                <feature.icon className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors">{feature.title}</h3>
                            <p className="text-slate-500 leading-relaxed text-sm">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default Features
