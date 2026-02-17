import { Star, Quote } from 'lucide-react'

const testimonials = [
    {
        name: 'Sarah Johnson',
        role: 'Verified Buyer',
        content: "Absolutely love the quality! The delivery was super fast and the packaging was premium. Will definitely shop here again.",
        rating: 5,
        image: "https://randomuser.me/api/portraits/women/1.jpg"
    },
    {
        name: 'Michael Chen',
        role: 'Tech Enthusiast',
        content: "Great selection of gadgets. The prices are competitive and the customer service team was very helpful with my queries.",
        rating: 5,
        image: "https://randomuser.me/api/portraits/men/2.jpg"
    },
    {
        name: 'Emma Davis',
        role: 'Interior Designer',
        content: "Found some amazing pieces for my home. The 'Shop by Look' feature is a game changer for inspiration.",
        rating: 4,
        image: "https://randomuser.me/api/portraits/women/3.jpg"
    }
]

const Testimonials = () => {
    return (
        <section className="py-20 bg-white">
            <div className="container mx-auto px-4">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <span className="text-blue-600 font-bold tracking-wider uppercase text-sm">Testimonials</span>
                    <h2 className="text-3xl md:text-4xl font-bold mt-2 text-slate-900">What Our Customers Say</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {testimonials.map((testimonial, index) => (
                        <div key={index} className="bg-white p-8 rounded-3xl shadow-sm hover:shadow-xl transition-shadow duration-300 relative group">
                            <Quote className="absolute top-8 right-8 w-10 h-10 text-slate-100 group-hover:text-blue-50 transition-colors" />

                            <div className="flex gap-1 mb-6 text-yellow-400">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className={`w-5 h-5 ${i < testimonial.rating ? 'fill-current' : 'text-slate-200'}`} />
                                ))}
                            </div>

                            <p className="text-slate-600 mb-8 leading-relaxed relative z-10">"{testimonial.content}"</p>

                            <div className="flex items-center gap-4">
                                <img
                                    src={testimonial.image}
                                    alt={testimonial.name}
                                    className="w-12 h-12 rounded-full object-cover ring-2 ring-white shadow-md"
                                />
                                <div>
                                    <h4 className="font-bold text-slate-900">{testimonial.name}</h4>
                                    <p className="text-xs text-slate-400 font-medium">{testimonial.role}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default Testimonials
