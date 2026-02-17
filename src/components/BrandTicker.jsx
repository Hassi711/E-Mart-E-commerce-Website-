import { motion } from "framer-motion";

const brands = [
    { name: "TechGiant", logo: "https://LOGO_URL_PLACEHOLDER/techgiant" }, // Using text for now as placeholders
    { name: "FashionNova", logo: "" },
    { name: "HomeStyle", logo: "" },
    { name: "GadgetWorld", logo: "" },
    { name: "UrbanWear", logo: "" },
    { name: "LifeStore", logo: "" },
    { name: "GreenEarth", logo: "" },
    { name: "SkyHigh", logo: "" },
];

const BrandTicker = () => {
    return (
        <section className="py-12 bg-slate-900 text-white overflow-hidden relative border-y-4 border-blue-900/50">
            {/* Background Gradient for depth */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-900 via-slate-900 to-blue-900 opacity-90 pointer-events-none"></div>

            <div className="container mx-auto px-4 mb-10 text-center relative z-20">
                <p className="text-sm md:text-base font-extrabold text-cyan-400 uppercase tracking-[0.3em] mb-4 drop-shadow-[0_0_8px_rgba(34,211,238,0.6)] animate-pulse">Trusted by Industry Leaders</p>
                <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent mx-auto"></div>
            </div>

            <div className="flex relative z-10">
                <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-slate-900 to-transparent z-20"></div>
                <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-slate-900 to-transparent z-20"></div>

                <motion.div
                    className="flex gap-20 items-center flex-nowrap whitespace-nowrap"
                    animate={{ x: "-50%" }}
                    transition={{
                        repeat: Infinity,
                        ease: "linear",
                        duration: 40
                    }}
                >
                    {[...brands, ...brands, ...brands].map((brand, index) => (
                        <div key={index} className="text-3xl md:text-4xl font-bold text-blue-200/50 hover:text-white transition-all duration-500 cursor-pointer select-none tracking-tighter hover:scale-110 filter drop-shadow-lg">
                            {brand.name}
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    )
}

export default BrandTicker
