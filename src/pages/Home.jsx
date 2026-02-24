import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Store, Package, BarChart3 } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import InfiniteMarquee from 'vanilla-infinite-marquee';
import IsetaLogo from '../assets/iseta_logo.svg';

function Home() {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    const fadeInUp = {
        initial: { opacity: 0, y: 60 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.6 }
    };

    const staggerContainer = {
        animate: {
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    useEffect(() => {
        new InfiniteMarquee({
            element: '.marquee-container',
            speed: 150000,
            smoothEdges: true,
            direction: 'left',
            gap: '120px',
            duplicateCount: 3,
            mobileSettings: {
                direction: 'left',
                speed: 80000
            },
            on: {
                beforeInit: () => {
                    console.log('Not Yet Initialized');
                },

                afterInit: () => {
                    console.log('Initialized');
                }
            }
        });
    }, []);

    return (
        <div className="min-h-screen overflow-hidden" style={{ backgroundColor: '#EEEEEE' }}>
            {/* Navigation */}
            <motion.nav
                className="fixed top-0 left-0 right-0 z-50 border-b border-gray-200 backdrop-blur-xl"
                style={{ backgroundColor: 'rgba(238, 238, 238, 0.9)' }}
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link to="/" className="text-2xl font-bold">
                        <img src={IsetaLogo} alt="Iseta" className="h-6" />
                    </Link>
                    <div className="flex items-center gap-3">
                        <Link
                            to="/login"
                            className="px-6 py-2 rounded-full hover:text-gray-900 transition-all duration-300 text-sm font-semibold"
                            style={{ color: '#00804C' }}
                        >
                            Sign in
                        </Link>
                        <Link
                            to="/signup"
                            className="px-6 py-2 rounded-full text-white border-2 border-transparent hover:border-[#00804C] transition-all duration-300 text-sm font-semibold"
                            style={{ backgroundColor: '#00804C' }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                                e.currentTarget.style.color = '#00804C';
                                e.currentTarget.style.borderColor = '#00804C';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = '#00804C';
                                e.currentTarget.style.color = 'white';
                                e.currentTarget.style.borderColor = 'transparent';
                            }}
                        >
                            Sign up
                        </Link>
                    </div>
                </div>
            </motion.nav>

            {/* Hero Section */}
            <section className="relative max-w-7xl mx-auto px-6 py-12 md:py-20 mt-[73px]">
                <motion.div
                    className="text-center"
                    variants={staggerContainer}
                    initial="initial"
                    animate="animate"
                >
                    {/* Pill Badge */}
                    <motion.div
                        {...fadeInUp}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8"
                    >
                        <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#00804C' }}></span>
                        <span className="text-sm font-medium" style={{ color: '#00804C' }}>Built for Rwandan entrepreneurs</span>
                    </motion.div>

                    {/* Main Headline */}
                    <motion.h1
                        {...fadeInUp}
                        className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight"
                        style={{ lineHeight: '1.1' }}
                    >
                        Sell smarter with your<br />
                        <span className="text-gray-900">online store</span>
                    </motion.h1>

                    {/* Subheadline */}
                    <motion.p
                        {...fadeInUp}
                        className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed"
                    >
                        Transform your Instagram hustle into a professional online business.
                        Track inventory, get paid faster, grow effortlessly.
                    </motion.p>

                    {/* CTA Button */}
                    <motion.div
                        {...fadeInUp}
                        className="flex justify-center items-center mb-4"
                    >
                        <Link
                            to="/signup"
                            className="group flex items-center justify-center gap-2 px-8 py-3 text-center text-white duration-200 border-2 rounded-full hover:bg-transparent focus:outline-none text-lg font-semibold"
                            style={{
                                backgroundColor: '#00804C',
                                borderColor: '#00804C'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                                e.currentTarget.style.color = '#00804C';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = '#00804C';
                                e.currentTarget.style.color = 'white';
                            }}
                        >
                            Get started
                            <svg
                                className="w-8 h-8 justify-end group-hover:rotate-90 group-hover:bg-transparent ease-linear duration-300 rounded-full border border-white group-hover:border-[#00804C] p-2 rotate-45"
                                viewBox="0 0 16 19"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M7 18C7 18.5523 7.44772 19 8 19C8.55228 19 9 18.5523 9 18H7ZM8.70711 0.292893C8.31658 -0.0976311 7.68342 -0.0976311 7.29289 0.292893L0.928932 6.65685C0.538408 7.04738 0.538408 7.68054 0.928932 8.07107C1.31946 8.46159 1.95262 8.46159 2.34315 8.07107L8 2.41421L13.6569 8.07107C14.0474 8.46159 14.6805 8.46159 15.0711 8.07107C15.4616 7.68054 15.4616 7.04738 15.0711 6.65685L8.70711 0.292893ZM9 18L9 1H7L7 18H9Z"
                                    className="fill-white group-hover:fill-[#00804C]"
                                ></path>
                            </svg>
                        </Link>
                    </motion.div>
                </motion.div>
            </section>

            {/* Logo Marquee */}
            <section className="relative py-12 pb-20 border-b border-gray-200" style={{ backgroundColor: '#EEEEEE' }}>
                <div className="max-w-7xl mx-auto px-6 text-center mb-12">
                    <p className="text-sm text-gray-900 uppercase tracking-wider font-semibold">Trusted by sellers from</p>
                </div>
                <div className="marquee-container overflow-hidden flex" style={{ width: '100%' }}>
                    {['Kigali', 'Nyarugenge', 'Gasabo', 'Kicukiro', 'Musanze', 'Huye', 'Rubavu', 'Rusizi', 'Nyagatare', 'Rwamagana'].map((city, i) => (
                        <div key={i} className="text-4xl font-bold text-gray-900 mx-4 whitespace-nowrap">
                            {city}
                        </div>
                    ))}
                </div>
            </section >

            {/* Features Grid */}
            < section className="relative px-6 py-32 rounded-t-3xl" style={{ backgroundColor: '#00804C' }
            }>
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-4xl md:text-6xl font-bold text-white">
                            Everything your business<br />needs to grow
                        </h2>
                    </motion.div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {[
                            {
                                icon: Store,
                                title: 'Instant Store',
                                desc: 'Get yourstore.iseta.rw in 5 minutes. Share it everywhere.',
                                gradient: '',
                                border: 'border-gray-200'
                            },
                            {
                                icon: Package,
                                title: 'Smart Inventory',
                                desc: 'Auto-track stock. Get alerts before you run out.',
                                gradient: '',
                                border: 'border-gray-200'
                            },
                            {
                                icon: FaWhatsapp,
                                title: 'WhatsApp Magic',
                                desc: 'Customers click → WhatsApp opens with product details ready.',
                                gradient: '',
                                border: 'border-gray-200'
                            },
                            {
                                icon: BarChart3,
                                title: 'Real Analytics',
                                desc: 'See what sells. Track revenue. Make smart decisions.',
                                gradient: '',
                                border: 'border-gray-200'
                            },
                        ].map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                whileHover={{
                                    scale: 1.02,
                                    borderColor: 'rgba(220, 220, 220, 0.96)',
                                    transition: { duration: 0.3 }
                                }}
                                className="group rounded-2xl p-8 border border-white cursor-pointer"
                                style={{
                                    backgroundColor: 'transparent',
                                    backdropFilter: 'blur(10px)'
                                }}
                            >
                                <div className="mb-6 inline-block p-4 rounded-2xl bg-white">
                                    <feature.icon className="w-8 h-8" style={{ color: '#00804C' }} strokeWidth={2} />
                                </div>
                                <h3 className="text-xl font-bold mb-3 text-white">{feature.title}</h3>
                                <p className="text-white leading-relaxed text-sm">{feature.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section >

            {/* How It Works Timeline */}
            < section className="relative py-32 border-y border-gray-200 bg-gray-50" >
                <div className="max-w-5xl mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="text-center mb-20"
                    >
                        <h2 className="text-4xl md:text-6xl font-bold mb-4">
                            From zero to selling in 3 steps
                        </h2>
                        <p className="text-xl text-gray-600">Launch your store today, not next month</p>
                    </motion.div>

                    <div className="space-y-12">
                        {[
                            {
                                step: '01',
                                title: 'Create your store',
                                desc: 'Sign up with your phone. Add business name. Done in 2 minutes.',
                                color: 'gray-900'
                            },
                            {
                                step: '02',
                                title: 'Add products',
                                desc: 'Upload photos from your gallery. Set prices. Add stock.',
                                color: 'gray-900'
                            },
                            {
                                step: '03',
                                title: 'Start selling',
                                desc: 'Share your link on Instagram. Get orders on WhatsApp. Grow your business.',
                                color: 'gray-900'
                            },
                        ].map((item, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -60 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: index * 0.2 }}
                                className="flex items-start gap-6 group"
                            >
                                <div className="flex-shrink-0">
                                    <div className="w-20 h-20 rounded-2xl bg-white border border-gray-200 flex items-center justify-center text-2xl font-bold text-gray-900 group-hover:scale-110 transition-transform duration-300">
                                        {item.step}
                                    </div>
                                </div>
                                <div className="pt-2">
                                    <h3 className="text-2xl font-bold mb-2">{item.title}</h3>
                                    <p className="text-gray-600 text-lg">{item.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section >

            {/* Pricing Section */}
            < section className="relative max-w-7xl mx-auto px-6 py-32" >
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl md:text-6xl font-bold mb-4">
                        Transparent pricing
                    </h2>
                    <p className="text-xl text-gray-600">Start free. Upgrade when you're ready.</p>
                </motion.div>

                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {/* Free Plan */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="rounded-3xl p-8 border border-gray-200 bg-transparent"
                    >
                        <h3 className="text-2xl font-bold mb-2">Starter</h3>
                        <div className="mb-6">
                            <span className="text-5xl font-bold">Free</span>
                            <span className="text-gray-500 ml-2">forever</span>
                        </div>
                        <ul className="space-y-3 mb-8">
                            {['10 products', 'Basic analytics', 'WhatsApp integration', 'Mobile optimized'].map((feature, i) => (
                                <li key={i} className="flex items-center gap-3 text-gray-700">
                                    <span className="text-gray-900">✓</span>
                                    {feature}
                                </li>
                            ))}
                        </ul>
                        <Link
                            to="/signup"
                            className="block w-full py-3 rounded-full border-2 text-center font-semibold transition-all duration-300"
                            style={{
                                backgroundColor: 'transparent',
                                borderColor: '#00804C',
                                color: '#00804C'
                            }}
                        >
                            Get started
                        </Link>
                    </motion.div>

                    {/* Pro Plan */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="rounded-3xl p-8 border border-gray-300 relative overflow-hidden bg-transparent"
                    >
                        <div className="absolute top-4 right-4 px-3 py-1 rounded-full text-white text-xs font-bold" style={{ backgroundColor: '#00804C' }}>
                            POPULAR
                        </div>
                        <h3 className="text-2xl font-bold mb-2">Pro</h3>
                        <div className="mb-6">
                            <span className="text-5xl font-bold">5,000</span>
                            <span className="text-gray-500 ml-2">RWF/month</span>
                        </div>
                        <ul className="space-y-3 mb-8">
                            {['Starter features plus', 'Unlimited products', 'Advanced analytics', 'Priority support'].map((feature, i) => (
                                <li key={i} className="flex items-center gap-3 text-gray-700">
                                    <span className="text-gray-900">✓</span>
                                    {feature}
                                </li>
                            ))}
                        </ul>
                        <Link
                            to="/signup"
                            className="block w-full py-3 rounded-full text-white text-center font-semibold border-2 border-transparent transition-all duration-300"
                            style={{ backgroundColor: '#00804C' }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                                e.currentTarget.style.color = '#00804C';
                                e.currentTarget.style.borderColor = '#00804C';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = '#00804C';
                                e.currentTarget.style.color = 'white';
                                e.currentTarget.style.borderColor = 'transparent';
                            }}
                        >
                            Start free trial
                        </Link>
                    </motion.div>
                </div>
            </section >

            {/* Final CTA */}
            < section className="relative py-32" style={{ backgroundColor: '#0A0F11' }
            }>
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <h2 className="text-5xl md:text-7xl font-bold mb-6 text-white">
                            Ready to grow?
                        </h2>
                        <p className="text-2xl text-gray-400 mb-12">
                            Join Rwandan entrepreneurs building their online businesses
                        </p>
                        <Link
                            to="/signup"
                            className="inline-block px-12 py-5 text-black rounded-full text-xl font-bold border-2 border-transparent transition-all duration-300"
                            style={{ backgroundColor: 'white' }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                                e.currentTarget.style.color = 'white';
                                e.currentTarget.style.borderColor = 'white';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'white';
                                e.currentTarget.style.color = 'black';
                                e.currentTarget.style.borderColor = 'transparent';
                            }}
                        >
                            Start today
                        </Link>

                    </motion.div>
                </div>
            </section >

            {/* Footer */}
            < footer className="relative border-t border-gray-800 py-12" style={{ backgroundColor: '#0A0F11' }}>
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="text-2xl font-bold">
                            <img src={IsetaLogo} alt="Iseta" className="h-8 brightness-0 invert" />
                        </div>
                        <p className="text-sm text-gray-500">
                            © 2026 Iseta.
                        </p>
                        <div className="flex gap-6">
                            <Link to="/terms" className="text-sm text-gray-400 hover:text-white transition-colors">
                                Terms
                            </Link>
                            <Link to="/privacy" className="text-sm text-gray-400 hover:text-white transition-colors">
                                Privacy
                            </Link>
                        </div>
                    </div>
                </div>
            </footer >
        </div >
    );
}

export default Home;
